const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all tasks with filtering, search, sorting & pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      project,
      status,
      priority,
      assignee,
      type,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (project) {
      query.project = project;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignee) {
      if (assignee === 'unassigned') {
        query.assignee = null;
      } else {
        query.assignee = assignee;
      }
    }

    if (type) {
      query.type = type;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { taskNumber: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignee', 'name email avatar role jobTitle')
        .populate('reporter', 'name email avatar')
        .populate('project', 'name key')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Task.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
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

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar role jobTitle')
      .populate('reporter', 'name email avatar role')
      .populate('project', 'name key')
      .populate('comments.user', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      project: projectId,
      status,
      priority,
      type,
      assignee,
      dueDate,
      estimatedHours,
      tags,
      checklist,
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title and project ID.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${projectId}`,
      });
    }

    // Auto-generate task number: e.g. PRJ-101
    const taskCount = await Task.countDocuments({ project: projectId });
    const taskNumber = `${project.key}-${taskCount + 1}`;

    const task = await Task.create({
      title,
      taskNumber,
      description: description || '',
      project: projectId,
      status: status || 'todo',
      priority: priority || 'medium',
      type: type || 'feature',
      assignee: assignee || null,
      reporter: req.user._id,
      dueDate: dueDate || null,
      estimatedHours: estimatedHours || 0,
      tags: tags || [],
      checklist: checklist || [],
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATED_TASK',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      project: projectId,
      details: `Created task ${task.taskNumber}: ${task.title}`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${req.params.id}`,
      });
    }

    const prevStatus = task.status;
    const {
      title,
      description,
      status,
      priority,
      type,
      assignee,
      dueDate,
      estimatedHours,
      loggedHours,
      tags,
      checklist,
    } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (type) task.type = type;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (loggedHours !== undefined) task.loggedHours = loggedHours;
    if (tags !== undefined) task.tags = tags;
    if (checklist !== undefined) task.checklist = checklist;

    await task.save();

    // Log status change or general update
    const details =
      prevStatus !== task.status
        ? `Status changed from ${prevStatus} to ${task.status}`
        : `Task updated`;

    await ActivityLog.create({
      user: req.user._id,
      action: prevStatus !== task.status ? 'CHANGED_STATUS' : 'UPDATED_TASK',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      project: task.project,
      details,
    });

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key');

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick update status (optimized for Kanban Board drag & drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'MOVED_TASK',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      project: task.project,
      details: `Moved from ${oldStatus} to ${status}`,
    });

    res.status(200).json({
      success: true,
      data: {
        _id: task._id,
        status: task.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${req.params.id}`,
      });
    }

    // Role or ownership check
    const isReporter = task.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';

    if (!isReporter && !isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task.',
      });
    }

    await task.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETED_TASK',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      project: task.project,
      details: `Deleted task ${task.taskNumber || task.title}`,
    });

    res.status(200).json({
      success: true,
      message: 'Task removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const comment = {
      user: req.user._id,
      authorName: req.user.name,
      text: text.trim(),
      createdAt: new Date(),
    };

    task.comments.push(comment);
    await task.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'COMMENTED_ON_TASK',
      entityType: 'task',
      entityId: task._id,
      entityTitle: task.title,
      project: task.project,
      details: `Added a comment on ${task.taskNumber}`,
    });

    res.status(201).json({
      success: true,
      data: task.comments[task.comments.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add / Toggle checklist item
// @route   POST /api/tasks/:id/checklist & PATCH /api/tasks/:id/checklist/:itemId
// @access  Private
const addChecklistItem = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Checklist item title is required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.checklist.push({ title, completed: false });
    await task.save();

    res.status(201).json({ success: true, data: task.checklist });
  } catch (error) {
    next(error);
  }
};

const toggleChecklistItem = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const item = task.checklist.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Checklist item not found' });

    item.completed = !item.completed;
    await task.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  addChecklistItem,
  toggleChecklistItem,
};
