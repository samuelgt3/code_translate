import {Editor} from "@monaco-editor/react";
import {Play} from 'lucide-react'
import { useState } from "react";
import {Select} from 'radix-ui'

const api = "http://localhost:3000/api/";
const languages = ["Python", "JavaScript", "TypeScript", "C++", "C#", "Rust", "Go", "Java"]

export default function CodeEditor({ value, onChange, onLanguageChange, language, readOnly = false }) {
    const [output, setOutput] = useState("");
  return (
    <div className="relative">
        <div className="border-b border-slate-100 flex mb-5 bg-slate-400 pt-4 px-4 pb-2 items-center justify-between">
        <Select.Root value={language}
        onValueChange={(value) => {console.log(value, language); onLanguageChange(value)}} >        
        <Select.Trigger className="flex items-center justify-between px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-0 hover: bg-pink-900">    
          <Select.Value />   
          <Select.Icon />   
        </Select.Trigger>
        <Select.Portal className="bg-grey-900 p-2">      
          <Select.Content className= "bg-zinc-900 border border-zinc-700 rounded-md text-white">   
            <Select.Viewport className="bg-grey-900">
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
      className = " z-10 p-2 size-10"
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
      <div className="bg-slate-900  overflow-hidden flex-1">
        <Editor
      height="50vh"
      //width="60vh"
      language={language}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      theme="slate-dark"
      beforeMount={(monaco) => {monaco.editor.defineTheme('slate-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#0F172A',
    'editor.lineHighlightBackground': '#1E293B',
    'editorLineNumber.foreground': '#64748B',
    'editorLineNumber.activeForeground': '#94A3B8',
    'editorCursor.foreground': '#6366F1',
    'editor.selectionBackground': '#334155',
    'editorGutter.background': '#0F172A',
  }
});}}
      options={{
        minimap: { enabled: false },
        fontSize: 10,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        readOnly,
        padding: { top: 16, left: 4 }
      }}
    />
    {output && <pre className="bg-[#141414] text-left text-xs text-[#d4d4d4] font-mono h-[20vh] overflow-y-auto p-4 m-0 ">{output}</pre>}
    </div>
    </div>
    
  );
}