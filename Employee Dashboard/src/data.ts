import { Task, TeamMember, TeamUpdate, ChatMessage, ProjectMetrics, ProgressLog } from './types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    role: 'Product Designer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa',
    active: true,
    kudos: 15,
    efficiency: 92,
    tasksCompleted: 24,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Senior Developer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi9iWGeLsNCa42OILfHpd3rSWJNDEfC2lepRb9-nnBzwTFVb2Z-lOlN-futspBjco5e776xiYZ2afljQp4_eFq8Z-3DFG7VbLWQalAv-IFZ_WMcDqjF_oNssGK07QHwhUQ6_NTe0OrME2J0D1Ih9iX2JUpPLzG4FRY8O78kP8mmO6JGqBwV68vY-ZxXNhLqnvahUC4QBRxC1yTk9D-1f6-hQldeuWRxixYsQY_S-U_zte-PJyYILlpjgjtNIcnUetJzqZRs52ZZYuk',
    active: true,
    kudos: 18,
    efficiency: 95,
    tasksCompleted: 28,
  },
  {
    id: '3',
    name: 'Marcus Thorne',
    role: 'Project Manager',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3iDzAfx0CpKBRw81cKgyH-xIheJHtWoVc4ZQv3NWMM8ws4EiIzVVIEN7WujcFGcB50KGCOjquNs9-0-qSuxinAlmH41N-IdkSJXyJkZaitXGq9JlCGSR2eRJxCj1OzzLkTKz_ZUhztYbon15GomqC2YjPqtVHBgT8n1uxVqP3MYiAjuCVEmC6LwWk0vKQgm_caiJFnZGad5WfSpp4Dzj8FdTJtXsMmr5Yg9lCI_PnMUUY6OsqxmUzhi3joNBu7hWi-8UfkZAUXsZ',
    active: true,
    kudos: 8,
    efficiency: 88,
    tasksCompleted: 19,
  },
  {
    id: '4',
    name: 'Lila Vance',
    role: 'Tech Lead',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0YACatSFH4YYf3ucR0-yPCB-SJz3nxmgO7TbhXX8TzNceotzFQt_TBirj_q5k2Vof6AXtMah0qkG8rEmO4Yf9ZP8fNETS7AfMfkCXTNf1tKxr18JGl8gcl7R4iSj8WEYsnL-LikklRObntRlBH4mHpMBcMdikNW-W4rnE0CIGMLM1l7V0_OG1AjDJUFe_SGOE1RIEtX29kVbL3mBny7xT1qwCnW8YWZBfFW8gR2MyOukfaV34U6ry4Q5abtKRnjcTQxv7BW5i5dOH',
    active: true,
    kudos: 21,
    efficiency: 94,
    tasksCompleted: 31,
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review Q3 System Architecture Design',
    description: 'Enterprise architecture alignment session. Focus on core backend decoupling, serverless containers orchestration, IAM policies review and cost efficiency optimization.',
    project: 'Enterprise Platform Modernization Project',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-07-20',
    dueTime: '17:00',
    files: 3,
    commentsCount: 2,
    assignees: ['Alex Rivera', 'Sarah Chen', 'Lila Vance'],
    subtasks: [
      { id: 'sub-1-1', title: 'Check microservice latency bounds', completed: true },
      { id: 'sub-1-2', title: 'Validate IAM access policies for Cloud Run', completed: true },
      { id: 'sub-1-3', title: 'Align container memory limits in Terraform configuration', completed: false },
      { id: 'sub-1-4', title: 'Create visual architecture diagrams in Figma', completed: false }
    ],
    comments: [
      {
        id: 'c-1-1',
        author: 'Sarah Chen',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi9iWGeLsNCa42OILfHpd3rSWJNDEfC2lepRb9-nnBzwTFVb2Z-lOlN-futspBjco5e776xiYZ2afljQp4_eFq8Z-3DFG7VbLWQalAv-IFZ_WMcDqjF_oNssGK07QHwhUQ6_NTe0OrME2J0D1Ih9iX2JUpPLzG4FRY8O78kP8mmO6JGqBwV68vY-ZxXNhLqnvahUC4QBRxC1yTk9D-1f6-hQldeuWRxixYsQY_S-U_zte-PJyYILlpjgjtNIcnUetJzqZRs52ZZYuk',
        role: 'Senior Developer',
        content: 'Make sure we review the autoscaling configuration. I saw some latency spikes yesterday on our dev containers.',
        timestamp: '10:15 AM'
      },
      {
        id: 'c-1-2',
        author: 'Lila Vance',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0YACatSFH4YYf3ucR0-yPCB-SJz3nxmgO7TbhXX8TzNceotzFQt_TBirj_q5k2Vof6AXtMah0qkG8rEmO4Yf9ZP8fNETS7AfMfkCXTNf1tKxr18JGl8gcl7R4iSj8WEYsnL-LikklRObntRlBH4mHpMBcMdikNW-W4rnE0CIGMLM1l7V0_OG1AjDJUFe_SGOE1RIEtX29kVbL3mBny7xT1qwCnW8YWZBfFW8gR2MyOukfaV34U6ry4Q5abtKRnjcTQxv7BW5i5dOH',
        role: 'Tech Lead',
        content: 'Approved the preliminary schema definitions! Let\'s address the Cloud SQL integration details and the secure IAM roles setup today.',
        timestamp: '11:30 AM'
      }
    ]
  },
  {
    id: 'task-2',
    title: 'Conduct Weekly Team Sync',
    description: 'Weekly team status update, reviewing current sprint metrics, resolving high priority blockers, and planning the incoming task backlog for product releases.',
    project: 'Operations & Management',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-07-21',
    dueTime: '10:00',
    files: 0,
    commentsCount: 0,
    assignees: ['Alex Rivera', 'Marcus Thorne', 'Sarah Chen'],
    subtasks: [
      { id: 'sub-2-1', title: 'Compile weekly sprint velocity chart', completed: false },
      { id: 'sub-2-2', title: 'Review blocker list in Jira', completed: false },
      { id: 'sub-2-3', title: 'Present new Design System token specs', completed: false }
    ],
    comments: []
  },
  {
    id: 'task-3',
    title: 'Update Design System Tokens',
    description: 'Refining the theme parameters, updating component variables to match high-contrast accessibility guidelines, and exporting clean Tailwind CSS classes.',
    project: 'Core UI Library',
    priority: 'low',
    status: 'todo',
    dueDate: '2026-10-24',
    dueTime: '12:00',
    files: 1,
    commentsCount: 0,
    assignees: ['Alex Rivera'],
    subtasks: [
      { id: 'sub-3-1', title: 'Map high-contrast slate variables', completed: false },
      { id: 'sub-3-2', title: 'Audit border radius constants', completed: false },
      { id: 'sub-3-3', title: 'Review with accessibility experts', completed: false }
    ],
    comments: []
  },
  {
    id: 'task-4',
    title: 'Security Audit Submission',
    description: 'Prepare documentation and security controls evidence for the upcoming enterprise certification audit. Covers penetration tests, vulnerability remediation, and IAM reviews.',
    project: 'Enterprise Platform Modernization Project',
    priority: 'urgent',
    status: 'review',
    dueDate: '2026-07-20',
    dueTime: '15:00',
    files: 5,
    commentsCount: 1,
    assignees: ['Sarah Chen', 'Lila Vance'],
    subtasks: [
      { id: 'sub-4-1', title: 'Fix dependency vulnerabilities in package.json', completed: true },
      { id: 'sub-4-2', title: 'Revoke unused database credentials', completed: true },
      { id: 'sub-4-3', title: 'Generate encryption audit reports', completed: false }
    ],
    comments: [
      {
        id: 'c-4-1',
        author: 'Marcus Thorne',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3iDzAfx0CpKBRw81cKgyH-xIheJHtWoVc4ZQv3NWMM8ws4EiIzVVIEN7WujcFGcB50KGCOjquNs9-0-qSuxinAlmH41N-IdkSJXyJkZaitXGq9JlCGSR2eRJxCj1OzzLkTKz_ZUhztYbon15GomqC2YjPqtVHBgT8n1uxVqP3MYiAjuCVEmC6LwWk0vKQgm_caiJFnZGad5WfSpp4Dzj8FdTJtXsMmr5Yg9lCI_PnMUUY6OsqxmUzhi3joNBu7hWi-8UfkZAUXsZ',
        role: 'Project Manager',
        content: 'Please double check the static analysis reports before building the submission package.',
        timestamp: '9:00 AM'
      }
    ]
  },
  {
    id: 'task-5',
    title: 'Client Feedback Integration',
    description: 'Consolidate usability feedback received from Q3 customer interviews, redesigning high-friction onboarding paths, and adjusting widget spacing.',
    project: 'Core UI Library',
    priority: 'urgent',
    status: 'todo',
    dueDate: '2026-07-23',
    dueTime: '18:00',
    files: 2,
    commentsCount: 0,
    assignees: ['Alex Rivera', 'Marcus Thorne'],
    subtasks: [
      { id: 'sub-5-1', title: 'Add fluid transition motions for onboarding steps', completed: false },
      { id: 'sub-5-2', title: 'Optimize mobile bento layout sizing', completed: false }
    ],
    comments: []
  }
];

