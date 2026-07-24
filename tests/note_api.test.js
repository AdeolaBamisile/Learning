const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Note = require('../models/note')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
    beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
    // const noteObjects = helper.initialNotes.map(note => new Note(note))
    // const promiseArray = noteObjects.map(note => note.save())
    // await Promise.all(promiseArray)
    })

    test('notes are returned as json', async () => {
      await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    
    test('all notes are returned', async () => {
      const response = await api.get('/api/notes')
      assert.strictEqual(response.body.length, helper.initialNotes.length)
    })
    
    test('a specific note is within the returned notes', async () => {
      const allNotes = await helper.noteInDb()
      const contents = allNotes.map(n => n.content)
      assert(contents.includes('HTML is easy'))
    })
})

describe('viewing a specific note', () => {
    test('succeds with a valid id', async () => {
        const allNotesStart = await helper.noteInDb()
        const noteToView = allNotesStart[0]

        const resultNote = await api
            .get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.deepStrictEqual(resultNote.body, noteToView)
    })

    test('fails with status code 404 if note does not exist', async () => {
        const validNonExistingId = await helper.nonExistingId()
        await api
            .get(`/api/notes/${validNonExistingId}`)
            .expect(404)
    })

    test('fails with status code 400 id is invalid', async () => {
        const invalidId = 'not-a-valid-id'

        await api
            .get(`/api/notes/${invalidId}`)
            .expect(400)
    })
})

describe('addition of a new note', () => {
    test('a valid note can be added', async () => {
    const newNote = {
        content: 'async/await simplifies making async calls',
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
    assert(contents.includes('async/await simplifies making async calls'))
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
})

describe('deletion of note', () => {
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
})

describe('when there is initially one user in the db', async () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'Ola', name: 'Adeola',  passwordHash })
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const allUsersStart = await helper.usersInDb()
        
        const newUser = {
            username: 'Ade',
            name: 'Ade Dayo',
            password: 'secret'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const allUsersEnd = await helper.usersInDb()
        const usernames = allUsersEnd.map(u => u.username)
        assert.strictEqual(allUsersEnd.length, allUsersStart.length + 1)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode if username is already taken', async () => {
        const allUsersStart = await helper.usersInDb()

        const newUser = {
            username: 'Ola',
            name: 'Ade Ola',
            passwordHash: 'sekret'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const allUsersEnd = await helper.usersInDb()
        assert(response.body.error.includes('expected `username` to be unique'))
        assert.strictEqual(allUsersEnd.length, allUsersStart.length)
    })
})

after(async () => {
  await mongoose.connection.close()
})