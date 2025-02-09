"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize Groq client
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || "", // Use environment variable for security
});
// Define the system prompt function
function getSystemPrompt() {
    return "You are a helpful AI assistant. Respond concisely and accurately.";
}
// Chat API route
app.post("/api/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: "Invalid request format." });
        }
        const completion = yield groq.chat.completions.create({
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
        const responseText = (_c = (_b = (_a = completion.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (!responseText) {
            return res.status(500).json({ message: "Invalid response from Groq" });
        }
        return res.json({ response: responseText });
    }
    catch (error) {
        console.error("Error in chat endpoint:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
// Mount authentication routes under /api/auth
app.use("/api/auth", auth_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
