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

}
