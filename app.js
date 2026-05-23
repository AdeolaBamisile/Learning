const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const notesRouter = require('./controller/notes')
const middleware = require('./utils/middleware')

const app = express()

logger.info('connecting to ', config.MONGODB_URL)

mongoose.connect(config.MONGODB_URL, { family: 4 }).then(result => {
    logger.info('connected to MongoDB')
}).catch(error => {
    logger.error('error connecting to MongoDB: ', error.message)
})

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter)

app.use(middleware.unknownEndpoint)

app.use(middleware.errorHandler)

module.exports = app