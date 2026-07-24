import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK if API Key is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. AI features will run in mock mode.");
}

// Interfaces
interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "High" | "Medium" | "Low";
  category: "Product" | "Design" | "Dev" | "Marketing" | "Ops" | "Success";
  assigneeId: string;
  dueDate: string;
  completedDate?: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  efficiency: number;
}

interface ChatMessage {
  id: string;
  channel: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

// Initial/Seeded Data
const DEFAULT_MEMBERS: Member[] = [
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    role: "Admin / Product Lead",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJjv1wgSNQTwWcBx1-XAbxXpG2QHxPgUZV2zK4ljF6DuvTLTTp9kQj72EOrh0cQxaL_ceDXlPCLd0opTmufODIR2Tt45sV7AGbEznP_SgCBn5OP4CGnlwMLbapipMnGNg4icF4SDGQgSdaTeGv8Vh6O04VSWXmq1niCuujqtIVxJeHp1f2M1I1dTxWYUBkJgV8anoBtMxBlfvyfKpPbG0MoSbv6hfAGyl9tZTNz70g4-t5NeysmT-AwaIYSY3k0ohz2541XHXJXR8G",
    efficiency: 95
  },
  {
    id: "marcus-chen",
    name: "Marcus Chen",
    role: "Senior Backend Engineer",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjPFX-JU7THBKNRGQtZx2IeW41NT8Gq9IClQP76_VMlwobcoO33UTqb3ad3eT1EOuo7OZThxebklw0pXFkDwuIeIljtpF4BXdwnypPa53KDFlAh8NkrxkiIYlGRkf0w6BZ2cRt1dQtBGok6R-uh8DOWi5rQ8BHKbZ04NsuV1gC8OZ3FHGhu2SAerHXztxJ2F440rwXEMiygOCfLn3Inri53dio9F1LsOEOBJ3KZYepHadc_gQMI_E-79EhDntK7k509sf2jFXwvv0I",
    efficiency: 92
  },
  {
    id: "emma-watson",
    name: "Emma Watson",
    role: "Lead UX Designer",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2YSlamauV6vYCmQnlcL1sGmQE_PNhsCOn-qVQ3LjdgQaTn6EoUlWOlGEw8926tIyCVtAkik18c1aPdTnJpKZv3bk4rO6W6nzTFTZeoJAP7FQQ0YK97guz_1uIwt1QkUBc0Inb2vfrx7cr-babWYbEVpw-iQ2TLe_Yr24d5N5C4KuN_259ucPFR0U8dIw4TOwzt7589oKjj5beKxI4ggEidMxnBsDr6iIkpl4HJCMVqU1MT98lnUAdjI0fcJ9Lll4EJ7-xp0DaXDIj",
    efficiency: 88
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    role: "QA & Automation Lead",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6anMzHuUviIN_6D_O9zBx2Qr5yUZJey4u-sSyvJsrlznKaqVkzdpsq8Q-FUTKAQvLdIQ6T3HDIcD1AIDJ1RXtWRPxDQjpuAiFAN_Dd0ID9uEGY6Epy4418AYNO7OknCfnUgK-_QYl8U1SfPQuw2wiGeG-Niz9CwX7yY-3rfc75FRu3N-926U-1x-BgWOqNPZ5pRXlx6pbxILeK15Vqyp8148mEJJ4WILjHUyhBU4OEzyCNBqt6wHi4MsACAghhgbFis0Dsh4ydRmC",
    efficiency: 94
  },
  {
    id: "david-miller",
    name: "David Miller",
    role: "Marketing Director",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgaGjv2tTrhS65Qp-fu0aTJ0MLghAeMs60bw1yidROQxXNFXDzXUrqgUJFwrnj8d0OjXLZf-Ecm6kvv8j0McooWwJcjS2EDbzFgIQTxPIIycqKSBd1NjlpJBbYxB6gVEoQQcoYN5_w2LYOr32oqNQlr3tVOdTFaTKjxEDQrwFF7m0sEjGlPhi0mdpJKFYom1j-kMRx9Qyjt-QJQkFzZPjowGc-4QcXIv3CVQAfakw1RNjLUoDCC7DVUnO-hOzeu4Oepsyk08lDwDCI",
    efficiency: 85
  },
  {
    id: "robert-vance",
    name: "Robert Vance",
    role: "DevOps & Infrastructure Engineer",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2vkhng_DblsNPJw2RCZL7lFjQk8jqsBTzn7rlL1SStwBdleSXDpeCkSKOp2R3gTFLCx--rzxfkDf4d1EZzZRG2L0Ij7UjnpLfJGK_cHRcPSRHMXtVbXtxIVEMAInpN7FD2Y4ubJxkz3mmM9AKLVA02jJvCWcA1JnKgnP3WgHbuWi2pWLJTrRIEaYXjFlgfGfS34V4XbApIZuu1YCjIiCW16g5lu2UtlP6LS3d5KZHlX6y84BHGzwkiNeK96Xj2gpUtMCrIR81MzO0",
    efficiency: 90
  },
  {
    id: "clara-ashton",
    name: "Clara Ashton",
    role: "Data & Systems Analyst",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbRWPUh8nlfnXiSvMBFLqWVS63x5jKjm4tTTm2IcsasCV5TkWtF-SPO5oZy8G6MYx6FSWJc3BqMBlT5AkpBaLUnsurn6jcxr-gqeSAEVUv-mDoIiZeRZWsPbHqZCmxNUjfy4i09I5M1oGh_s1QYrZCFVIHMSfuD1T3GRjBmTNj5l1pZjoFOdy5X55JWAxM_K8xM_97gyh7yqQXXn80fd8OftKTk1SkB4gOCVczai2PMbfMgWjq_Xdc5ueo4nzLUAZDHr0F8czC2dd9",
    efficiency: 91
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Implement User Auth with Multi-Factor",
    description: "Provide robust security features including SMS/TOTP codes, recovery codes, and JWT based session keys. Design UI for enrolling MFA.",
    status: "todo",
    priority: "High",
    category: "Product",
    assigneeId: "alex-rivera",
    dueDate: "2023-10-24"
  },
  {
    id: "task-2",
    title: "Design System Audit for Accessibility",
    description: "Perform comprehensive color contrast checks, aria-label checks, keyboard navigability tests, and screen reader audits for key user flows.",
    status: "todo",
    priority: "Medium",
    category: "Design",
    assigneeId: "emma-watson",
    dueDate: "2023-10-28"
  },
  {
    id: "task-3",
    title: "API Infrastructure Migration to v3",
    description: "Optimize database querying, restructure REST responses, upgrade the payload size limit, and rewrite rate limiting middleware for faster execution.",
    status: "in_progress",
    priority: "High",
    category: "Dev",
    assigneeId: "marcus-chen",
    dueDate: "2023-10-20"
  },
  {
    id: "task-4",
    title: "Q4 Content Strategy Deck Preparation",
    description: "Brainstorm marketing campaigns, outline content calendar deliverables, research competitor outreach strategies, and format final corporate deck.",
    status: "in_progress",
    priority: "Low",
    category: "Marketing",
    assigneeId: "david-miller",
    dueDate: "2023-11-02"
  },
  {
    id: "task-5",
    title: "Server Health Monitoring Dashboard",
    description: "Build an internal Ops page visualizing CPU load, RAM consumption, database response latency, and active container counts.",
    status: "review",
    priority: "Medium",
    category: "Ops",
    assigneeId: "robert-vance",
    dueDate: "2023-10-19"
  },
  {
    id: "task-6",
    title: "Legacy Data Cleanup Phase 1",
    description: "Prune deprecated accounts, compress system logs from 2021, archive inactive transaction records, and optimize database indexing.",
    status: "done",
    priority: "Low",
    category: "Success",
    assigneeId: "clara-ashton",
    dueDate: "2023-10-15",
    completedDate: "2023-10-15"
  }
];

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: "msg-1",
    channel: "dev-migration",
    senderId: "marcus-chen",
    senderName: "Marcus Chen",
    senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjPFX-JU7THBKNRGQtZx2IeW41NT8Gq9IClQP76_VMlwobcoO33UTqb3ad3eT1EOuo7OZThxebklw0pXFkDwuIeIljtpF4BXdwnypPa53KDFlAh8NkrxkiIYlGRkf0w6BZ2cRt1dQtBGok6R-uh8DOWi5rQ8BHKbZ04NsuV1gC8OZ3FHGhu2SAerHXztxJ2F440rwXEMiygOCfLn3Inri53dio9F1LsOEOBJ3KZYepHadc_gQMI_E-79EhDntK7k509sf2jFXwvv0I",
    content: "Hey team! I have successfully drafted the API v3 endpoints. Currently optimizing the PostgreSQL index queries.",
    timestamp: "10:14 AM"
  },
  {
    id: "msg-2",
    channel: "dev-migration",
    senderId: "alex-rivera",
    senderName: "Alex Rivera",
    senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJjv1wgSNQTwWcBx1-XAbxXpG2QHxPgUZV2zK4ljF6DuvTLTTp9kQj72EOrh0cQxaL_ceDXlPCLd0opTmufODIR2Tt45sV7AGbEznP_SgCBn5OP4CGnlwMLbapipMnGNg4icF4SDGQgSdaTeGv8Vh6O04VSWXmq1niCuujqtIVxJeHp1f2M1I1dTxWYUBkJgV8anoBtMxBlfvyfKpPbG0MoSbv6hfAGyl9tZTNz70g4-t5NeysmT-AwaIYSY3k0ohz2541XHXJXR8G",
    content: "Awesome work Marcus. Let me know when you are ready to review the auth middleware. I want to ensure the MFA hooks play nicely with v3.",
    timestamp: "10:20 AM"
  }
];

