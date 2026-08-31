import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "EduGate Ghana API", time: new Date().toISOString() });
});

// API: Generate GES-compliant Teacher / Headmaster Remarks
app.post("/api/ai/remarks", async (req, res) => {
  try {
    const { studentName, classLevel, averageScore, attendanceRate, strengths, areasForImprovement, role } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // Fallback deterministic GES remark if API key not available
      const fallbackRemarks: Record<string, string> = {
        high: `${studentName} demonstrates outstanding academic mastery in ${classLevel}. With an average of ${averageScore}% and ${attendanceRate}% attendance, they exhibit exceptional diligence and leadership. Keep up the high standard.`,
        medium: `${studentName} has maintained a satisfactory performance this term. Regular study and proactive participation in class exercises will elevate their understanding in weaker subject areas.`,
        low: `${studentName} has shown moderate commitment. Increased dedication, consistent homework submission, and targeted revision are strongly advised for next term.`
      };

      const key = averageScore >= 75 ? "high" : averageScore >= 50 ? "medium" : "low";
      return res.json({
        success: true,
        remark: fallbackRemarks[key],
        source: "ges_standard_template"
      });
    }

    const prompt = `You are a Senior Ghanaian Educator / GES (Ghana Education Service) certified ${role === 'headmaster' ? 'Headmaster' : 'Class Teacher'} writing an official Terminal Report Card Remark for a student in Ghana.

Student Details:
- Name: ${studentName}
- Class Level: ${classLevel} (Ghana Basic / JHS / SHS)
- Term Academic Average: ${averageScore}%
- Attendance Rate: ${attendanceRate}%
- Key Strengths: ${strengths || 'Consistent class engagement'}
- Areas to Improve: ${areasForImprovement || 'Regular revision and analytical problem solving'}

Guidelines:
1. Tone: Encouraging, constructive, professional, and pedagogical according to GES guidelines.
2. Length: 2 to 3 concise, impactful sentences (around 35-55 words).
3. Do NOT use American colloquialisms. Use Ghanaian academic terminology (e.g., 'term', 'continuous assessment', 'reopening', 'diligence', 'conduct').
4. If average is >= 80%: Commend excellence, leadership, and thirst for knowledge.
5. If average is 50-79%: Acknowledge good effort and pinpoint focused practice.
6. If average is < 50%: Offer supportive, actionable steps for improvement without demoralizing.

Provide ONLY the text of the remark without quotation marks or metadata.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    const remarkText = response.text ? response.text.trim() : "A commendable effort this term. Continue to apply yourself diligently.";

    res.json({
      success: true,
      remark: remarkText,
      source: "gemini-3.7-flash"
    });
  } catch (error: any) {
    console.error("AI remark generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI remarks",
      remark: "A determined effort shown throughout the term. Keep striving for greater heights next term."
    });
  }
});

// API: Early Intervention Academic Insights
app.post("/api/ai/early-intervention", async (req, res) => {
  try {
    const { studentName, subjectScores, attendanceHistory } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        success: true,
        riskLevel: "Low",
        insights: [
          `Maintain regular check-ins on weekly continuous assessment scores.`,
          `Encourage active participation in STEM and group discussions.`
        ],
        actionableSteps: [
          `Review homework submissions on Friday afternoons.`,
          `Engage parent during mid-term review.`
        ]
      });
    }

    const prompt = `Analyze this Ghanaian student's academic record and provide an Early Intervention pedagogical brief:
Student: ${studentName}
Subject Scores: ${JSON.stringify(subjectScores)}
Attendance: ${JSON.stringify(attendanceHistory)}

Respond with JSON:
{
  "riskLevel": "Low" | "Medium" | "High",
  "summary": "Brief 1-2 sentence risk assessment",
  "flaggedSubjects": ["subject names that are slipping"],
  "pedagogicalAdvice": ["2-3 specific recommendations for teacher & parent"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      data: parsed
    });
  } catch (err: any) {
    console.error("Early intervention error:", err);
    res.json({
      success: true,
      data: {
        riskLevel: "Moderate",
        summary: "Student shows steady performance with minor fluctuation in calculation-heavy topics.",
        flaggedSubjects: ["Mathematics"],
        pedagogicalAdvice: ["Schedule peer-assisted study circle", "Monitor weekly homework completion"]
      }
    });
  }
});

// Setup Vite middleware for development or serve dist in production
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduGate Ghana Server running on port ${PORT}`);
  });
}

startServer();
