import Anthropic from "@anthropic-ai/sdk"
import { get } from "node:https";
require('dotenv').config()
const express = require('express')
const app = express();
const port = 3000;
const prompts = require("prompts.json")
const piston = 'https://something'
const client = new Anthropic({
  apiKey: process.env.CLAUDE_KEY
});

app.get('/', (req, res) => {
  res.send('The server is running. Please deploy the react app to interact with it');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function runcode(req: JSON) {
  await fetch(piston, {
    method:"POST",
    body: JSON.stringify({req})
    }).then(result => {
        // do something with the result
        var out = result["run"]["output"];
        var output = JSON.parse(out);
        return output[2];
    }).catch(err => {
        // if any error occured, then catch it here
        if (err.status="RE"){

        }
    })}

app.post('/api/runcode', runcode(req));

app.post('/api/translate', async (msg: JSON) => {
  if (!msg){
    return Response.json({message: "No input code provided", status: 400})
  } else{
    const language: string = msg["target"]
    const code: string = msg["code"]
    const source: string = msg["src"]
  }
const response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  cache_control: { type: "ephemeral" },
  system: prompts.Translate,
  messages: [
    {
      role: "user",
      content: 'target: ${lanugage}, source: ${source}, code: ${code}'
    }
  ],
  output_config: {
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          "language": { type: "string" },
          "version": { type: "string" },
          "content": { type: "string" },
        },
        required: ["language", "version", "content"],
        additionalProperties: false
      }
    }
  }
});
response['field']=[{"content": response.content}]
//delete response.content
//const clean = runcode(response)
  return 0
});

app.post('/api/correct', async (msg=JSON, wrngmsg=JSON, errmsg=JSON) => {

})

export {app};