// File Path for Local JSON Storage
const DATA_FILE = path.join(process.cwd(), "data-store.json");

// Load existing data or initialize with defaults
let store = {
  tasks: DEFAULT_TASKS,
  members: DEFAULT_MEMBERS,
  chat: DEFAULT_CHAT
};

try {
  if (fs.existsSync(DATA_FILE)) {
    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    store = JSON.parse(fileContent);
    console.log("Successfully loaded data from local store file.");
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
    console.log("Initialized local store file with seeded defaults.");
  }
} catch (err) {
  console.error("Failed loading data-store.json, using memory:", err);
}

const saveStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("Failed to persist store to local file:", err);
  }
};

// --- REST API ENDPOINTS ---

// GET /api/tasks
app.get("/api/tasks", (req, res) => {
  res.json(store.tasks);
});

// POST /api/tasks
app.post("/api/tasks", (req, res) => {
  const { title, description, status, priority, category, assigneeId, dueDate } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: title.trim(),
    description: (description || "").trim(),
    status: status || "todo",
    priority: priority || "Medium",
    category: category || "Product",
    assigneeId: assigneeId || "alex-rivera",
    dueDate: dueDate || new Date().toISOString().split("T")[0]
  };

  if (newTask.status === "done") {
    newTask.completedDate = new Date().toISOString().split("T")[0];
  }

  store.tasks.push(newTask);
  saveStore();
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const taskIdx = store.tasks.findIndex((t) => t.id === id);

  if (taskIdx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const currentTask = store.tasks[taskIdx];
  const { title, description, status, priority, category, assigneeId, dueDate } = req.body;

  const updatedTask: Task = {
    ...currentTask,
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(status !== undefined && { status }),
    ...(priority !== undefined && { priority }),
    ...(category !== undefined && { category }),
    ...(assigneeId !== undefined && { assigneeId }),
    ...(dueDate !== undefined && { dueDate }),
  };

  // Keep tracking completions
  if (status === "done" && currentTask.status !== "done") {
    updatedTask.completedDate = new Date().toISOString().split("T")[0];
  } else if (status !== "done") {
    delete updatedTask.completedDate;
  }

  store.tasks[taskIdx] = updatedTask;
  saveStore();
  res.json(updatedTask);
});

