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

async function getRuntimes(av = 0) {
  let runtimes = new Map();
  try {
    let res;
    if (av === 1) {
      const result = await fetch(piston + 'runtimes', { method: "GET" });
      res = await result.json();
      for (let i = 0; i < res.length; i++) {
        runtimes.set(res[i]["language"], res[i]["version"]);
      }
    } else if (av===0) {
      const result = await fetch(piston + 'packages', { method: "GET" });
      res = await result.json();
      for (let i = 0; i < res.length; i++) {
        runtimes.set(res[i]["language"], res[i]["language_version"]);
      }
    }
    return runtimes;
  } catch (err) {
    throw new Error(`Execution failed: ${err.message}`);
  }
}

async function downloadRuntime(req){
  const {language, version} = req.body
  if (!version){
    version = (await getRuntimes()).get(language)
  }
  try{
  const res = await fetch(piston + "packages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    language: language,
    version: version
  })
});
const result = await res.json();
return result
} catch (err){
  throw new Error({message: "Failed to download language", error: err.message})
}
}

app.post("/api/download/", async (req) => downloadRuntime(req))
app.get('/api/runtimes/', async (res) => {
  try{
  const runtimes = await getRuntimes()
  console.log(runtimes)
  res.json(Object.fromEntries(runtimes))} catch (err) {
    console.log(err)
    return res.send({err})
}})
// Run code using Piston API
async function runCode( {language, version, files}) {
//Checking if the language is already downloading, downloading otherwise
  const runtimes = await getRuntimes(0);
  const ver = runtimes.get(language)
  if ((!version)||(!ver===version) ){
    try{
      downloadRuntime({language, version})
    }catch (err){
      throw new Error(`This version of this language is not available, error:  ${err.error}`)
    }
  }

//Call the piston API
  try {
    const result = await fetch(piston + 'execute', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, version, files })
    });

//getting the output from the response
const response = await result.json();
const output = response.run.stdout
    return output

  } catch (err){
    throw new Error(`Piston error: ${JSON.stringify(response)}`);
  }

}

app.post('/api/runcode/', async (req, res) => {

  //Check if the required parameters are given
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
  const runtimes = await getRuntimes(0);
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
      }}
  }
});
const result = JSON.parse(response.content[0].text);
console.log(result)
    const pistoncode = {
      language: result.language,
      version: runtimes.get(language),
      files: [{ name: `main.${result.language}`, content: result.content }]
    };
    console.log(pistoncode)
    
    return res.json(pistoncode);
  } catch(err){
      console.log(err)
      return res.status(400).json({message: "Error calling Claude API", details: err.message})
    }
})



//export {app};

