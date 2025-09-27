import { promises as fs } from 'fs'
import { join } from 'path'
import { dataDirectory } from './paths'
import { MeshPacket } from 'api/src/vars'

const messagesFilePath = join(dataDirectory, 'messages.json')

let messages: MeshPacket[] = []
let loaded = false

async function loadMessages() {
  if (loaded) return
  try {
    const data = await fs.readFile(messagesFilePath, 'utf-8')
    messages = JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      messages = []
    } else {
      console.error('Error loading messages:', error)
    }
  }
  loaded = true
}

export async function getMessages(): Promise<MeshPacket[]> {
  await loadMessages()
  return messages
}

export async function saveMessage(message: MeshPacket) {
  await loadMessages()

  // Avoid duplicates
  if (messages.some(m => m.id === message.id)) {
    return
  }

  messages.push(message)

  try {
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2))
  } catch (error) {
    console.error('Error saving message:', error)
  }
}