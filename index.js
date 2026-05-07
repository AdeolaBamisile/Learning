const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
    },
    {
        id: "2",   
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: "3",
        content: "POST and GET are the most important methods of HTTP protocol",
        important: true
    }
]

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')
    next()
}

//app.use(requestLogger)

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
})

app.patch('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const body = request.body
    const note = notes.find(note => note.id === id)
    if (!note) {
        return response.status(404).json({error: 'Note not found'})
    }
    const updatedNote = {...note, ...body}
    notes = notes.map(note => note.id == id ? updatedNote : note)
    response.json(updatedNote)
})


const generateId = () => {
    const maxId = notes.length > 0 
        ? Math.max(...notes.map(note => Number(note.id)))
        : 0
    return(String(maxId + 1))
}

app.post('/api/notes', (request, response) => {
    const body = request.body
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId()
    }
    notes = notes.concat(note)

    console.log(note)
    response.json(note)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

let PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})