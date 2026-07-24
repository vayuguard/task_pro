import { Employee, Task, ProjectHealth, ChatMessage, ActivityLog } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Alex Murphy',
    role: 'Senior Engineer',
    initials: 'AM',
    avatarBg: 'bg-indigo-700',
    velocity: 14.2,
    completionRate: 98,
    feedbackScore: 4.5,
    trend: 4.1
  },
  {
    id: 'emp-2',
    name: 'Sarah Chen',
    role: 'Product Designer',
    initials: 'SC',
    avatarBg: 'bg-emerald-600',
    velocity: 12.5,
    completionRate: 92,
    feedbackScore: 4.0,
    trend: 1.2
  },
  {
    id: 'emp-3',
    name: 'James Brown',
    role: 'QA Analyst',
    initials: 'JB',
    avatarBg: 'bg-amber-600',
    velocity: 9.8,
    completionRate: 85,
    feedbackScore: 3.5,
    trend: -0.4
  },
  {
    id: 'emp-4',
    name: 'Marcus Aurelius',
    role: 'Backend Developer',
    initials: 'MA',
    avatarBg: 'bg-blue-600',
    velocity: 15.1,
    completionRate: 95,
    feedbackScore: 4.8,
    trend: 2.5
  },
  {
    id: 'emp-5',
    name: 'Elena Rostova',
    role: 'Frontend Architect',
    initials: 'ER',
    avatarBg: 'bg-purple-600',
    velocity: 13.8,
    completionRate: 94,
    feedbackScore: 4.2,
    trend: 0.8
  },
  {
    id: 'emp-6',
    name: 'Liam Gallagher',
    role: 'DevOps Engineer',
    initials: 'LG',
    avatarBg: 'bg-rose-600',
    velocity: 11.0,
    completionRate: 90,
    feedbackScore: 3.9,
    trend: -1.1
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Cloud Migration Phase 2',
    description: 'Migrating the legacy microservices to GCP Cloud Run and setting up secondary failover regional endpoints.',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: 'emp-1',
    dueDate: '2026-07-25',
    points: 13,
    category: 'Cloud Migration',
    comments: [
      {
        id: 'c-1',
        authorName: 'Liam Gallagher',
        authorInitials: 'LG',
        content: 'Dockerfiles have been fully optimized. Storage buckets permissioning completed.',
        timestamp: '2 hours ago'
      },
      {
        id: 'c-2',
        authorName: 'Alex Murphy',
        authorInitials: 'AM',
        content: 'Working on regional traffic routing configs now. Targeting deployment on Wednesday.',
        timestamp: '1 hour ago'
      }
    ]
  },
  {
    id: 'task-2',
    title: 'Database Schema Migration',
    description: 'Update user profiles schema in production. Add audit logs, external sync fields, and setup Drizzle schema files.',
    status: 'done',
    priority: 'high',
    assigneeId: 'emp-4',
    dueDate: '2026-07-15',
    points: 8,
    category: 'Cloud Migration',
    comments: [
      {
        id: 'c-3',
        authorName: 'Marcus Aurelius',
        authorInitials: 'MA',
        content: 'Migration run completed successfully. Verification scripts are passing on staging.',
        timestamp: '3 days ago'
      }
    ]
  },
  {
    id: 'task-3',
    title: 'API Refactor & Documentation',
    description: 'Clean up technical debt in v1 endpoints. Deprecate legacy payload wrappers and write full Swagger OpenAPI documentation.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'emp-4',
    dueDate: '2026-08-01',
    points: 5,
    category: 'API Refactor',
    comments: []
  },
  {
    id: 'task-4',
    title: 'Mobile App UI Overhaul',
    description: 'Overhaul design of main feed, add smooth transitions using framer-motion, update brand assets, and refine touch targets.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'emp-2',
    dueDate: '2026-07-30',
    points: 8,
    category: 'Mobile App UI',
    comments: [
      {
        id: 'c-4',
        authorName: 'Sarah Chen',
        authorInitials: 'SC',
        content: 'Figma prototypes are locked. Currently coding the feed page layout with responsive bento cards.',
        timestamp: 'Yesterday'
      }
    ]
  },
  {
    id: 'task-5',
    title: 'QA Automation Test Coverage',
    description: 'Increase end-to-end integration test coverage for checkout flow. Build Cypress/Playwright regression testing suite.',
    status: 'review',
    priority: 'low',
    assigneeId: 'emp-3',
    dueDate: '2026-07-22',
    points: 3,
    category: 'Mobile App UI',
    comments: [
      {
        id: 'c-5',
        authorName: 'James Brown',
        authorInitials: 'JB',
        content: 'Created 24 new test cases. Reviewing failing browser assertions on Firefox container build.',
        timestamp: '4 hours ago'
      }
    ]
  },
  {
    id: 'task-6',
    title: 'OAuth 2.0 Auth Flow Implementation',
    description: 'Implement secure login endpoints supporting Google and GitHub authentication with JWT refresh tokens and server cookies.',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 'emp-5',
    dueDate: '2026-07-28',
    points: 8,
    category: 'API Refactor',
    comments: []
  },
  {
    id: 'task-7',
    title: 'Continuous Integration Pipeline Upgrade',
    description: 'Reduce build time of the monorepo by adding caching configurations, parallelizing static code analysis and tests.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'emp-6',
    dueDate: '2026-07-12',
    points: 5,
    category: 'Cloud Migration',
    comments: []
  },
  {
    id: 'task-8',
    title: 'Accessibility Compliance (WCAG 2.1)',
    description: 'Review contrast ratios, add ARIA attributes, and ensure full screen-reader support on core customer-facing views.',
    status: 'done',
    priority: 'low',
    assigneeId: 'emp-2',
    dueDate: '2026-07-10',
    points: 3,
    category: 'Mobile App UI',
    comments: []
  }
];

