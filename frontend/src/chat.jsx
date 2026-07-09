import { useState } from "react";
import { Send } from "lucide-react";
  

export default function ChatBar(){
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("")
    const [isLoading, setLoading] = useState(false)
    const handleSubmit = async() =>{
    
}
    return <div className="flex flex-column overflow-hidden bg-black h-full w-[30vh]">
        <div style={{ 
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(30, 41, 59, 0.3)'
        }}>
          <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                placeholder="Type something..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  backdropFilter: 'blur(4px)',
                  fontSize: '1rem',
                  borderRadius: '9999px',
                  padding: '1.25rem 4rem 1.25rem 1.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  color: '#ffffff',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(147, 51, 234, 0.5)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                style={{
                  position: 'absolute',
                  right: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: !input.trim() || isLoading ? '#334155' : '#9333ea',
                  color: '#ffffff',
                  cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: '50%',
                  padding: '0.75rem',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !isLoading) {
                    e.target.style.backgroundColor = '#7e22ce';
                  }
                }}
                onMouseLeave={(e) => {
                  if (input.trim() && !isLoading) {
                    e.target.style.backgroundColor = '#9333ea';
                  }
                }}
              >
                <Send style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          </div>
        </div>
    </div>
}