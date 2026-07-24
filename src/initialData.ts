import { Task, User, EmployeeMetrics, ProgressLog, ProjectHealth } from './types';

export const teamMembers: User[] = [
  {
    name: "Marcus Wright",
    email: "marcus@taskpro.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_ag2R2ZXrb8Cxu-fm_H3gZ74ddn997PCZLCkigr-jjaPJfMEP5utAkoWNEZoPzfRWmWrzeqFaJtRyhTOOxnfiCuaybHIxPKH3n40nNR0fN8zq2qPpymZvU0iWZlkpRXesQz3pPumrzwjMjE9aFLAIU8rxuEl3pAIGTjTblxC3nrI8_hyS5aPiV0b2pyrZZ52qJf6ScQSYowUF9GuoX1g7DMLeMVJd2lTdfqD3LnZvJXjsjEAz9uIFOu7_5wIXQ12ojrhzACZb-iNo",
    role: "Senior Software Engineer"
  },
  {
    name: "Ritesh Prajapati",
    email: "ritesh.prajapati@vayuguard.com",
    avatar: "https://ui-avatars.com/api/?name=Ritesh+Prajapati&background=6366f1&color=fff",
    role: "Admin"
  },
  {
    name: "Alex River",
    email: "alex@taskpro.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCty8HwiIqzWMFA9yeCC98_bH7OenceLUpqdtxl8O1lp79CnUBNgxfx3Nb0fW57dlEVj308Lur20eCBN35ih_0TG0caUbiElRNst1u5knh9dI1MxPWMft5ZHwhWjhH4m6B2sD3awRm53H76tJY9mjVSumuTVWwryE-TupqcMocHqSaf3Ox6Ulseptq3CnYzSWm3VxlwacqL_nXl-jra0AWnSeIaz8Z_CBUw9SWd__jFkeqb71PVHkr4kmY8TBogWOZZXR_O2Qmsvq0x",
    role: "Fullstack Developer"
  },
  {
    name: "Jessica Lopez",
    email: "jessica@taskpro.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIWHJraBaixVifa3fy5JBZtzxKlng1_fC8hQg9y7gU4Y0fQf46Hx9hohHElZPZaMUYsm79RaOrfNo4t3yCubc14Srli6koGfFm04eOSyVLRcMFMU0s4_T7kCyhLwsi21o61z57hfNkM4bmgP9PX9Ssw21zZ9pq3kuDzvODbZSoM58Sw5Q81ABdCXLlXg-7s5KAisKErfzdxV0V1Z7_lm5bprgbYErzXDGXgOx9OPjwPirP9Lp_f3yHijk9z8Hmf8RTDQG2b-VzxnRe",
    role: "UI/UX Designer"
  }
];

export const employeeMetrics: EmployeeMetrics[] = [
  {
    id: 'emp-1',
    name: 'Marcus Wright',
    role: 'Senior Software Engineer',
    avatar: teamMembers[0].avatar,
    velocity: 14.2,
    completionRate: 98,
    feedbackScore: 4.5,
    trend: 4.1,
    tasksCompleted: 24,
    kudos: 18
  },
  {
    id: 'emp-2',
    name: 'Ritesh Prajapati',
    role: 'Admin',
    avatar: teamMembers[1].avatar,
    velocity: 12.5,
    completionRate: 92,
    feedbackScore: 4.0,
    trend: 1.2,
    tasksCompleted: 31,
    kudos: 22
  },
  {
    id: 'emp-3',
    name: 'Alex River',
    role: 'Fullstack Developer',
    avatar: teamMembers[2].avatar,
    velocity: 15.1,
    completionRate: 95,
    feedbackScore: 4.8,
    trend: 2.5,
    tasksCompleted: 19,
    kudos: 15
  },
  {
    id: 'emp-4',
    name: 'Jessica Lopez',
    role: 'UI/UX Designer',
    avatar: teamMembers[3].avatar,
    velocity: 13.8,
    completionRate: 94,
    feedbackScore: 4.2,
    trend: 0.8,
    tasksCompleted: 17,
    kudos: 12
  }
];

