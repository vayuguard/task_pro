import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for the session
const initialMessagesByChannel: Record<string, any[]> = {
  "project-alpha": [
    {
      id: "msg-1",
      senderName: "Alex Rivers",
      senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlkP6S61HDnanPNbAvqmcVUm38u9wh4DmKCq5YymooHJKnJBFruprlJSdSUnSlCNNc7Jg5z2cPddSCtfNOK_kUDnuDQhxSVuZX4Jsd9EdEfqpQKi6ajVUPS7brHFb-shUGlYjDoVNrzYUa_svi5NY_TavTzNMTupXoenXDUPpaX6dhgAsre7sZoGbB603ziJReZeptO_U4clqfVmd8rLN4e38shLBMnj2CE7vrH7Po1xuQwK7qgEmXVTa9sm2Vxs8qL6OzEfK64npc",
      text: "Morning! Starting the backend migration for project-alpha now. Expect some minor latency for the next 15 minutes.",
      timestamp: "09:15 AM",
      isSentByMe: false
    },
    {
      id: "msg-2",
      senderName: "Sarah Chen",
      senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBn_a936c4V2fw_LZlU-So4eUga12Eu-kSiEOP7T3dBL6toBiNIiQhsYlPga2xy6b0h-Q5yFX0dB8gugjuSVUqOGf_jvZIBhlZ6ecCgbDrXQtXO2WzhNSvQls4GwBzlXmursud96odF3gszXCOF0j4M3TzOQ8zAXMJhWJp3vF7XJ5v3UY3C8xXuOnCSCxymULpv3j64EaxfBxfyEGtqr3lCMyIzf7xLo36PrWitw19uvKTIZbag086UcHzI3SPIH87RIFB2Zq2ofFx",
      text: "Hey team, just uploaded the final design specs for the dashboard. You can find them in the shared folder under /design-assets/v2. Let me know if anything is unclear!",
      timestamp: "11:38 AM",
      fileAttachment: {
        name: "Alpha_Dashboard_Final.pdf",
        size: "4.2 MB",
        type: "PDF Document"
      },
      isSentByMe: false
    },
    {
      id: "msg-3",
      senderName: "User",
      senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa",
      text: "Thanks Sarah! I've already updated the Figma links in the project dashboard. Let's touch base at 2 PM for the final walkthrough.",
      timestamp: "11:42 AM",
      isSentByMe: true
    }
  ],
  "general": [
    {
      id: "msg-gen-1",
      senderName: "David Miller",
      senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmmzscXXNoFV78sRKoANk0xATK3-DoSTKorkoz4S1QwNfTt3gCiFrZxn3BZyVVJiLdgBvzNrQmd5DujjIBg-98y8diX7WqCbi6LDjCLpk5VfguzoIRmwfVQMxnWE9aDBBVimgeJ9fVB3o5DMS2v8P-qjjbiC3oO_wnLA81xXoT6zcA4KbycCa6FfH14_OAkihP6ln-KprxYwARFGYuPI87Im5a8FQCk9Ice-X2EGHlDtQsp_IWK61R2UrfXufCzmqsunL0zwSd1Y8S",
      text: "Welcome to TaskPro Enterprise chat channel! Please review the guidelines in pinned messages.",
      timestamp: "Yesterday",
      isSentByMe: false
    }
  ],
  "emergency": [
    {
      id: "msg-em-1",
      senderName: "System Alert",
      senderAvatar: "",
      text: "🚨 Automated Deployment Check: All production containers are operational. No active incident reports.",
      timestamp: "08:00 AM",
      isSentByMe: false
    }
  ],
  "gemini-ai": [
    {
      id: "msg-ai-1",
      senderName: "Gemini AI",
      senderAvatar: "",
      text: "Hello! I am Gemini AI, your Enterprise Co-Worker. Feel free to ask me to analyze project metrics, summarize discussion threads, draft user stories, or write team performance reviews! How can I assist you today?",
      timestamp: "09:00 AM",
      isSentByMe: false
    }
  ]
};

