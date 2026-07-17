const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find().populate('user', {username: 1, name: 1})
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  if (!body.content) {
    return response.status(400).json({ error: 'Missing content field' })
  }

  if (!user) {
    return response.status(400).json({error: 'userId missing or invaid'})
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
  const { content, important } = request.body
  const note = await Note.findById(request.params.id)
  if (!note) {
    return response.status(404).end()
  }
  note.content = content
  note.important = important
  const changedNote = await note.save()
  response.json(changedNote)
})

module.exports = notesRouter