export const initialProgressLogs: ProgressLog[] = [
  {
    id: 'log-1',
    taskId: 'Task-102',
    taskTitle: 'Implement User Auth with Multi-Factor',
    hours: 4,
    notes: 'Completed TOTP validation logic and seed generation tests.',
    timestamp: 'Today, 9:30 AM',
    author: 'Marcus Wright'
  },
  {
    id: 'log-2',
    taskId: 'Task-104',
    taskTitle: 'Integrate Stripe Payment Gateway',
    hours: 3.5,
    notes: 'Verified webhook events in sandbox and updated billing status handler.',
    timestamp: 'Yesterday, 4:15 PM',
    author: 'Alex River'
  }
];

export const projectsHealth: ProjectHealth[] = [
  { name: 'Website Redesign', health: 88, velocity: 92, riskLevel: 'low' },
  { name: 'Infrastructure Setup', health: 95, velocity: 98, riskLevel: 'low' },
  { name: 'Security Compliance', health: 72, velocity: 78, riskLevel: 'medium' }
];

export const initialTasks: Task[] = [
  {
    id: "Task-102",
    title: "Implement User Auth with Multi-Factor",
    project: "Website Redesign",
    priority: "High",
    status: "In Progress",
    description: "We need to enhance our current authentication flow by adding multi-factor authentication (MFA). This is a critical security requirement for our enterprise clients.\n\n* Users should be able to toggle MFA in their security settings.\n* Support for Time-based One-Time Password (TOTP) protocols (Google Authenticator, Authy).\n* Backup code generation for recovery purposes.",
    assignee: teamMembers[0], // Marcus
    reporter: teamMembers[1], // Sarah
    createdDate: "Oct 20, 2023",
    dueDate: "Oct 24, 2023",
    labels: ["Product", "Security"],
    timeLogged: 12,
    timeEstimated: 16,
    subtasks: [
      { id: "sub-1", title: "Setup OAuth infrastructure and providers", completed: true },
      { id: "sub-2", title: "Integrate TOTP generation and validation logic", completed: true },
      { id: "sub-3", title: "Design and implement Frontend UI for 2FA challenge", completed: false }
    ],
    attachments: [
      {
        id: "att-1",
        name: "Security_Spec_v2.pdf",
        size: "1.4 MB",
        added: "Yesterday",
        type: "pdf"
      },
      {
        id: "att-2",
        name: "MFA_Flow_Draft.png",
        size: "3.2 MB",
        added: "Today",
        type: "image",
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5_v107coRQbNVz8zT5YMLapsIKn6878I3nnjgEhxZnCxuPNQd4VriiWM1TVxDPMsLvmHYdqgtWH8_kF25S3snjGh9gkQVkC99CzfZzt30IkgM0hytSQyva96O885wMBEkeqbCNvYw-yLBpBz4iPg1VigldVhEPAD2gEcH2yezVklCR3uX7k1Dth8pekSMWrwqn-NU5DHQzL_3I86ZcEHSf_t3HUDlGjetzxDVNBETZv3dL38CbTbqNo9dD3li-MgxW_1j-yhxJjM6"
      }
    ],
    activity: [
      {
        id: "act-1",
        type: "comment",
        user: teamMembers[1], // Sarah
        content: "The security team has reviewed the TOTP logic. We should ensure we're using the latest crypto libraries for the seed generation.",
        timestamp: "2 hours ago",
        likes: 2
      },
      {
        id: "act-2",
        type: "log",
        user: teamMembers[0], // Marcus
        content: "moved this task from To Do to In Progress",
        timestamp: "5 hours ago"
      }
    ]
  },
  {
    id: "Task-101",
    title: "Setup CI/CD deployment pipeline",
    project: "Infrastructure Setup",
    priority: "High",
    status: "Done",
    description: "Create and configure deployment pipelines in Cloud Build with automated tests triggered on every pull request to main. Secure secrets storing using Secret Manager.",
    assignee: teamMembers[0], // Marcus
    reporter: teamMembers[1], // Sarah
    createdDate: "Oct 15, 2023",
    dueDate: "Oct 19, 2023",
    labels: ["DevOps", "Infrastructure"],
    timeLogged: 8,
    timeEstimated: 8,
    subtasks: [
      { id: "sub-101-1", title: "Write Cloud Build YAML config", completed: true },
      { id: "sub-101-2", title: "Setup staging/production environment secrets", completed: true },
      { id: "sub-101-3", title: "Configure GitHub repository webhooks", completed: true }
    ],
    attachments: [],
    activity: [
      {
        id: "act-101-1",
        type: "log",
        user: teamMembers[0],
        content: "marked all subtasks as complete and moved task to Done",
        timestamp: "Yesterday"
      }
    ]
  },
  {
    id: "Task-103",
    title: "Redesign Landing Page Hero Section",
    project: "Website Redesign",
    priority: "Medium",
    status: "In Progress",
    description: "The marketing team needs a more modern, conversions-oriented hero section with refined typography, a dramatic product graphic, and a primary CTA linked to our email enrollment form.",
    assignee: teamMembers[3], // Jessica
    reporter: teamMembers[1], // Sarah
    createdDate: "Oct 21, 2023",
    dueDate: "Oct 26, 2023",
    labels: ["Marketing", "Design"],
    timeLogged: 4,
    timeEstimated: 12,
    subtasks: [
      { id: "sub-103-1", title: "Brainstorm hero layout ideas", completed: true },
      { id: "sub-103-2", title: "Create Figma high-fidelity prototypes", completed: false },
      { id: "sub-103-3", title: "Implement React front-end layout", completed: false }
    ],
    attachments: [
      {
        id: "att-103-1",
        name: "hero_sketch_concept.png",
        size: "2.1 MB",
        added: "2 days ago",
        type: "image"
      }
    ],
    activity: [
      {
        id: "act-103-1",
        type: "comment",
        user: teamMembers[3],
        content: "I will finish the Figma models by tomorrow morning so we can review before implementing.",
        timestamp: "4 hours ago",
        likes: 1
      }
    ]
  },
  {
    id: "Task-104",
    title: "Integrate Stripe Payment Gateway",
    project: "Website Redesign",
    priority: "High",
    status: "Review",
    description: "Implement billing support via Stripe. This requires integrating Checkout sessions, handling webhook events for customer subscriptions, and updating the database with billing status.",
    assignee: teamMembers[2], // Alex
    reporter: teamMembers[0], // Marcus
    createdDate: "Oct 18, 2023",
    dueDate: "Oct 25, 2023",
    labels: ["Backend", "Billing"],
    timeLogged: 14,
    timeEstimated: 15,
    subtasks: [
      { id: "sub-104-1", title: "Setup Stripe webhook endpoint", completed: true },
      { id: "sub-104-2", title: "Create customer subscription session API", completed: true },
      { id: "sub-104-3", title: "Integrate frontend billing card UI", completed: true }
    ],
    attachments: [],
    activity: [
      {
        id: "act-104-1",
        type: "comment",
        user: teamMembers[2],
        content: "Webhooks have been verified in sandbox mode. Review code changes in PR #422.",
        timestamp: "10 hours ago",
        likes: 3
      }
    ]
  },
  {
    id: "Task-105",
    title: "Optimize database queries for reports",
    project: "Website Redesign",
    priority: "Low",
    status: "To Do",
    description: "Our reporting dashboard queries take up to 8 seconds to load for enterprise users. We need to add composite indexes on multi-tenant columns and pre-aggregate monthly telemetry logs.",
    assignee: teamMembers[0], // Marcus
    reporter: teamMembers[2], // Alex
    createdDate: "Oct 22, 2023",
    dueDate: "Oct 29, 2023",
    labels: ["Database", "Performance"],
    timeLogged: 0,
    timeEstimated: 10,
    subtasks: [
      { id: "sub-105-1", title: "Analyze query execution plans", completed: false },
      { id: "sub-105-2", title: "Create indexes on customer_id + created_at", completed: false },
      { id: "sub-105-3", title: "Optimize monthly summary scheduler job", completed: false }
    ],
    attachments: [],
    activity: []
  },
  {
    id: "Task-106",
    title: "Write unit tests for authentication logic",
    project: "Website Redesign",
    priority: "Medium",
    status: "To Do",
    description: "Write robust Jest/Vitest unit tests for our secure cookie storage, JWT extraction, and MFA validation middlewares to achieve 90%+ code coverage.",
    assignee: teamMembers[2], // Alex
    reporter: teamMembers[0], // Marcus
    createdDate: "Oct 23, 2023",
    dueDate: "Oct 30, 2023",
    labels: ["Security", "Testing"],
    timeLogged: 0,
    timeEstimated: 6,
    subtasks: [
      { id: "sub-106-1", title: "Set up Vitest config in backend folder", completed: false },
      { id: "sub-106-2", title: "Mock request/response for auth tests", completed: false },
      { id: "sub-106-3", title: "Achieve coverage target for auth handler", completed: false }
    ],
    attachments: [],
    activity: []
  }
];
