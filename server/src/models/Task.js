const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text cannot be empty'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    taskNumber: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Associated project is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['backlog', 'todo', 'in_progress', 'in_review', 'done'],
        message: '{VALUE} is not a valid status',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['feature', 'bug', 'task', 'improvement'],
        message: '{VALUE} is not a valid task type',
      },
      default: 'feature',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative'],
    },
    loggedHours: {
      type: Number,
      default: 0,
      min: [0, 'Logged hours cannot be negative'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    checklist: [checklistItemSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal querying & filtering
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
