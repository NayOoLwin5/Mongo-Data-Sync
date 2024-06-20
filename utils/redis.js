/* eslint-disable no-undef */
const redis = require('redis')

const client = redis.createClient({
    url: process.env.REDIS_URL,
})

;(async () => {
    await client.connect()
})()

client.on('ready', () => {
    console.log('Redis Server Connected')
})

client.on('error', (err) => {
    console.log('Error in the Redis connection : ', err)
})

module.exports = client
