const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding realistic demo data for DevPulse Capstone...');

    // Hash common password
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // 1. Create Users
    const users = await User.insertMany([
      {
        name: 'Alex Morgan',
        email: 'admin@devpulse.io',
        password: hashedPassword,
        role: 'admin',
        jobTitle: 'Principal Architect & Admin',
        department: 'Platform Engineering',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isActive: true,
      },
      {
        name: 'Sarah Chen',
        email: 'sarah.lead@devpulse.io',
        password: hashedPassword,
        role: 'manager',
        jobTitle: 'Engineering Lead & Scrum Master',
        department: 'Product Development',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        isActive: true,
      },
      {
        name: 'Alex Rivera',
        email: 'alex.dev@devpulse.io',
        password: hashedPassword,
        role: 'member',
        jobTitle: 'Senior Full Stack Engineer',
        department: 'Engineering',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isActive: true,
      },
      {
        name: 'Priya Nair',
        email: 'priya.ux@devpulse.io',
        password: hashedPassword,
        role: 'member',
        jobTitle: 'Lead Product Designer',
        department: 'Design & UX',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        isActive: true,
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.qa@devpulse.io',
        password: hashedPassword,
        role: 'member',
        jobTitle: 'QA Automation Specialist',
        department: 'Quality Assurance',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        isActive: true,
      },
    ]);

    const admin = users[0];
    const manager = users[1];
    const dev = users[2];
    const designer = users[3];
    const qa = users[4];

    // 2. Create Projects
    const project1 = await Project.create({
      name: 'Nexus Cloud Infrastructure Portal',
      key: 'NEX',
      description: 'Unified microservices control plane and cloud deployment orchestration dashboard.',
      category: 'Cloud Engineering',
      priority: 'high',
      status: 'active',
      owner: manager._id,
      members: [admin._id, manager._id, dev._id, designer._id, qa._id],
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 45000,
    });

    const project2 = await Project.create({
      name: 'Fintech Pay Omni-Channel Gateway',
      key: 'PAY',
      description: 'PCI-DSS compliant payment processing engine with instant settlement and webhook verifications.',
      category: 'Fintech & Security',
      priority: 'urgent',
      status: 'active',
      owner: admin._id,
      members: [admin._id, dev._id, qa._id],
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      budget: 68000,
    });

    const project3 = await Project.create({
      name: 'Mobile Patient Health Tracker',
      key: 'MED',
      description: 'HIPAA-compliant telemedicine booking and medical vitals analytics suite.',
      category: 'Healthcare Tech',
      priority: 'medium',
      status: 'planning',
      owner: manager._id,
      members: [manager._id, designer._id, dev._id],
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      budget: 32000,
    });

    // 3. Create Realistic Tasks for Project 1 (Nexus Cloud Portal)
    const tasks = [
      {
        title: 'Architect JWT Auth & Role-Based Access Control',
        taskNumber: 'NEX-1',
        description: 'Implement token issuance, refresh rotation, and bcrypt password salting on server routes.',
        project: project1._id,
        status: 'done',
        priority: 'urgent',
        type: 'feature',
        assignee: dev._id,
        reporter: manager._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedHours: 12,
        loggedHours: 12,
        tags: ['Security', 'API', 'Auth'],
        checklist: [
          { title: 'Define User Mongoose schema', completed: true },
          { title: 'Add bcryptjs password hash hook', completed: true },
          { title: 'Create protect and authorize middleware', completed: true },
        ],
        comments: [
          {
            user: manager._id,
            authorName: manager.name,
            text: 'Great work! Ensure token expiry is set to 7 days and secrets are strictly read from environment variables.',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            user: dev._id,
            authorName: dev.name,
            text: 'Completed and verified in Postman test collection.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: 'Build Interactive Kanban Board with Quick Status Transitions',
        taskNumber: 'NEX-2',
        description: 'Create responsive visual column layout supporting drag-and-drop or single-click status moves across Backlog, Todo, In Progress, In Review, and Done.',
        project: project1._id,
        status: 'in_progress',
        priority: 'high',
        type: 'feature',
        assignee: dev._id,
        reporter: manager._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        estimatedHours: 16,
        loggedHours: 10,
        tags: ['Frontend', 'Kanban', 'UX'],
        checklist: [
          { title: 'Design column component for 5 workflow states', completed: true },
          { title: 'Implement optimistic UI state update', completed: true },
          { title: 'Integrate PATCH /api/tasks/:id/status endpoint', completed: false },
        ],
        comments: [
          {
            user: designer._id,
            authorName: designer.name,
            text: 'Checked the modern dark glassmorphism styling; cards look sleek with color-coded priority badges!',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: 'Integrate Real-Time Activity Audit Logs Feed',
        taskNumber: 'NEX-3',
        description: 'Record user actions, project changes, and task status transitions with timestamps and user avatars.',
        project: project1._id,
        status: 'in_review',
        priority: 'medium',
        type: 'improvement',
        assignee: dev._id,
        reporter: admin._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedHours: 8,
        loggedHours: 7,
        tags: ['Audit', 'Backend', 'Telemetry'],
        checklist: [
          { title: 'Add ActivityLog Mongoose model', completed: true },
          { title: 'Hook into controller mutations', completed: true },
          { title: 'Expose in dashboard telemetry feed', completed: true },
        ],
        comments: [],
      },
      {
        title: 'Design Accessible Color Palette & Dark Mode Typography',
        taskNumber: 'NEX-4',
        description: 'Ensure 4.5:1 minimum WCAG contrast ratios across dark slate background and glowing neon indicators.',
        project: project1._id,
        status: 'done',
        priority: 'medium',
        type: 'task',
        assignee: designer._id,
        reporter: manager._id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estimatedHours: 10,
        loggedHours: 10,
        tags: ['Design', 'WCAG', 'Accessibility'],
        checklist: [
          { title: 'Audit contrast with Chrome DevTools', completed: true },
          { title: 'Define HSL CSS variables in index.css', completed: true },
        ],
        comments: [],
      },
      {
        title: 'Write End-to-End API Integration Test Suite',
        taskNumber: 'NEX-5',
        description: 'Verify 200, 201, 400, 401, 403, and 404 response codes for task creation, update, and deletion flows.',
        project: project1._id,
        status: 'todo',
        priority: 'high',
        type: 'task',
        assignee: qa._id,
        reporter: manager._id,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        estimatedHours: 14,
        loggedHours: 0,
        tags: ['Testing', 'QA', 'API'],
        checklist: [
          { title: 'Create automated test runner script', completed: false },
          { title: 'Verify token header validation', completed: false },
        ],
        comments: [],
      },
      {
        title: 'Setup Production SPA Fallback & HTTPS Environment Config',
        taskNumber: 'NEX-6',
        description: 'Configure static routing fallback so refreshing /dashboard or /projects deep links does not throw 404.',
        project: project1._id,
        status: 'backlog',
        priority: 'medium',
        type: 'improvement',
        assignee: admin._id,
        reporter: admin._id,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        estimatedHours: 6,
        loggedHours: 0,
        tags: ['DevOps', 'Deployment', 'Vercel/Render'],
        checklist: [],
        comments: [],
      },
      // Tasks for Project 2 (Fintech Pay)
      {
        title: 'Implement Webhook Idempotency & HMAC Signature Validation',
        taskNumber: 'PAY-1',
        description: 'Prevent double charging and replay attacks on external payment gateway callback events.',
        project: project2._id,
        status: 'in_progress',
        priority: 'urgent',
        type: 'feature',
        assignee: dev._id,
        reporter: admin._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimatedHours: 20,
        loggedHours: 12,
        tags: ['Fintech', 'HMAC', 'Security'],
        checklist: [
          { title: 'Compute SHA256 HMAC digest', completed: true },
          { title: 'Add redis/memory cache idempotency key store', completed: false },
        ],
        comments: [],
      },
      {
        title: 'Fix Race Condition in Wallet Balance Calculation',
        taskNumber: 'PAY-2',
        description: 'Concurrent credit/debit operations caused intermittent 0.01 discrepancy under heavy load.',
        project: project2._id,
        status: 'done',
        priority: 'urgent',
        type: 'bug',
        assignee: admin._id,
        reporter: qa._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        estimatedHours: 8,
        loggedHours: 8,
        tags: ['Bug', 'Transactions'],
        checklist: [],
        comments: [],
      },
    ];

    await Task.insertMany(tasks);

    // 4. Create Activity Logs
    await ActivityLog.insertMany([
      {
        user: admin._id,
        action: 'CREATED_PROJECT',
        entityType: 'project',
        entityId: project2._id,
        entityTitle: project2.name,
        project: project2._id,
        details: 'Initialized Fintech Pay Omni-Channel Gateway project repository',
      },
      {
        user: manager._id,
        action: 'CREATED_PROJECT',
        entityType: 'project',
        entityId: project1._id,
        entityTitle: project1.name,
        project: project1._id,
        details: 'Created Nexus Cloud Infrastructure Portal project',
      },
      {
        user: dev._id,
        action: 'MOVED_TASK',
        entityType: 'task',
        entityTitle: 'Architect JWT Auth & Role-Based Access Control',
        project: project1._id,
        details: 'Moved task from In Progress to Done',
      },
      {
        user: dev._id,
        action: 'COMMENTED_ON_TASK',
        entityType: 'task',
        entityTitle: 'Architect JWT Auth & Role-Based Access Control',
        project: project1._id,
        details: 'Added testing notes to NEX-1',
      },
    ]);

    console.log('[Seed] Database successfully seeded with demo users, projects, tasks, and audit logs!');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
  }
};

module.exports = { seedDatabase };
