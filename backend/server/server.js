import Anthropic from "@anthropic-ai/sdk"
import dotenv from 'dotenv'
import express from 'express';
import prompts from './prompts.json' with { type: 'json' };
import cors from 'cors'
import session from "express-session";
import {sessionScheme, initSession} from "../db/db.js"
import {runCode} from "../routes/routes.js"
import { error } from "console";

dotenv.config()
const app = express();

const port = 3000;
const translate = prompts.Translate
const chat = prompts.Chat
const frontend = "http://localhost:5173"

const client = new Anthropic({
  apiKey: process.env.CLAUDE_KEY
});

app.use(
  express.json(),
  cors({
  origin: frontend,
  credentials: true  
}), 
session(sessionScheme));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post('/api/runcode/', async (req, res) => {

  //Check if the required parameters are given
  const { language, files } = req.body;
  if (!files || !language) {
    return res.status(400).json("Input is missing parameters ");
  }

  try {
    const output = await runCode(req);
    return res.json({ output });
  } catch (err) {
    return res.status(500).json({ message: "Execution failed:"+ err });
  }});

app.post('/api/translate/', async (req,res) => {
  if (!req.body?.code){
    return res.status(400).json({message: "No input code provided", status: 400})
  }
  if (req.body.target===req.body.src){
    return res.status(400).json({message: "Source and target language", status: 400})
  }
const { target: language, code: code, src: source } = req.body || {}

try{
const response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  cache_control: { type: "ephemeral" }, 
  system: translate,
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
      }}}});
const result =  JSON.parse(response.content[0].text);
const session = req.session
session.originalCode = code
session.translation = result.content
console.log(session.originalCode, session.translation)
await req.session.save((err)=>{
  if(err){console.log("error" + err)}
})
    return res.json(result);
  } catch(err){
      console.log(err)
      return res.status(400).json({message: "Error calling Claude API", details: err.message})
    }
})

app.post("/api/chat/", async (req,res) =>{
const store = req.session;
const msg = req.body.message
store.userMessage.push(msg)
const history = JSON.stringify({user: store.userMessage, agent: store.agentMessage, source: store.originalCode, translation: store.translation})
console.log(history)
try{
  const response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  cache_control: { type: "ephemeral" }, 
  system: chat,
  messages: [
    {
      role: "user",
      content: `history: ${history}, current message: ${msg}`
    }
  ],})
  const result = response.content[0].text;
  store.agentMessage.push(result)
  return res.json(result)
}catch(err){
    return res.json(error)
  }

})

app.get("/api/history/", initSession, (req, res)=> {
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

app.post("/api/reset/", async(req, res) => {
    req.session.userMessage = [];
    req.session.agentMessage = [];
    req.session.originalCode = [];
    req.session.translation = [];
    req.session.initialized = true;
    await req.session.save();
    res.json({success: true})
}
  );

