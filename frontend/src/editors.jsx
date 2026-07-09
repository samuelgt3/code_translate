import {Editor} from "@monaco-editor/react";
import {Play} from 'lucide-react'
import { useState } from "react";
import {Select} from 'radix-ui'


const api = "http://localhost:3000/api/";
const languages = ["Python", "JavaScript", "TypeScript", "C++", "C#", "Rust", "Go", "Java"]
export function NavBar({language, onLanguageChange}){
  
}
export default function CodeEditor({ value, onChange, onLanguageChange, language, readOnly = false }) {
    const [output, setOutput] = useState("");
  return (
    <div className="relative">
        <div className="flex mb-2">
        <Select.Root value={language}
        onValueChange={(value) => onLanguageChange(value)}>        
        <Select.Trigger>    
          <Select.Value />   
          <Select.Icon />   
        </Select.Trigger>
        <Select.Portal>      
          <Select.Content className= "bg-zinc-900 border border-zinc-700 rounded-md shadow-lg text-white">   
            <Select.Viewport>
              {languages.map(lang => (
          <Select.Item key={lang} value={lang.toLowerCase()}>
            <Select.ItemText>{lang}</Select.ItemText>
          </Select.Item>
        ))}
        </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <Play 
      className = "absolute top-0 right-0 z-10 p-2 color-emerald-600 size-10"
      onClick={async () => { const files= [{"content": value}]
         try{const result = await fetch(api + 'runcode/', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, files })
    })
     const data = await result.json()
     setOutput(data.message || data.output);} 
     catch(err){console.error(err.message)}}
    }
      />
      </div>
        <Editor
      height="50vh"
      //width="60vh"
      language={language}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 10,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly,
      }}
    />
    {output && <pre className="bg-[#141414] text-left text-xs text-[#d4d4d4] font-mono h-[20vh] overflow-y-auto p-4 m-0 ">{output}</pre>}
    
    </div>
    
  );
}