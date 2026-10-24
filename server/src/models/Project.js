const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    key: {
      type: String,
      required: [true, 'Project key is required (e.g. PRJ, CORE)'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Project key must be at least 2 characters'],
      maxlength: [10, 'Project key cannot exceed 10 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Full Stack Development',
    },
    status: {
      type: String,
      enum: {
        values: ['planning', 'active', 'on_hold', 'completed'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'active',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    budget: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', projectSchema);
