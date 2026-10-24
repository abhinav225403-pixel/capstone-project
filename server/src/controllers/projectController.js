const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all projects with search, filter & pagination
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { search, status, priority, category, page = 1, limit = 10 } = req.query;

    const query = {};

    // Role-based visibility: Admins can see everything, regular users see projects they own or are members of
    if (req.user.role !== 'admin') {
      query.$or = [{ owner: req.user._id }, { members: req.user._id }];
    }

    // Search by name or key
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ name: searchRegex }, { key: searchRegex }, { description: searchRegex }],
      });
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'name email avatar role')
        .populate('members', 'name email avatar role jobTitle')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(query),
    ]);

    // Enhance each project with task counts
    const projectIds = projects.map((p) => p._id);
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    taskStats.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        totalTasks: stat.totalTasks,
        completedTasks: stat.completedTasks,
        progress: stat.totalTasks > 0 ? Math.round((stat.completedTasks / stat.totalTasks) * 100) : 0,
      };
    });

    const enrichedProjects = projects.map((p) => ({
      ...p,
      stats: statsMap[p._id.toString()] || { totalTasks: 0, completedTasks: 0, progress: 0 },
    }));

    res.status(200).json({
      success: true,
      data: enrichedProjects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role jobTitle')
      .populate('members', 'name email avatar role jobTitle');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`,
      });
    }

    // Role check: Admin or member/owner
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this project',
      });
    }

    // Task counts
    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'done' });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        stats: {
          totalTasks,
          completedTasks,
          progress,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, key, description, category, priority, status, members, targetDate, budget } = req.body;

    if (!name || !key) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project name and key.',
      });
    }

    // Ensure user is included in members
    const memberSet = new Set(members || []);
    memberSet.add(req.user._id.toString());

    const project = await Project.create({
      name,
      key: key.toUpperCase(),
      description: description || '',
      category: category || 'Full Stack Development',
      priority: priority || 'medium',
      status: status || 'active',
      owner: req.user._id,
      members: Array.from(memberSet),
      targetDate: targetDate || null,
      budget: budget || 0,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATED_PROJECT',
      entityType: 'project',
      entityId: project._id,
      entityTitle: project.name,
      project: project._id,
      details: `Project '${project.name}' (${project.key}) created`,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner or Admin or Manager)
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`,
      });
    }

    // Ownership check (ICTAK Section 6.6)
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner or an administrator can update this project.',
      });
    }

    const { name, key, description, category, priority, status, members, targetDate, budget } = req.body;

    if (name) project.name = name;
    if (key) project.key = key.toUpperCase();
    if (description !== undefined) project.description = description;
    if (category) project.category = category;
    if (priority) project.priority = priority;
    if (status) project.status = status;
    if (members) project.members = members;
    if (targetDate !== undefined) project.targetDate = targetDate;
    if (budget !== undefined) project.budget = budget;

    await project.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATED_PROJECT',
      entityType: 'project',
      entityId: project._id,
      entityTitle: project.name,
      project: project._id,
      details: `Project '${project.name}' details updated`,
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`,
      });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner or an administrator can delete this project.',
      });
    }

    // Cascade delete associated tasks
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETED_PROJECT',
      entityType: 'project',
      entityId: project._id,
      entityTitle: project.name,
      details: `Project '${project.name}' and all associated tasks deleted`,
    });

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
