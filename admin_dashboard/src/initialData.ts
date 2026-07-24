import { Task, Activity, Channel, Message } from './types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Q3 Infrastructure Audit',
    description: 'Comprehensive compliance and security audit of all global server clusters, AWS infrastructure pools, and backup protocols for the upcoming board review. Ensure all logging systems are functional and partition limits are aligned with corporate SLA metrics.',
    status: 'in_progress',
    priority: 'urgent',
    assignees: ['Sarah Chen', 'Marcus Thorne'],
    division: 'Engineering',
    timeAgo: '2h ago',
    dateCreated: '2023-10-24',
    subtasks: [
      { id: 'sub-1-1', title: 'Inspect AWS IAM permissions matrices', completed: true },
      { id: 'sub-1-2', title: 'Verify server logging rotation scripts', completed: true },
      { id: 'sub-1-3', title: 'Conduct vulnerability scanning on public subnets', completed: false },
      { id: 'sub-1-4', title: 'Generate compliance validation report', completed: false }
    ],
    comments: [
      {
        id: 'comment-1-1',
        user: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
        text: 'Initial IAM checks have passed. Still waiting on logs from Frankfurt.',
        date: '2023-10-24 11:30'
      },
      {
        id: 'comment-1-2',
        user: 'Marcus Thorne',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
        text: 'Ensure we loop in Cloud Sentinel if Frankfurt reports any SSH handshakes without matching public keys.',
        date: '2023-10-24 12:15'
      }
    ]
  },
  {
    id: 'task-2',
    title: 'Cloud Migration Phase 2',
    description: 'Execute database partitioning and read-replica distribution strategies for Tokyo and Seoul data regions. Minimal downtime migration window has been scheduled for Sunday early morning operations.',
    status: 'todo',
    priority: 'urgent',
    assignees: ['Sarah Chen', 'Cloud Sentinel'],
    division: 'Engineering',
    timeAgo: '5h ago',
    dateCreated: '2023-10-24',
    subtasks: [
      { id: 'sub-2-1', title: 'Verify replication latency metrics', completed: true },
      { id: 'sub-2-2', title: 'Perform mock failover sequence', completed: false },
      { id: 'sub-2-3', title: 'Sync read-replica targets in application settings', completed: false }
    ],
    comments: [
      {
        id: 'comment-2-1',
        user: 'Cloud Sentinel',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        text: 'Pre-migration health scans are green. Ready for backup verification.',
        date: '2023-10-24 09:30'
      }
    ]
  },
  {
    id: 'task-3',
    title: 'Mobile App Security Patch',
    description: 'Implement immediate critical mitigation patch for login token expiration edge case. Fix concerns user state corruption on slow network transitions leading to auth token invalidation.',
    status: 'in_review',
    priority: 'urgent',
    assignees: ['Sarah Chen'],
    division: 'Security',
    timeAgo: '1d ago',
    dateCreated: '2023-10-23',
    subtasks: [
      { id: 'sub-3-1', title: 'Isolate network timeout race condition', completed: true },
      { id: 'sub-3-2', title: 'Write unit tests for authentication re-try loop', completed: true },
      { id: 'sub-3-3', title: 'Submit build v4.12.1 for App Store staging', completed: true },
      { id: 'sub-3-4', title: 'Perform penetration test on token renewal endpoint', completed: false }
    ],
    comments: []
  },
  {
    id: 'task-4',
    title: 'Setup OAuth Provider APIs',
    description: 'Configure corporate Single Sign-On (SSO) links using multi-tenant OAuth protocols. Connect with Active Directory and Azure configurations for automated employee provisioning.',
    status: 'done',
    priority: 'high',
    assignees: ['Marcus Thorne', 'System Admin'],
    division: 'Product',
    timeAgo: '3d ago',
    dateCreated: '2023-10-21',
    subtasks: [
      { id: 'sub-4-1', title: 'Configure client secret keys in vault', completed: true },
      { id: 'sub-4-2', title: 'Setup callback redirect URIs', completed: true },
      { id: 'sub-4-3', title: 'Audit claim mapping attributes', completed: true }
    ],
    comments: []
  },
  {
    id: 'task-5',
    title: 'Revise Enterprise SLA Agreements',
    description: 'Draft the updated Service Level Agreement policy document containing new high-availability clusters and uptime guarantees (99.99%) for corporate high-tier users.',
    status: 'in_review',
    priority: 'medium',
    assignees: ['Marcus Thorne'],
    division: 'Operations',
    timeAgo: '2d ago',
    dateCreated: '2023-10-22',
    subtasks: [
      { id: 'sub-5-1', title: 'Draft legal revisions for Section 4.2', completed: true },
      { id: 'sub-5-2', title: 'Review with General Counsel', completed: false }
    ],
    comments: []
  },
  {
    id: 'task-6',
    title: 'Design Dark Mode Assets & Tokens',
    description: 'Create cohesive system color tokens, contrast boundaries, and vector icon layers to support native dark mode aesthetics in the developer portal.',
    status: 'todo',
    priority: 'low',
    assignees: ['Emily Rose'],
    division: 'Product',
    timeAgo: '4d ago',
    dateCreated: '2023-10-20',
    subtasks: [
      { id: 'sub-6-1', title: 'Audit all light mode hex codes', completed: false },
      { id: 'sub-6-2', title: 'Propose contrast tables for dark elements', completed: false }
    ],
    comments: []
  },
  {
    id: 'task-7',
    title: 'Resolve Memory Leak on Webhook Server',
    description: 'Investigate system garbage collection logs reporting a steady climb in memory utilization on Express webhook routers under high concurrent API payload deliveries.',
    status: 'todo',
    priority: 'high',
    assignees: ['System Admin'],
    division: 'Engineering',
    timeAgo: '12h ago',
    dateCreated: '2023-10-23',
    subtasks: [
      { id: 'sub-7-1', title: 'Profile heap allocation using node inspector', completed: false },
      { id: 'sub-7-2', title: 'Audit event listeners on socket channels', completed: false }
    ],
    comments: []
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'activity-1',
    type: 'upload_file',
    title: 'API Documentation Updated',
    project: 'Developer Hub Project',
    user: 'Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    status: 'COMPLETED',
    date: '2023-10-24 14:32'
  },
  {
    id: 'activity-2',
    type: 'chat',
    title: 'System Maintenance Alert',
    project: 'Global Operations',
    user: 'System Admin',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
    status: 'SCHEDULED',
    date: '2023-10-24 12:10'
  },
  {
    id: 'activity-3',
    type: 'warning',
    title: 'New Security Threat Detected',
    project: 'Firewall Logs',
    user: 'Cloud Sentinel',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    status: 'ACTION REQUIRED',
    date: '2023-10-24 09:45'
  },
  {
    id: 'activity-4',
    type: 'task',
    title: 'Q3 Compliance Audit Launched',
    project: 'Operations Hub',
    user: 'Marcus Thorne',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    status: 'COMPLETED',
    date: '2023-10-24 08:15'
  },
  {
    id: 'activity-5',
    type: 'settings',
    title: 'SSO Client Credentials Rotated',
    project: 'Internal Security Gate',
    user: 'System Admin',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
    status: 'COMPLETED',
    date: '2023-10-23 16:40'
  }
];