// DELETE /api/tasks/:id
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const taskIdx = store.tasks.findIndex((t) => t.id === id);

  if (taskIdx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const deleted = store.tasks.splice(taskIdx, 1)[0];
  saveStore();
  res.json(deleted);
});

// GET /api/members
app.get("/api/members", (req, res) => {
  res.json(store.members);
});

// GET /api/chat/:channel
app.get("/api/chat/:channel", (req, res) => {
  const { channel } = req.params;
  const messages = store.chat.filter((m) => m.channel === channel);
  res.json(messages);
});

// POST /api/chat
app.post("/api/chat", async (req, res) => {
  const { channel, senderId, senderName, senderAvatar, content } = req.body;

  if (!channel || !content) {
    return res.status(400).json({ error: "Channel and content are required" });
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    channel,
    senderId,
    senderName,
    senderAvatar,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  store.chat.push(newMsg);
  saveStore();

  // If message pings @PM-AI, trigger the Gemini AI response!
  const isAiPing = content.includes("@PM-AI") || channel === "ai-pm-direct";
  
  if (isAiPing) {
    // Generate AI PM assistant response asynchronously
    res.json({ userMessage: newMsg, aiWillRespond: true });
    
    setTimeout(async () => {
      try {
        let aiResponseText = "";
        
        if (ai) {
          // Construct the current board state context for the model
          const boardSummary = store.tasks.map(t => {
            const assignee = store.members.find(m => m.id === t.assigneeId)?.name || "Unassigned";
            return `- [${t.status.toUpperCase()}] ${t.title} (${t.category}, Priority: ${t.priority}, Assignee: ${assignee}, Due: ${t.dueDate})`;
          }).join("\n");

          const prompt = `You are @PM-AI, the advanced AI Project Manager inside the TaskPro Enterprise corporate portal.
You have absolute knowledge of the current Kanban board state, team workloads, and priorities.

Current board tasks:
${boardSummary}

Team members:
${store.members.map(m => `- ${m.name} (${m.role})`).join("\n")}

A team member (${senderName}) wrote in channel #${channel}:
"${content}"

Provide a professional, actionable, yet encouraging PM response. Be structured, clear, and direct. You can refer to specific tasks, dates, assignees, and project bottlenecks. Keep your reply concise (1-3 paragraphs or simple bullet points). Output clean plain text or Markdown. Do NOT use markdown code blocks with HTML or JSON.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
          });

          aiResponseText = response.text || "I apologize, but I had trouble understanding that context. Let me know how I can help coordinate the board!";
        } else {
          // Mock response if Gemini is not set up
          aiResponseText = `*[@PM-AI Automated Notice]*: Hello **${senderName}**! I received your message about: "${content}". 

As the project assistant, here is a quick status check:
- **Marcus Chen** is currently making progress on **API Infrastructure Migration to v3** (Due Oct 20).
- We have **MFA Auth Integration** and **Accessibility Audit** in our *To Do* queue.
- Let me know if you would like me to adjust any priorities or help draft specifications! *(Enable your GEMINI_API_KEY in the Secrets panel to activate full interactive AI intelligence!)*`;
        }

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          channel,
          senderId: "ai-pm",
          senderName: "PM-AI (Project Manager)",
          senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJjv1wgSNQTwWcBx1-XAbxXpG2QHxPgUZV2zK4ljF6DuvTLTTp9kQj72EOrh0cQxaL_ceDXlPCLd0opTmufODIR2Tt45sV7AGbEznP_SgCBn5OP4CGnlwMLbapipMnGNg4icF4SDGQgSdaTeGv8Vh6O04VSWXmq1niCuujqtIVxJeHp1f2M1I1dTxWYUBkJgV8anoBtMxBlfvyfKpPbG0MoSbv6hfAGyl9tZTNz70g4-t5NeysmT-AwaIYSY3k0ohz2541XHXJXR8G", // Admin style avatar
          content: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        store.chat.push(aiMsg);
        saveStore();
      } catch (err) {
        console.error("Error generating @PM-AI response:", err);
      }
    }, 1000);

  } else {
    res.json({ userMessage: newMsg, aiWillRespond: false });
  }
});

// --- ADVANCED AI ENDPOINTS ---

// POST /api/ai/analyze (Board Bottlenecks & Executive Insights)
app.post("/api/ai/analyze", async (req, res) => {
  try {
    if (!ai) {
      return res.json({
        success: false,
        insights: `### ⚠️ No API Key Detected
To activate full executive AI analyses, please configure your **GEMINI_API_KEY** in the secrets manager.

**Mock Board Health Check Summary:**
- **Workload distribution:** Marcus Chen has high priority tasks in progress.
- **Deadlines check:** API Migration to v3 is close to its original target of October 20.
- **Recommendations:** Re-allocate Emma Watson's accessibility audit review if backend tasks overflow.`
      });
    }

    const boardSummary = store.tasks.map(t => {
      const assignee = store.members.find(m => m.id === t.assigneeId)?.name || "Unassigned";
      return `- Task: "${t.title}" | Status: ${t.status.toUpperCase()} | Priority: ${t.priority} | Cat: ${t.category} | Assignee: ${assignee} | Due: ${t.dueDate}`;
    }).join("\n");

    const prompt = `You are the lead Executive Scrum Master & Operations AI Analyst for TaskPro Enterprise.
Analyze the following corporate Kanban board and provide a concise, high-impact executive report.

Board Tasks:
${boardSummary}

Team Workloads:
${store.members.map(m => `- ${m.name} (${m.role})`).join("\n")}

Generate an insights report structured into:
1. **Critical Bottleneck Identification** (Is any single developer overloaded? Are tasks piling up in "In Progress" or "Review"?)
2. **Velocity & Timeline Risk Assessments** (Are any High Priority tasks at risk of missing their deadlines?)
3. **Actionable PM Recommendations** (Give concrete task reassignments, flow adjustments, or coordination steps to optimize throughput.)

Keep it professional, direct, and formatted in clean, elegant Markdown. Output ONLY the markdown report.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      insights: response.text
    });
  } catch (err: any) {
    console.error("AI Analysis failed:", err);
    res.status(500).json({ error: "Failed to generate AI insights: " + err.message });
  }
});

// POST /api/ai/polish (Task Description Specification Polish)
app.post("/api/ai/polish", async (req, res) => {
  const { title, currentDesc, category, priority } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  try {
    if (!ai) {
      // Mock polish
      const polished = `### 📋 [POLISHED SPEC] ${title}
**Category:** ${category || "Product"} | **Priority:** ${priority || "Medium"}

#### 1. Objective & Context
${currentDesc || "Implement core functional deliverables supporting team alignment."}

#### 2. Detailed Scope & Requirements
- **Functional Requirements:** Complete all key screens, validations, and edge case checks.
- **Technical Standards:** Build with responsive Tailwind components and secure standard handlers.
- **Acceptance Criteria:** Fully tested in-browser, fully accessible, and verified by team leads.

*(Enable GEMINI_API_KEY in secrets to get custom, hyper-detailed specifications from the Gemini model)*`;
      return res.json({ success: false, polished });
    }

    const prompt = `You are a Principal Product Manager & Technical Writer.
Your task is to expand and polish a simple task title and short description into a comprehensive, professional, enterprise-grade task specification.

Input Task Title: "${title}"
Category: "${category}"
Priority: "${priority}"
Short Description: "${currentDesc || "(No current description provided)"}"

Generate a polished task specification structured with:
- **1. Project Context & Objectives** (Why this task is critical, what value it brings)
- **2. Core Technical Scope & Requirements** (Concrete engineering or design tasks required to complete it)
- **3. Explicit Acceptance Criteria** (Bullet points specifying exactly what makes it "done")

Make it crisp, highly technical, and professional. Output ONLY the polished specification in Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      polished: response.text
    });
  } catch (err: any) {
    console.error("AI Polish failed:", err);
    res.status(500).json({ error: "Failed to polish description: " + err.message });
  }
});

