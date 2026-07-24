process.env.NODE_ENV !== 'production' && require('node:dns/promises').setServers(['8.8.8.8', '1.1.1.1'])
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const notesRouter = require('./controller/notes')
const userRouter = require('./controller/users')
const loginRouter = require('./controller/login')
const middleware = require('./utils/middleware')

const app = express()

logger.info('connecting to ', config.MONGODB_URL)

mongoose.connect(config.MONGODB_URL, { family: 4 }).then(() => {
  logger.info('connected to MongoDB')
}).catch(error => {
  logger.error('error connecting to MongoDB:', error.message)
})

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)

app.use('/api/notes', notesRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controller/router')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)

app.use(middleware.errorHandler)

module.exports = app