const initialTasks: any[] = [
  {
    id: "task-1",
    title: "Finalize Alpha Dashboard mockup UI",
    description: "Design the high-fidelity team chat and corporate dashboard views. Ensure consistency with Executive Precision design tokens.",
    status: "review",
    priority: "high",
    assignee: {
      name: "Sarah Chen",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBn_a936c4V2fw_LZlU-So4eUga12Eu-kSiEOP7T3dBL6toBiNIiQhsYlPga2xy6b0h-Q5yFX0dB8gugjuSVUqOGf_jvZIBhlZ6ecCgbDrXQtXO2WzhNSvQls4GwBzlXmursud96odF3gszXCOF0j4M3TzOQ8zAXMJhWJp3vF7XJ5v3UY3C8xXuOnCSCxymULpv3j64EaxfBxfyEGtqr3lCMyIzf7xLo36PrWitw19uvKTIZbag086UcHzI3SPIH87RIFB2Zq2ofFx"
    },
    dueDate: "2026-07-22",
    subtasks: [
      { id: "sub-1-1", text: "Create typography specs for Inter", completed: true },
      { id: "sub-1-2", text: "Map executive precision color palette", completed: true },
      { id: "sub-1-3", text: "Design right channel details panel", completed: false }
    ],
    comments: [
      { id: "c-1", author: "User", avatar: "", text: "Looks fantastic, Sarah! Ready for final feedback.", timestamp: "1 hour ago" }
    ],
    timeSpent: 7200
  },
  {
    id: "task-2",
    title: "Backend infrastructure migration",
    description: "Migrate legacy project alpha data layers to the new high-performance full-stack API server. Monitor latency trends.",
    status: "inprogress",
    priority: "high",
    assignee: {
      name: "Alex Rivers",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlkP6S61HDnanPNbAvqmcVUm38u9wh4DmKCq5YymooHJKnJBFruprlJSdSUnSlCNNc7Jg5z2cPddSCtfNOK_kUDnuDQhxSVuZX4Jsd9EdEfqpQKi6ajVUPS7brHFb-shUGlYjDoVNrzYUa_svi5NY_TavTzNMTupXoenXDUPpaX6dhgAsre7sZoGbB603ziJReZeptO_U4clqfVmd8rLN4e38shLBMnj2CE7vrH7Po1xuQwK7qgEmXVTa9sm2Vxs8qL6OzEfK64npc"
    },
    dueDate: "2026-07-25",
    subtasks: [
      { id: "sub-2-1", text: "Expose Express API channels endpoint", completed: true },
      { id: "sub-2-2", text: "Integrate Gemini AI backend model proxy", completed: true },
      { id: "sub-2-3", text: "Verify Docker load balance stability", completed: false }
    ],
    comments: [],
    timeSpent: 12400
  },
  {
    id: "task-3",
    title: "Draft release roadmap guidelines",
    description: "Draft standard guidelines for the project alpha release cycle in Notion. Highlight key dependencies and deliverables.",
    status: "todo",
    priority: "medium",
    assignee: {
      name: "David Miller",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmmzscXXNoFV78sRKoANk0xATK3-DoSTKorkoz4S1QwNfTt3gCiFrZxn3BZyVVJiLdgBvzNrQmd5DujjIBg-98y8diX7WqCbi6LDjCLpk5VfguzoIRmwfVQMxnWE9aDBBVimgeJ9fVB3o5DMS2v8P-qjjbiC3oO_wnLA81xXoT6zcA4KbycCa6FfH14_OAkihP6ln-KprxYwARFGYuPI87Im5a8FQCk9Ice-X2EGHlDtQsp_IWK61R2UrfXufCzmqsunL0zwSd1Y8S"
    },
    dueDate: "2026-07-28",
    subtasks: [
      { id: "sub-3-1", text: "Consult department resource calendars", completed: false },
      { id: "sub-3-2", text: "Establish milestones with engineering", completed: false }
    ],
    comments: [],
    timeSpent: 0
  },
  {
    id: "task-4",
    title: "Verify security rules audit compliance",
    description: "Conduct security review audit of storage and data collection endpoints. Hardcode no API keys in frontend bundles.",
    status: "done",
    priority: "high",
    assignee: {
      name: "Alex Rivers",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlkP6S61HDnanPNbAvqmcVUm38u9wh4DmKCq5YymooHJKnJBFruprlJSdSUnSlCNNc7Jg5z2cPddSCtfNOK_kUDnuDQhxSVuZX4Jsd9EdEfqpQKi6ajVUPS7brHFb-shUGlYjDoVNrzYUa_svi5NY_TavTzNMTupXoenXDUPpaX6dhgAsre7sZoGbB603ziJReZeptO_U4clqfVmd8rLN4e38shLBMnj2CE7vrH7Po1xuQwK7qgEmXVTa9sm2Vxs8qL6OzEfK64npc"
    },
    dueDate: "2026-07-19",
    subtasks: [
      { id: "sub-4-1", text: "Validate client-side key exclusion", completed: true },
      { id: "sub-4-2", text: "Set up server API proxies for all AI features", completed: true }
    ],
    comments: [
      { id: "c-4-1", author: "Security Bot", avatar: "", text: "Passed automated dependency scanner review.", timestamp: "Yesterday" }
    ],
    timeSpent: 9800
  },
  {
    id: "task-5",
    title: "Personal Setup & Welcome Guidelines",
    description: "Initialize personal task lists and log current sprint objectives inside the customized corporate portal.",
    status: "inprogress",
    priority: "low",
    assignee: {
      name: "User",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa"
    },
    dueDate: "2026-07-21",
    subtasks: [
      { id: "sub-5-1", text: "Integrate team stats calculations", completed: false },
      { id: "sub-5-2", text: "Configure executive precision layouts", completed: true }
    ],
    comments: [],
    timeSpent: 1800
  }
];