export const INITIAL_UPDATES: TeamUpdate[] = [
  {
    id: 'u-1',
    author: 'Sarah Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi9iWGeLsNCa42OILfHpd3rSWJNDEfC2lepRb9-nnBzwTFVb2Z-lOlN-futspBjco5e776xiYZ2afljQp4_eFq8Z-3DFG7VbLWQalAv-IFZ_WMcDqjF_oNssGK07QHwhUQ6_NTe0OrME2J0D1Ih9iX2JUpPLzG4FRY8O78kP8mmO6JGqBwV68vY-ZxXNhLqnvahUC4QBRxC1yTk9D-1f6-hQldeuWRxixYsQY_S-U_zte-PJyYILlpjgjtNIcnUetJzqZRs52ZZYuk',
    text: 'mentioned you in Sprint-74 Backlog',
    time: '15 mins ago',
    detail: 'Sprint-74 Backlog',
    category: 'mention'
  },
  {
    id: 'u-2',
    author: 'Marcus Thorne',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3iDzAfx0CpKBRw81cKgyH-xIheJHtWoVc4ZQv3NWMM8ws4EiIzVVIEN7WujcFGcB50KGCOjquNs9-0-qSuxinAlmH41N-IdkSJXyJkZaitXGq9JlCGSR2eRJxCj1OzzLkTKz_ZUhztYbon15GomqC2YjPqtVHBgT8n1uxVqP3MYiAjuCVEmC6LwWk0vKQgm_caiJFnZGad5WfSpp4Dzj8FdTJtXsMmr5Yg9lCI_PnMUUY6OsqxmUzhi3joNBu7hWi-8UfkZAUXsZ',
    text: 'attached a file to Client Assets',
    time: '1 hour ago',
    detail: 'Client Assets',
    category: 'attachment'
  },
  {
    id: 'u-3',
    author: 'Lila Vance',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0YACatSFH4YYf3ucR0-yPCB-SJz3nxmgO7TbhXX8TzNceotzFQt_TBirj_q5k2Vof6AXtMah0qkG8rEmO4Yf9ZP8fNETS7AfMfkCXTNf1tKxr18JGl8gcl7R4iSj8WEYsnL-LikklRObntRlBH4mHpMBcMdikNW-W4rnE0CIGMLM1l7V0_OG1AjDJUFe_SGOE1RIEtX29kVbL3mBny7xT1qwCnW8YWZBfFW8gR2MyOukfaV34U6ry4Q5abtKRnjcTQxv7BW5i5dOH',
    text: 'approved your Merge Request',
    time: '3 hours ago',
    detail: 'Merge Request',
    category: 'approval'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    channel: '#design-system',
    author: 'Sarah Chen',
    role: 'Senior Developer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi9iWGeLsNCa42OILfHpd3rSWJNDEfC2lepRb9-nnBzwTFVb2Z-lOlN-futspBjco5e776xiYZ2afljQp4_eFq8Z-3DFG7VbLWQalAv-IFZ_WMcDqjF_oNssGK07QHwhUQ6_NTe0OrME2J0D1Ih9iX2JUpPLzG4FRY8O78kP8mmO6JGqBwV68vY-ZxXNhLqnvahUC4QBRxC1yTk9D-1f6-hQldeuWRxixYsQY_S-U_zte-PJyYILlpjgjtNIcnUetJzqZRs52ZZYuk',
    content: 'Hey @Alex, are the high-contrast slate variables ready? I want to hook them up to the Tailwind theme config.',
    timestamp: 'Yesterday, 4:32 PM'
  },
  {
    id: 'chat-2',
    channel: '#design-system',
    author: 'Alex Rivera',
    role: 'Product Designer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa',
    content: 'Yes! I just mapped out the Level 0 background and Level 1 border radius rules. I am finalizing the low contrast shadows and will push them in a minute.',
    timestamp: 'Yesterday, 4:45 PM'
  },
  {
    id: 'chat-3',
    channel: '#design-system',
    author: 'Lila Vance',
    role: 'Tech Lead',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0YACatSFH4YYf3ucR0-yPCB-SJz3nxmgO7TbhXX8TzNceotzFQt_TBirj_q5k2Vof6AXtMah0qkG8rEmO4Yf9ZP8fNETS7AfMfkCXTNf1tKxr18JGl8gcl7R4iSj8WEYsnL-LikklRObntRlBH4mHpMBcMdikNW-W4rnE0CIGMLM1l7V0_OG1AjDJUFe_SGOE1RIEtX29kVbL3mBny7xT1qwCnW8YWZBfFW8gR2MyOukfaV34U6ry4Q5abtKRnjcTQxv7BW5i5dOH',
    content: 'Awesome job. Once these are pushed, I can review the pull request and run a quick build compile to confirm no styles are broken.',
    timestamp: 'Yesterday, 5:10 PM'
  },
  {
    id: 'chat-4',
    channel: '#general',
    author: 'Marcus Thorne',
    role: 'Project Manager',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM3iDzAfx0CpKBRw81cKgyH-xIheJHtWoVc4ZQv3NWMM8ws4EiIzVVIEN7WujcFGcB50KGCOjquNs9-0-qSuxinAlmH41N-IdkSJXyJkZaitXGq9JlCGSR2eRJxCj1OzzLkTKz_ZUhztYbon15GomqC2YjPqtVHBgT8n1uxVqP3MYiAjuCVEmC6LwWk0vKQgm_caiJFnZGad5WfSpp4Dzj8FdTJtXsMmr5Yg9lCI_PnMUUY6OsqxmUzhi3joNBu7hWi-8UfkZAUXsZ',
    content: 'Great progress this week team! Remember we have the security audit review coming up, let\'s make sure our documentation is complete.',
    timestamp: 'Today, 9:15 AM'
  }
];

