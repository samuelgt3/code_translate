import Anthropic from "@anthropic-ai/sdk"
import dotenv from 'dotenv'
import express from 'express';
import prompts from './prompts.json' with { type: 'json' };
import cors from 'cors'


dotenv.config()
const app = express();
app.use(express.json())
app.use(cors())
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
function compareVersions(a, b) {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < partsA.length; i++) {
    if (partsA[i] > partsB[i])  return a;   // a is newer
    if (partsA[i] < partsB[i]) return b;  // b is newer
  }
  return a; // equal
}
async function getRuntimes(av = 0) {
  let runtimes = new Map();
  try {
    let res;
    if (av === 1) {
      const result = await fetch(piston + 'runtimes', { method: "GET" });
      res = await result.json();
      for (let i = 0; i < res.length; i++) {
        if(runtimes.get(res[i]["language"])){
          const stored = runtimes.get(res[i]["language"]);
          const incoming = res[i]["version"];
          const x = compareVersions(stored, incoming);
        runtimes.set(res[i]["language"], x);}
        else {
        runtimes.set(res[i]["language"], res[i]["version"]);}}
      }
      
     else if (av===0) {
      const result = await fetch(piston + 'packages', { method: "GET" });
      res = await result.json();
      for (let i = 0; i < res.length; i++) {
        if(runtimes.get(res[i]["language"])){
        const stored = runtimes.get(res[i]["language"]);
        const incoming = res[i]["language_version"];
        const x = compareVersions(stored, incoming);
        runtimes.set(res[i]["language"], x);}
        else{
          runtimes.set(res[i]["language"], res[i]["language_version"]);}
        }
      }
    return runtimes;
  } catch (err) {
    throw new Error(`Execution failed: ${JSON.stringify(err)}`);
  }
}

async function downloadRuntime(language){
  if(language=="javascript"){
    language="node"
  }
  const versions = await (getRuntimes(0))
  const version = versions.get(language)
  try{
  const res = await fetch(piston + "packages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    language: language,
    version: version
  })
});
return version
} catch (err){
  throw new Error({message: "Failed to download language", error: err})
}
}

// Run code using Piston API
async function runCode( req) {
  const {language, files} = req.body
//Checking if the language is already downloading, downloading otherwise
  const runtimes = await getRuntimes(1);
  let version = runtimes.get(language)
  if ((!version) ){
    try{
      version = downloadRuntime(language)
    }catch (err){
      throw new Error(`This language is not available, error:  ${JSON.stringify(err)}`)
    }
  }
//Call the piston API
  try {
    const result = await fetch(piston + 'execute', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({language,files,version})
    });

//getting the output from the response
const response = await result.json();
const output = response.run.stdout || response.run.stderr
    return output

  } catch (err){
    throw new Error(`Piston error: ${JSON.stringify(response)}`);
  }

}

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
    return res.json(result);
  } catch(err){
      console.log(err)
      return res.status(400).json({message: "Error calling Claude API", details: err.message})
    }
})



//export {app};