// Lazy Gemini Initialization
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API Endpoints
app.get("/api/messages/:channelId", (req, res) => {
  const { channelId } = req.params;
  const messages = initialMessagesByChannel[channelId] || [];
  res.json(messages);
});

app.post("/api/messages/:channelId", async (req, res) => {
  const { channelId } = req.params;
  const { text, senderName, senderAvatar, fileAttachment, isSentByMe } = req.body;
  
  if (!initialMessagesByChannel[channelId]) {
    initialMessagesByChannel[channelId] = [];
  }

  const userMsg = {
    id: `msg-${Date.now()}`,
    senderName: senderName || "User",
    senderAvatar: senderAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa",
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fileAttachment,
    isSentByMe: isSentByMe !== undefined ? isSentByMe : true
  };

  initialMessagesByChannel[channelId].push(userMsg);

  // Check if message is directed to Gemini AI, or has keyword "@gemini" or "gemini"
  const isDirectMessageToGemini = channelId === "gemini-ai";
  const containsGeminiMention = text.toLowerCase().includes("@gemini") || text.toLowerCase().includes("gemini");

  if (isDirectMessageToGemini || containsGeminiMention) {
    // Generate Gemini Response
    try {
      const gemini = getGemini();
      let aiText = "";

      if (gemini) {
        const systemInstruction = `You are "Gemini AI", a highly efficient, professional, and slightly witty Enterprise Project co-worker inside TaskPro Enterprise. 
The user is working in a corporate portal that has a Kanban Board, Admin & Employee dashboards, Performance charts, and Team Chat.
You are fully conversational. Provide highly contextual corporate responses, suggestions for project-alpha, task updates, or general encouragement. Keep replies concise and professional (maximum 3 paragraphs).`;

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Channel Context: #${channelId}
Conversation History so far:
${JSON.stringify(initialMessagesByChannel[channelId].slice(-6))}

User's last message: "${text}"`,
          config: {
            systemInstruction
          }
        });

        aiText = response.text || "I processed your request, but returned an empty response. Let's touch base again shortly!";
      } else {
        // Fallback simulated response
        aiText = `[Simulated AI Co-Worker Reply]
Hi there! This is a local simulation of Gemini AI. To enable full AI responses, please configure your actual \`GEMINI_API_KEY\` in the Secrets panel in AI Studio.

Based on your message: "${text}", I highly recommend coordinating with Sarah Chen on the UI specs and reviewing Alex's backend migration logs!`;
      }

      const geminiMsg = {
        id: `msg-${Date.now()}-ai`,
        senderName: "Gemini AI",
        senderAvatar: "", // Uses custom fallback logo in UI
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSentByMe: false
      };

      initialMessagesByChannel[channelId].push(geminiMsg);
      return res.json({ userMsg, aiMsg: geminiMsg });
    } catch (err: any) {
      console.error("Gemini Error:", err);
      const errorMsg = {
        id: `msg-${Date.now()}-err`,
        senderName: "Gemini AI (Error)",
        senderAvatar: "",
        text: `⚠️ Error invoking Gemini API: ${err.message}. Please verify your API key in AI Studio Secrets settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSentByMe: false
      };
      initialMessagesByChannel[channelId].push(errorMsg);
      return res.json({ userMsg, aiMsg: errorMsg });
    }
  }

  res.json({ userMsg });
});

// Kanban & Tasks Endpoints
app.get("/api/tasks", (req, res) => {
  res.json(initialTasks);
});

app.post("/api/tasks", (req, res) => {
  const { title, description, priority, assigneeName, status } = req.body;
  
  const avatars: Record<string, string> = {
    "Sarah Chen": "https://lh3.googleusercontent.com/aida-public/AB6AXuCBn_a936c4V2fw_LZlU-So4eUga12Eu-kSiEOP7T3dBL6toBiNIiQhsYlPga2xy6b0h-Q5yFX0dB8gugjuSVUqOGf_jvZIBhlZ6ecCgbDrXQtXO2WzhNSvQls4GwBzlXmursud96odF3gszXCOF0j4M3TzOQ8zAXMJhWJp3vF7XJ5v3UY3C8xXuOnCSCxymULpv3j64EaxfBxfyEGtqr3lCMyIzf7xLo36PrWitw19uvKTIZbag086UcHzI3SPIH87RIFB2Zq2ofFx",
    "Alex Rivers": "https://lh3.googleusercontent.com/aida-public/AB6AXuBlkP6S61HDnanPNbAvqmcVUm38u9wh4DmKCq5YymooHJKnJBFruprlJSdSUnSlCNNc7Jg5z2cPddSCtfNOK_kUDnuDQhxSVuZX4Jsd9EdEfqpQKi6ajVUPS7brHFb-shUGlYjDoVNrzYUa_svi5NY_TavTzNMTupXoenXDUPpaX6dhgAsre7sZoGbB603ziJReZeptO_U4clqfVmd8rLN4e38shLBMnj2CE7vrH7Po1xuQwK7qgEmXVTa9sm2Vxs8qL6OzEfK64npc",
    "David Miller": "https://lh3.googleusercontent.com/aida-public/AB6AXuAmmzscXXNoFV78sRKoANk0xATK3-DoSTKorkoz4S1QwNfTt3gCiFrZxn3BZyVVJiLdgBvzNrQmd5DujjIBg-98y8diX7WqCbi6LDjCLpk5VfguzoIRmwfVQMxnWE9aDBBVimgeJ9fVB3o5DMS2v8P-qjjbiC3oO_wnLA81xXoT6zcA4KbycCa6FfH14_OAkihP6ln-KprxYwARFGYuPI87Im5a8FQCk9Ice-X2EGHlDtQsp_IWK61R2UrfXufCzmqsunL0zwSd1Y8S",
    "User": "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa"
  };

  const newTask = {
    id: `task-${Date.now()}`,
    title: title || "New Task Title",
    description: description || "Task Description",
    status: status || "todo",
    priority: priority || "medium",
    assignee: {
      name: assigneeName || "User",
      avatar: avatars[assigneeName] || avatars["User"]
    },
    dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    subtasks: [],
    comments: [],
    timeSpent: 0
  };

  initialTasks.push(newTask);
  res.json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const taskIndex = initialTasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    initialTasks[taskIndex] = { ...initialTasks[taskIndex], ...updates };
    res.json(initialTasks[taskIndex]);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// Gemini Performance Review / AI Report Generator
app.post("/api/gemini/review", async (req, res) => {
  try {
    const gemini = getGemini();
    const { userName } = req.body;

    const dataReport = {
      teamTasks: initialTasks,
      teamMembers: ["Sarah Chen", "Alex Rivers", "David Miller", "User (You)"],
      currentTime: new Date().toISOString()
    };

    let reviewText = "";

    if (gemini) {
      const prompt = `Write a comprehensive, professional, and visually spectacular corporate performance review report for "${userName || "User"}". 
Analyze the current Kanban task logs and produce an Executive Summary of their deliverables:
- Task metrics analysis (todo, in progress, review, done tasks)
- Focus highlights and performance assessment based on priority and workloads
- Concrete developmental recommendations to achieve sprint completion
- Incorporate professional corporate vocabulary, using markdown bold accents and headers. Keep it inspiring yet highly analytical.

Data Logs for reference:
${JSON.stringify(dataReport, null, 2)}`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite AI Chief Operations Officer & Performance Evaluator at TaskPro Enterprise."
        }
      });
      reviewText = response.text || "Empty report returned.";
    } else {
      reviewText = `### 📊 EXECUTIVE SUMMARY & PERFORMANCE EVALUATION
**Employee Name**: ${userName || "User"}
**Evaluation Period**: Mid-Sprint 
**System Mode**: Local Simulation

#### 1. CORE METRICS DELIVERY
- **Total Workspace Tasks**: ${initialTasks.length} active logs
- **User Assigned Actions**: ${initialTasks.filter(t => t.assignee.name === "User" || t.assignee.name === "User (You)").length} items
- **Sprint Completion Speed Index**: **1.8 Days** (Optimal workload threshold)

#### 2. WORKLOAD ASSESSMENT
Your commitment to **"Personal Setup & Welcome Guidelines"** indicates strong structural onboarding diligence. The workspace maintains an active velocity of **75% Team Momentum** with 12 tasks delivered today.

#### 3. DEVELOPMENTAL RECOMMENDATIONS
- **Deepen Cross-Functional Syncs**: Establish a standard checkpoint with *Sarah Chen* regarding Figma design specs in the project details.
- **API Security Compliance**: Monitor the backend integration logs with *Alex Rivers* to audit key exclusion constraints.

---
*Note: To replace this local simulation with real generative AI reports, please provide your active \`GEMINI_API_KEY\` in the AI Studio Secrets tab.*`;
    }

    res.json({ report: reviewText });
  } catch (err: any) {
    console.error("Gemini Performance Review error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Static serving / Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