export const INITIAL_CHANNELS: Channel[] = [
  { id: 'chan-1', name: 'general', unreadCount: 0 },
  { id: 'chan-2', name: 'engineering', unreadCount: 2 },
  { id: 'chan-3', name: 'product-updates', unreadCount: 0 },
  { id: 'chan-4', name: 'security-alerts', unreadCount: 1 }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    channelId: 'chan-1',
    user: 'Marcus Thorne',
    userRole: 'Chief Operations',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    text: 'Welcome team to the TaskPro Enterprise command center. We will use this workspace for daily syncs, real-time logging, and release tracking.',
    date: '2023-10-23 09:00'
  },
  {
    id: 'msg-2',
    channelId: 'chan-1',
    user: 'Sarah Chen',
    userRole: 'Lead Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    text: 'Acknowledged! Setting up webhook integrations for system deployment warnings now.',
    date: '2023-10-23 09:12'
  },
  {
    id: 'msg-3',
    channelId: 'chan-2',
    user: 'Sarah Chen',
    userRole: 'Lead Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    text: 'Did we verify the heap utilization spikes on our Tokyo replica cluster?',
    date: '2023-10-24 10:15'
  },
  {
    id: 'msg-4',
    channelId: 'chan-2',
    user: 'System Admin',
    userRole: 'Infrastructure Lead',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
    text: 'I ran a profiling dump on node-tokyo-2. It was a garbage collection log buffer leak. I have scheduled a patch.',
    date: '2023-10-24 10:45'
  },
  {
    id: 'msg-5',
    channelId: 'chan-2',
    user: 'Sarah Chen',
    userRole: 'Lead Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    text: 'Perfect. Let\'s verify this on staging before promoting to production on Sunday.',
    date: '2023-10-24 11:00'
  },
  {
    id: 'msg-6',
    channelId: 'chan-3',
    user: 'Emily Rose',
    userRole: 'Product Director',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    text: 'The Q3 Roadmap deliverables have been exported. Let me know if you need specific priority adjustments.',
    date: '2023-10-24 08:30'
  },
  {
    id: 'msg-7',
    channelId: 'chan-4',
    user: 'Cloud Sentinel',
    userRole: 'Automated Bot',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    text: 'ALERT: Unauthorized root-level access attempt detected on port 22 from IP 185.190.140.23. Request dropped. IP added to firewall blacklist.',
    date: '2023-10-24 09:45'
  }
];
