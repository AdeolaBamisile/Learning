require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
//const cors = require('cors')
const app = express()

//app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

const Note = require('./models/notes')

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

//app.use(requestLogger)

app.get('/api/notes', (request, response) => {
    Note.find().then(notes => {
        response.json(notes)
    }).catch(error => {
        response.status(400).json({ error: "Couldn't fetch notes" })
    })
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id).then(note => {
        response.status(204).end()
    }).catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body
    Note.findById(request.params.id).then(note => {
        if (!note) {
            return response.status(404).end()
        }
        note.content = content
        note.important = important
        return note.save().then(updatedNote => {
            response.json(updatedNote)
        })
    }).catch(error => next(error))
})


const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(note => Number(note.id)))
        : 0
    return (String(maxId + 1))
}

app.post('/api/notes', (request, response, next) => {
    const body = request.body
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save().then(savednote => {
        response.json(savednote)
    }).catch(error => next(error))
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id).then(note => {
        if (note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        next(error)
        // console.log(error.message)
        // response.status(400).send({error: 'Malformatted Id'})
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

let PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})