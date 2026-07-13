const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Note = require('../models/note')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
    // const noteObjects = helper.initialNotes.map(note => new Note(note))
    // const promiseArray = noteObjects.map(note => note.save())
    // await Promise.all(promiseArray)
})

test.only('notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test.only('all notes are returned', async () => {
    const response = await api.get('/api/notes')
    assert.strictEqual(response.body.length, helper.initialNotes.length)
})

test.only('a specific note is within the returned notes', async () => {
    const allNotes = await helper.noteInDb()
    const contents = allNotes.map(n => n.content)
    assert(contents.includes('HTML is easy'))
})

test('a valid note can be added', async () => {
    const newNote = {
            content: 'asyn/await simplifies making async calls',
            important: true
        }

    await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const allNotes = await helper.noteInDb()
    const contents = allNotes.map(n => n.content)
    assert.strictEqual(allNotes.length, helper.initialNotes.length + 1)
    assert.strict(contents.includes('asyn/await simplifies making async calls'), true)
})

test('note without content is not added', async () => {
    const newNote = {
        important: false
    }
    await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)
    
    const allNotes = await helper.noteInDb()
    assert.strictEqual(allNotes.length, helper.initialNotes.length)
})

test('a specific note can be viewed', async () => {
    const allNotes = await helper.noteInDb()
    const noteToView = allNotes[0]

    const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
    assert.deepStrictEqual(resultNote.body, noteToView)
})

test('a note can be deleted', async () => {
    const allNotesStart = await helper.noteInDb()
    const noteToDelete = allNotesStart[0]

    await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)

    const allNotesEnd = await helper.noteInDb()
    const ids = allNotesEnd.map(n => n.id)

    assert(!ids.includes(noteToDelete.id))
    assert.strictEqual(allNotesEnd.length, helper.initialNotes.length - 1)
})

after(async () => {
    await mongoose.connection.close()
})