export const INITIAL_PROJECTS_HEALTH: ProjectHealth[] = [
  {
    id: 'proj-1',
    name: 'Cloud Migration',
    status: 'on_track',
    percentage: 90
  },
  {
    id: 'proj-2',
    name: 'API Refactor',
    status: 'delayed',
    percentage: 48
  },
  {
    id: 'proj-3',
    name: 'Mobile App UI',
    status: 'active',
    percentage: 75
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'emp-1',
    senderName: 'Alex Murphy',
    senderInitials: 'AM',
    senderBg: 'bg-indigo-700',
    text: 'Good morning team! Quick update: I have resolved the regional DNS sync bug in the Cloud Migration setup. The staging environment is now stable.',
    timestamp: '9:05 AM',
    channel: '#general'
  },
  {
    id: 'msg-2',
    senderId: 'emp-6',
    senderName: 'Liam Gallagher',
    senderInitials: 'LG',
    senderBg: 'bg-rose-600',
    text: 'Awesome job Alex! Let me know if you need help load-testing the fallback instances.',
    timestamp: '9:12 AM',
    channel: '#general'
  },
  {
    id: 'msg-3',
    senderId: 'emp-2',
    senderName: 'Sarah Chen',
    senderInitials: 'SC',
    senderBg: 'bg-emerald-600',
    text: 'Great news! I am finishing up the Figma feedback reviews for the Mobile UI layout. James, can you check the container-queries classes compatibility with our test browsers?',
    timestamp: '9:30 AM',
    channel: '#general'
  },
  {
    id: 'msg-4',
    senderId: 'emp-3',
    senderName: 'James Brown',
    senderInitials: 'JB',
    senderBg: 'bg-amber-600',
    text: 'Already on it Sarah. Added specific assertions for flexbox layout containers, tests are passing on chrome-headless!',
    timestamp: '9:45 AM',
    channel: '#general'
  },
  {
    id: 'msg-5',
    senderId: 'emp-4',
    senderName: 'Marcus Aurelius',
    senderInitials: 'MA',
    senderBg: 'bg-blue-600',
    text: 'Starting work on the deprecated v1 endpoints refactor. Planning to bundle into CJS to bypass Node ESM runtime issues.',
    timestamp: '10:02 AM',
    channel: '#project-alpha'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    text: 'Alex Murphy moved "Cloud Migration Phase 2" to In Progress',
    timestamp: '2 hours ago',
    type: 'status_changed'
  },
  {
    id: 'log-2',
    text: 'James Brown added a comment on "QA Automation Test Coverage"',
    timestamp: '4 hours ago',
    type: 'comment_added'
  },
  {
    id: 'log-3',
    text: 'Marcus Aurelius created task "Database Schema Migration"',
    timestamp: '3 days ago',
    type: 'task_created'
  }
];
