/* eslint-disable no-undef */
const express = require('express')
const bodyParser = require('body-parser')
require('./load-config.js')
const HANDLERS = require('./utils/jobHandlers')
const changeStream = require('./utils/changeStream')
const API = require('./routes/api.js')
const apikeyValidator = require('./src/middlewares/apikeyValidator')
const Sentry = require("@sentry/node");


const app = express()


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(apikeyValidator)
app.use('/oapi', API)

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(Sentry.Handlers.errorHandler());

changeStream()

app.listen(process.env.PORT, () => {
    console.log(`Express app listening on port ${process.env.PORT}`)
})
