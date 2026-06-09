import Anthropic from "@anthropic-ai/sdk"
import { get } from "node:https";
import { run } from "node:test";
require('dotenv').config()
const express = require('express')
const app = express();
const port = 3000;
let prompts = require("prompts.json")


prompts["Output"]

const client = new Anthropic({
  apiKey: process.env.CLAUDE_KEY
});


app.get('/', (req, res) => {
  res.send('The server is running. Please deploy the react app to interact with it');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
async function runcode(msg=JSON){

    return }
app.post('/api/runcode', runcode())
app.post('/api/translate', async (msg=JSON) => {
  if (!msg){
    return {
      "error": "error"
    }
  }
  const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: "user", content: prompts["Translate"] + prompts["Output"] + msg}],
  model: "claude-opus-4-8"
});
  return 0
});

app.post('/api/improve', async (msg=JSON, wrngmsg=JSON, errmsg=JSON) => {
  const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: "user", content: prompts["Improve"] + prompts["Output"] + msg}],
  model: "claude-opus-4-8"
});
return message
})

app.post('/api/correct', async (msg=JSON, wrngmsg=JSON, errmsg=JSON) => {
  const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: "user", content: prompts["CorrectError"] + prompts["Output"] + msg}],
  model: "claude-opus-4-8"
});
return message
})

export {app};



