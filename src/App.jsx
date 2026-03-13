import { useEffect, useState } from 'react'

export default function App() {
  const [tab, setTab] = useState('chat')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Hello! I am KITT. Teach me something or ask me a question.' },
  ])

  const [knowledge, setKnowledge] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadKnowledge() {
    try {
      const res = await fetch('/api/knowledge')
      const data = await res.json()
      setKnowledge(data)
    } catch (err) {
      console.error('Failed to load knowledge:', err)
    }
  }

  useEffect(() => {
    loadKnowledge()
  }, [])

  async function sendMessage() {
    if (!message.trim()) return

    const userMessage = { sender: 'user', text: message }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    const currentMessage = message
    setMessage('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessage }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: data.reply || 'No reply received.' },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Error talking to KITT. Make sure backend and Ollama are running.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function addKnowledge() {
    if (!title.trim() || !content.trim()) return

    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      setTitle('')
      setContent('')
      loadKnowledge()
    } catch (err) {
      alert('Failed to save knowledge')
    }
  }

  async function deleteKnowledge(id) {
    try {
      await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
      })
      loadKnowledge()
    } catch (err) {
      alert('Failed to delete knowledge')
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>KITT AI</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>
        Your own local AI powered by Ollama
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setTab('chat')}
          style={tabButton(tab === 'chat')}
        >
          Chat
        </button>
        <button
          onClick={() => setTab('teach')}
          style={tabButton(tab === 'teach')}
        >
          Teach AI
        </button>
      </div>

      {tab === 'chat' && (
        <div style={cardStyle}>
          <div
            style={{
              height: 400,
              overflowY: 'auto',
              background: '#111827',
              padding: 12,
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: msg.sender === 'user' ? '#2563eb' : '#1f2937',
                    maxWidth: '80%',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <p style={{ color: '#94a3b8' }}>KITT is thinking...</p>}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
              placeholder="Ask KITT something..."
              style={inputStyle}
            />
            <button onClick={sendMessage} style={primaryButton}>
              Send
            </button>
          </div>
        </div>
      )}

      {tab === 'teach' && (
        <div style={cardStyle}>
          <h2>Teach KITT</h2>
          <p style={{ color: '#94a3b8' }}>
            Add topics and information so KITT can use them in future replies.
          </p>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Topic title (example: Volcanoes)"
            style={{ ...inputStyle, marginBottom: 10 }}
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type what you want KITT to learn..."
            rows={8}
            style={{ ...inputStyle, resize: 'vertical', width: '100%', marginBottom: 10 }}
          />

          <button onClick={addKnowledge} style={primaryButton}>
            Save Knowledge
          </button>

          <hr style={{ margin: '20px 0', borderColor: '#334155' }} />

          <h3>Saved Knowledge</h3>

          {knowledge.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No saved knowledge yet.</p>
          ) : (
            knowledge.map((item) => (
              <div key={item.id} style={knowledgeCard}>
                <div>
                  <strong>{item.title}</strong>
                  <p style={{ marginTop: 6, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                    {item.content}
                  </p>
                </div>
                <button onClick={() => deleteKnowledge(item.id)} style={dangerButton}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const cardStyle = {
  background: '#1e293b',
  padding: 20,
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
}

const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #334155',
  background: '#0f172a',
  color: 'white',
}

const primaryButton = {
  padding: '12px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 'bold',
}

const dangerButton = {
  padding: '10px 14px',
  borderRadius: 10,
  border: 'none',
  background: '#dc2626',
  color: 'white',
  fontWeight: 'bold',
  height: 'fit-content',
}

const knowledgeCard = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  background: '#0f172a',
  padding: 14,
  borderRadius: 12,
  marginBottom: 12,
  border: '1px solid #334155',
}

function tabButton(active) {
  return {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: active ? '#2563eb' : '#334155',
    color: 'white',
    fontWeight: 'bold',
  }
}
