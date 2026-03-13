import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const knowledgePath = path.resolve('backend/knowledge.json')

function readKnowledge() {
  try {
    if (!fs.existsSync(knowledgePath)) {
      fs.writeFileSync(knowledgePath, '[]', 'utf8')
    }
    const raw = fs.readFileSync(knowledgePath, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    console.error('Error reading knowledge:', err)
    return []
  }
}

function writeKnowledge(data) {
  fs.writeFileSync(knowledgePath, JSON.stringify(data, null, 2), 'utf8')
}

app.get('/api/knowledge', (req, res) => {
  const knowledge = readKnowledge()
  res.json(knowledge)
})

app.post('/api/knowledge', (req, res) => {
  const knowledge = readKnowledge()
  const newItem = {
    id: Date.now().toString(),
    title: req.body.title || 'Untitled',
    content: req.body.content || '',
    createdAt: new Date().toISOString(),
  }

  knowledge.push(newItem)
  writeKnowledge(knowledge)
  res.json(newItem)
})

app.delete('/api/knowledge/:id', (req, res) => {
  const knowledge = readKnowledge()
  const filtered = knowledge.filter((item) => item.id !== req.params.id)
  writeKnowledge(filtered)
  res.json({ success: true })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body
    const knowledge = readKnowledge()

    const contex
