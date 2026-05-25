const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (request, response) => {
    Note.find().then(notes => {
        response.json(notes)
    }).catch(() => response.status(404).json({error: "Error: Unable to fetch notes"}))
})

notesRouter.get('/:id', (request, response, next) => {
    Note.findById(request.params.id).then(note => {
        if (note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

notesRouter.post('/', (request, response, next) => {
    const { content, important } = request.body
    if (!content) {
        response.status(400).json({error: 'Missing content field'})
    }
    const note = new Note({
        content: content,
        important: important || false
    })
    note.save().then(savedNote => {
        response.json(savedNote)
    }).catch(error => next(error))
})

notesRouter.delete('/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    }).catch(error => next(error))
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