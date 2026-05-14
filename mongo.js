const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://adeolabamisile:${password}@cluster0.lvxx5ri.mongodb.net/notesApp?appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
    content: 'POST and GET are the most important methods of HTTP protocol',
    important: true
})

note.save().then(result => {
    console.log('note saved')
    console.log(result)
    mongoose.connection.close()
})
// Note.find({important: false}).then(result => {
//     result.forEach(note => {
//         console.log(note)
//     })
//     mongoose.connection.close()
// })