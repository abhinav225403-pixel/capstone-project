const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard metrics & telemetry
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const isRegularMember = req.user.role === 'member';

    // Base query constraints if regular member
    const projectFilter = isRegularMember
      ? { $or: [{ owner: req.user._id }, { members: req.user._id }] }
      : {};

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      myAssignedTasks,
      tasksByStatus,
      tasksByPriority,
      recentActivities,
      teamMembersCount,
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Project.countDocuments({ ...projectFilter, status: 'active' }),
      Project.countDocuments({ ...projectFilter, status: 'completed' }),
      Task.countDocuments({}),
      Task.countDocuments({ assignee: req.user._id }),
      Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Task.aggregate([
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),
      ActivityLog.find({})
        .populate('user', 'name email avatar role')
        .populate('project', 'name key')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      User.countDocuments({ isActive: true }),
    ]);

    // Format tasks by status
    const statusCounts = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
    };
    tasksByStatus.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // Format tasks by priority
    const priorityCounts = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    tasksByPriority.forEach((item) => {
      if (priorityCounts[item._id] !== undefined) {
        priorityCounts[item._id] = item.count;
      }
    });

    const completionRate =
      totalTasks > 0 ? Math.round((statusCounts.done / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalTasks,
          myAssignedTasks,
          teamMembersCount,
          completionRate,
        },
        statusCounts,
        priorityCounts,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
