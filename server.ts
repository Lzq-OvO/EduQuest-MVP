import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for image uploads (base64)
app.use(express.json({ limit: '50mb' }));

// Initialize OpenAI client pointing to local llama.cpp server
const openai = new OpenAI({
  baseURL: "http://127.0.0.1:8080/v1",
  apiKey: "local-model", // apiKey is required by the SDK but ignored by llama.cpp
});

// Initialize Supabase for backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// API Endpoints for Socratic AI Tutor

// 1. Socrates Chat Route (with State Machine & Fallback Logic)
app.post("/api/chat", async (req, res) => {
  try {
    const { 
      messages, 
      tutorStyle = "Socrates", 
      currentSubject = "量子物理",
      userId = "00000000-0000-0000-0000-000000000000", // MVP test user
      sessionId 
    } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages array provided." });
    }

    const latestUserMsg = messages[messages.length - 1].content;
    let activeSessionId = sessionId;
    let errorCount = 0;

    // --- 1. Session Management (Supabase) ---
    if (!activeSessionId) {
      const { data: newSession, error: sessionErr } = await supabase
        .from('sessions')
        .insert([{ user_id: userId, subject: currentSubject, topic: currentSubject }])
        .select()
        .single();
        
      if (sessionErr) {
        console.error('Session creation failed:', sessionErr.message);
      } else if (newSession) {
        activeSessionId = newSession.id;
      }
    } else {
      const { data: session, error: fetchErr } = await supabase
        .from('sessions')
        .select('error_count')
        .eq('id', activeSessionId)
        .single();
      if (fetchErr) {
        console.error('Session fetch failed:', fetchErr.message);
      } else if (session) {
        errorCount = session.error_count;
      }
    }

    // --- 2. System Prompt Generation (Merged Intent + State Machine) ---
    const systemInstruction = `You are a human-like Socratic science tutor. Topic: ${currentSubject}.
You must evaluate the student's latest message and classify their intent. 
Begin your response strictly with one of these tags:
[INTENT:CORRECT] if they are on the right track.
[INTENT:WRONG] if they are making a mistake.
[INTENT:FRUSTRATED] if they are asking for the answer directly or expressing frustration.

After the tag, write your response to the student following these rules:
- YOU MUST ALWAYS RESPOND IN CHINESE (简体中文). NEVER USE ENGLISH.
- NEVER introduce yourself as an AI, model, or mention who created you (e.g. NEVER mention Qwythos or Empero AI). Just answer directly as a human tutor.
- If CORRECT: Congratulate them and ask the next Socratic question.
- If WRONG: The student has made ${errorCount} errors so far on this topic.
  * If the number of errors is >= 7, you MUST provide the COMPLETE and DIRECT ANSWER. Tell them this topic has been added to their 'Error Book'.
  * If the number of errors is >= 4, give a MUCH SIMPLER analogous example.
  * Otherwise, ask a short, playful Socratic question.
- If FRUSTRATED: Empathize and give a very obvious hint. DO NOT give the direct answer.

Keep your response under 4 sentences (unless giving the direct answer). Always be encouraging.`;

    // --- 3. Truncate Messages (P1 #9) ---
    const MAX_HISTORY = 10;
    const recentMessages = messages.slice(-MAX_HISTORY);

    // --- 4. Call Main LLM (with Timeout P1 #11) ---
    const formattedMessages: any[] = [
      { role: "system", content: systemInstruction }
    ];

    for (const msg of recentMessages) {
      if (msg.image) {
        formattedMessages.push({
          role: msg.role,
          content: [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: msg.image } }
          ]
        });
      } else {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    const response = await openai.chat.completions.create({
      model: "local-model",
      messages: formattedMessages,
      temperature: 0.8,
    }, { timeout: 45000 }); // 45 seconds timeout

    let rawText = response.choices[0]?.message?.content || "I was thinking, but couldn't find the words.";
    
    // Aggressively strip out stubborn model identity injections that ignore system prompts
    rawText = rawText.replace(/(我是|I am)\s*Qwythos.*?Empero AI.*?[。！.]?/gi, "");
    rawText = rawText.replace(/我是\s*Qwythos.*?。/gi, "");
    rawText = rawText.trim();
    
    let studentState = "neutral";
    
    // Parse Intent
    if (rawText.startsWith("[INTENT:CORRECT]")) {
      studentState = "correct";
      rawText = rawText.replace("[INTENT:CORRECT]", "").trim();
    } else if (rawText.startsWith("[INTENT:WRONG]")) {
      studentState = "wrong";
      rawText = rawText.replace("[INTENT:WRONG]", "").trim();
    } else if (rawText.startsWith("[INTENT:FRUSTRATED]")) {
      studentState = "frustrated";
      rawText = rawText.replace("[INTENT:FRUSTRATED]", "").trim();
    } else {
      // Fallback parse if it didn't strictly start with it
      if (rawText.includes("[INTENT:WRONG]")) {
        studentState = "wrong";
        rawText = rawText.replace(/\[INTENT:WRONG\]/g, "").trim();
      } else if (rawText.includes("[INTENT:CORRECT]")) {
        studentState = "correct";
        rawText = rawText.replace(/\[INTENT:CORRECT\]/g, "").trim();
      } else if (rawText.includes("[INTENT:FRUSTRATED]")) {
        studentState = "frustrated";
        rawText = rawText.replace(/\[INTENT:FRUSTRATED\]/g, "").trim();
      }
    }

    const aiText = rawText;

    // --- 5. State Machine DB Updates ---
    if (studentState === "wrong") {
      errorCount += 1;
      if (activeSessionId) {
        const { data: updated, error: updateErr } = await supabase.rpc('increment_error_count', { sid: activeSessionId });
        if (updateErr) {
          await supabase.from('sessions').update({ error_count: errorCount, updated_at: new Date().toISOString() }).eq('id', activeSessionId);
        } else if (updated !== null && updated !== undefined) {
          errorCount = updated; // Use the authoritative DB value
        }
      }
    } else if (studentState === "correct" && errorCount > 0 && activeSessionId) {
      errorCount = 0;
      await supabase.from('sessions').update({ error_count: 0, updated_at: new Date().toISOString() }).eq('id', activeSessionId);
    }

    if (errorCount >= 7 && studentState === "wrong" && activeSessionId) {
      const { error: insertErr } = await supabase.from('profound_errors').insert([{
        user_id: userId,
        session_id: activeSessionId,
        subject: currentSubject,
        title: `深刻错题: ${currentSubject}`,
        description: "学生在引导下连续多次答错，存在严重知识盲区。",
        ai_tip: "建议线下真人教师进行深度复习。",
        status: "pending"
      }]);
      if (insertErr) {
        console.error('Failed to save profound error:', insertErr.message);
      }
      await supabase.from('sessions').update({ status: 'profound_error' }).eq('id', activeSessionId);
    }

    // --- 6. Log messages to DB ---
    if (activeSessionId) {
      await supabase.from('messages').insert([
        { session_id: activeSessionId, role: 'user', content: latestUserMsg },
        { session_id: activeSessionId, role: 'assistant', content: aiText }
      ]);
    }

    res.json({
      content: aiText,
      sessionId: activeSessionId,
      errorCount,
      studentState
    });
  } catch (error: any) {
    console.error("Local AI Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI Tutor service." });
  }
});