export const INITIAL_PROJECT_METRICS: ProjectMetrics[] = [
  {
    id: 'proj-1',
    name: 'Enterprise Platform Modernization',
    color: '#3B82F6',
    totalTasks: 18,
    completedTasks: 12,
    status: 'On Track',
    budget: '$145,000'
  },
  {
    id: 'proj-2',
    name: 'Core UI Library (Design System)',
    color: '#8B5CF6',
    totalTasks: 12,
    completedTasks: 8,
    status: 'On Track',
    budget: '$50,000'
  },
  {
    id: 'proj-3',
    name: 'Database Security Compliance',
    color: '#EF4444',
    totalTasks: 8,
    completedTasks: 3,
    status: 'At Risk',
    budget: '$30,000'
  },
  {
    id: 'proj-4',
    name: 'Ops & Platform Automation',
    color: '#10B981',
    totalTasks: 15,
    completedTasks: 14,
    status: 'On Track',
    budget: '$75,000'
  }
];

export const INITIAL_PROGRESS_LOGS: ProgressLog[] = [
  {
    id: 'p-1',
    taskId: 'task-1',
    taskTitle: 'Review Q3 System Architecture Design',
    hours: 4,
    notes: 'Reviewed decupling layers, analyzed cloud infrastructure and optimized Terraform memory values.',
    timestamp: 'Today, 10:30 AM',
    author: 'Alex Rivera'
  }
];
