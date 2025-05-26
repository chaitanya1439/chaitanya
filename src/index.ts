import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import workerRoutes from "./routes/worker";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const FRONTEND_URL = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3002',
];

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,                // <-- Allow cookies/credentials
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "", // Use environment variable for security
});

// Define the system prompt function
function getSystemPrompt(): string {
  return "You are a helpful AI assistant of shelteric.com. Respond concisely and accurately.";
}

// Chat API route
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid request format." });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: getSystemPrompt(),
        },
        ...messages,
      ],
      max_tokens: 1000,
      model: "llama-3.3-70b-versatile",
    });

    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      return res.status(500).json({ message: "Invalid response from Groq" });
    }

    return res.json({ response: responseText });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Mount authentication routes under /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/worker", workerRoutes);
app.get("/", (req, res) => {
  res.send("Hello API!");
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});