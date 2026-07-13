const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find()
  response.json(notes)
})

notesRouter.get('/:id', async (request, response, next) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', async (request, response, next) => {
  const { content, important } = request.body
  if (!content) {
    response.status(400).json({ error: 'Missing content field' })
  }
  const note = new Note({
    content: content,
    important: important || false
  })
  const savedNote = await note.save()
  response.status(201).json(savedNote)
})

notesRouter.delete('/:id', async (request, response, next) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body
  Note.findById(request.params.id).then(note => {
    if (!note) {
      return response.status(404).end()
    }
    note.content = content
    note.important = important
    return note.save().then(changedNote => {
      response.json(changedNote)
    })
  }).catch(error => next(error))
})

module.exports = notesRouter