// 2. Generate customized practice problem ("AI再次训练")
app.post("/api/retrain", async (req, res) => {
  try {
    const { topic, difficulty = "medium" } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: "Topic is required for retraining." });
    }

    const systemInstruction = `You are an encouraging AI problem designer. Create a single, engaging, and playful multiple-choice science/math problem about: "${topic}".
The problem should have a fun back-story (e.g. space explorers, wizard chemistry, cat mechanics) to make it gamified.
Format your output strictly as a JSON object with the following properties:
{
  "problem": "The text of the practice problem",
  "difficulty": "medium",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctIndex": 0,
  "hint": "A playful hint to guide the student",
  "explanation": "A Socratic explanation of why this answer is correct"
}`;

    const response = await openai.chat.completions.create({
      model: "local-model",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Please generate a fun, multiple-choice practice question for retraining the topic: "${topic}". Make sure it is highly illustrative and gamified. Keep your output strictly as JSON.` }
      ],
      temperature: 0.9,
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(response.choices[0]?.message?.content || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Local AI Retrain Error:", error);
    res.status(500).json({ error: error.message || "Could not generate retrain problem." });
  }
});

// 3. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Vite middleware setup
async function setupVite() {
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
    console.log(`EduQuest Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start Vite production or development environment:", err);
});
