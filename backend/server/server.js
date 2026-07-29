import Anthropic from "@anthropic-ai/sdk"
import dotenv from 'dotenv'
import express from 'express';
import prompts from './prompts.json' with { type: 'json' };
import cors from 'cors'
import session from "express-session";
import {sessionScheme, initSession} from "../db/db.js"
import {runCode} from "../routes/routes.js"

dotenv.config()
const app = express();

const port = 3000;
const translate = prompts.Translate
const chat = prompts.Chat
const frontend = "https://code-translate-seven.vercel.app"

const client = new Anthropic({
  apiKey: process.env.CLAUDE_KEY
});

app.use(
  express.json(),
  cors({
    origin: frontend,
    credentials: true
  }),
  session(sessionScheme),
  initSession
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post('/api/runcode/', initSession, async (req, res) => {
  const { language, files } = req.body;
  if (!files || !language) {
    return res.status(400).json("Input is missing parameters ");
  }
  req.session.originalCode = files[0].content
  await req.session.save()
  try {
    const output = await runCode(req);
    console.log(req.session.originalCode)
    return res.json({ output });
  } catch (err) {
    return res.status(500).json({ message: "Execution failed:" + err });
  }

});

app.post('/api/translate/', initSession, async (req, res) => {
  if (!req.body?.code) {
    return res.status(400).json({ message: "No input code provided", status: 400 })
  }
  if (req.body.target === req.body.src) {
    return res.status(400).json({ message: "Source and target language", status: 400 })
  }
  const { target: language, code: code, src: source } = req.body || {}

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: [
        { type: "text", text: translate, cache_control: { type: "ephemeral" } }
      ],
      messages: [
        {
          role: "user",
          content: `target: ${language}, source: ${source}, code: ${code}`
        }
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              "language": { type: "string" },
              "content": { type: "string" },
            },
            required: ["language", "content"],
            additionalProperties: false
          }
        }
      }
    });
    const result = JSON.parse(response.content[0].text);
    const sess = req.session
    sess.originalCode = code
    sess.translation = result.content
    await sess.save();
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: "Error calling Claude API", details: err.message })
  }
})

app.post("/api/chat/", async (req, res) => {
  const store = req.session;
  const msg = req.body.message
  store.userMessage.push(msg)
  const history = JSON.stringify({ user: store.userMessage, agent: store.agentMessage, source: store.originalCode, translation: store.translation })
  console.log(history)
  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: [
        { type: "text", text: chat, cache_control: { type: "ephemeral" } }
      ],
      messages: [
        {
          role: "user",
          content: `history: ${history}, current message: ${msg}`
        }
      ],
    })
    const result = response.content[0].text;
    store.agentMessage.push(result)
    await store.save();
    return res.json(result)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Error calling Claude API", details: err.message })
  }
})

app.get("/api/history/", (req, res) => {
  const data = req.session
  let messages = [];
  for (let i = 0; i < data.userMessage.length; i++) {
    messages.push({ role: "user", content: data.userMessage[i] });
    messages.push({ role: "assistant", content: data.agentMessage[i] });
  }
  return res.json({
    messages: messages,
    originalCode: data.originalCode,
    translation: data.translation
  })
})

app.post("/api/reset/", async (req, res) => {
  req.session.userMessage = [];
  req.session.agentMessage = [];
  req.session.originalCode = [];
  req.session.translation = [];
  req.session.initialized = true;
  await req.session.save();
  res.json({ success: true })
});