// POST /api/ai/performance-report (Generate Team Performance Written Report)
app.post("/api/ai/performance-report", async (req, res) => {
  try {
    if (!ai) {
      return res.json({
        success: false,
        report: `### 📈 Executive Team Performance Review
**Status:** Running in Sandbox Mode (GEMINI_API_KEY missing)

**High-Level Metric Insights:**
- **Current Completion Ratio:** ${store.tasks.filter(t => t.status === "done").length} / ${store.tasks.length} total tasks.
- **Top Performer:** Alex Rivera and Clara Ashton are leading velocity cycles.
- **Resource Recommendation:** Balance future REST API tasks across multiple developers to relieve backend bottlenecks.`
      });
    }

    // Prepare stats
    const totalTasks = store.tasks.length;
    const completedTasks = store.tasks.filter(t => t.status === "done").length;
    const inProgressTasks = store.tasks.filter(t => t.status === "in_progress").length;
    
    const memberReport = store.members.map(m => {
      const open = store.tasks.filter(t => t.assigneeId === m.id && t.status !== "done").length;
      const completed = store.tasks.filter(t => t.assigneeId === m.id && t.status === "done").length;
      return `- Assignee: ${m.name} | Role: ${m.role} | Base Efficiency: ${m.efficiency}% | Active Tasks: ${open} | Completed Tasks: ${completed}`;
    }).join("\n");

    const prompt = `You are the VP of Human Resources and Technical Operations at TaskPro Enterprise.
Evaluate the current team throughput based on this live performance state.

Sprint Statistics:
- Total Tasks: ${totalTasks}
- Completed Tasks: ${completedTasks}
- Active In Progress: ${inProgressTasks}

Individual Team Member Metrics:
${memberReport}

Write a comprehensive, highly corporate performance evaluation report.
Focus on:
1. **Team Strength Analysis** (Acknowledge top performers, high efficiency contributors, and role specialties)
2. **Operational Efficiency Audit** (Discuss how task division aligns with base efficiency metrics)
3. **Growth & Optimization Plan** (Suggest strategic upskilling, peer support, or automation integrations to boost the overall operational score)

Keep it sophisticated, highly constructive, and formatted in elegant Markdown. Output ONLY the markdown report.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      report: response.text
    });
  } catch (err: any) {
    console.error("Performance report failed:", err);
    res.status(500).json({ error: "Failed to generate performance report: " + err.message });
  }
});


// --- INITIALIZE SERVER AND VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
