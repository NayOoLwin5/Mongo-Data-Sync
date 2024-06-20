/* eslint-disable no-undef */
const mongoose = require('mongoose')
let dbConnections = {}

const dbTo = mongoose.createConnection(process.env.DB_TO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,
    wtimeoutMS: 2500,
})
dbTo.on('error', console.error.bind(console, 'dbTo connection error:'))
dbTo.once('open', function () {
    console.log('mongoose DB_TO connected')
})

dbConnections.dbTo = dbTo

const dbFrom = mongoose.createConnection(process.env.DB_FROM, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,
    wtimeoutMS: 2500,
})
dbFrom.on('error', console.error.bind(console, 'dbFrom connection error:'))
dbFrom.once('open', function () {
    console.log('mongoose DB_FROM connected')
})
dbConnections.dbFrom = dbFrom

module.exports = dbConnections
