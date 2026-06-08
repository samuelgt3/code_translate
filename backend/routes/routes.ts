import Anthropic from "@anthropic-ai/sdk";
require('dotenv').config()
const express = require('express');
const app = express();
const port = 3000;


const client = new Anthropic({
  apiKey: process.env.CLAUDE_KEY// This is the default and can be omitted
});

const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }],
  model: "claude-opus-4-8"
});

console.log(message.content);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post('/api/runcode', (msg=JSON) => {
    return 0
})
app.post('/api/translate', (msg=JSON) => {
  return 0
});

app.post('/api/retry', (msg=JSON, wrngmsg=JSON, errmsg=JSON) => {
    return 0
})

export {}



