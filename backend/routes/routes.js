import Anthropic from "@anthropic-ai/sdk"
import dotenv from 'dotenv'
import express from 'express';
import prompts from './prompts.json' with { type: 'json' };

dotenv.config()
const app = express();
app.use(express.json())
const port = 3000;
const piston = 'http://localhost:2000/api/v2/'
const translate = prompts.Translate
const client = new Anthropic({
  apiKey: process.env.CLAUDE_KEY
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get('/', (res) => {
  res.send('The server is running. Please deploy the react app to interact with it');
});


async function getRuntimes(){
   try {
    const result = await fetch(piston + 'runtimes', {
      method: "GET",
    });

//structuring the response to be readable
const runtimes = await result.json();
    return runtimes;
  } catch (err) {
    throw new Error({ message: "Execution failed", error: err.message });
  }
}

async function downloadRuntime(req){
  const {language, version} = req.body
  const res = await fetch(piston + "packages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    language: language,
    version: version
  })
});
const result = await res.json();
console.log(result)
}

app.post("/api/download/", async (req) => downloadRuntime(req))
app.get('/api/runtimes/', (res) => {
  const runtimes = getRuntimes()
  res.send({runtimes})
})
// Run code using Piston API
async function runCode({language, version, files}) {
  const runtimes = JSON.stringify(getRuntimes());

//call the piston API
  try {
    const result = await fetch(piston + 'execute', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, version, files })
    });

//structuring the response to be readable
const response = await result.json();

const output = response.run.stdout
    return output
  } catch (err){
    throw new Error(`Piston error: ${JSON.stringify(response)}`);
  }

}

app.post('/api/runcode/', async (req, res) => {

  //check if the required parameters are given
  const { files, language, version } = req.body;
  if (!files || !language || !version) {
    return res.status(400).json({ message: "Input is missing parameters" });
  }


  try {
    const output = await runCode({ language, version, files });
    return res.json({ output });
  } catch (err) {
    return res.status(500).json({ message: "Execution failed", error: err.message });
  }});

app.post('/api/translate/', async (req,res) => {
  const runtimes = JSON.stringify(getRuntimes());
  if (!req.body?.target || !req.body?.code || !req.body?.src){
    return res.status(400).json({message: "No input code provided", status: 400})
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
      content: `target: ${language}, source: ${source}, code: ${code}, runtimes: ${runtimes}`
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
      }}
  }
});
const result = JSON.parse(response.content[0].text);

    const pistoncode = {
      language: result.language,
      version: result.version,
      files: [{ name: `main.${result.language}`, content: result.content }]
    };

    return res.json(pistoncode);} catch(err){
      return res.status(400).json({message: "Error calling Claude API"})
    }
})



//export {app};

