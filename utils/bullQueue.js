/* eslint-disable no-undef */
const Queue = require('bull')
const ChangeStreamLog = require('../models/ChangeStreamLog')
const HANDLERS = require('./jobHandlers')

let bullQueue = {}
bullQueue.socialSyncQ = new Queue('socialSync', process.env.REDIS_URL)

bullQueue.socialSyncQ.on('completed', function (job, isFinished) {
    if (isFinished) {
        var clean = job.queue.clean.bind(job.queue, 0)

        job.queue
            .pause()
            .then(clean('completed'))
            .then(clean('active'))
            .then(clean('delayed'))
            .then(clean('failed'))
            .then(function () {
                return job.queue.empty()
            })
            .then(function () {
                return job.queue.close()
            })
    }
})

bullQueue.socialSyncQ.process(async (job, done) => {
    try {

        await HANDLERS[`handle_${job.data.operationType}_${job.data.collection}`](job)
        await ChangeStreamLog.updateOne({ jobId: job.id, changeStreamId: job.data.changeStreamId }, { status: 'done' })
        done()
        
    } catch (err) {
        if (job.attemptsMade < 1) {
            await job.moveToFailed({ message: err.message }, true)
            console.log(`Job Retrying with ${job} : ${err.message}`)
            job.retry()
                .then((job) => job)
                .catch((err) => {
                    console.log(`Error on retry with ${job.id} : ${err.message}`)
                    done()
                })
        } else {
            await ChangeStreamLog.updateOne({ jobId: job.id, changeStreamId: job.data.changeStreamId }, { status: 'failed', errorMessage: err.message })
            done()
        }
    }
})

module.exports = bullQueue
