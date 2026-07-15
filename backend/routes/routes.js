
const piston = 'http://localhost:2000/api/v2/'

function compareVersions(a, b) {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < partsA.length; i++) {
    if (partsA[i] > partsB[i])  return a;  
    if (partsA[i] < partsB[i]) return b;  
  }
  return a;
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

export {runCode}