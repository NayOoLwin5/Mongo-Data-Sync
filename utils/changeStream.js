/* eslint-disable no-undef */
const { MongoClient } = require('mongodb')
const ChangeStreamLog = require('../models/ChangeStreamLog')
const redis = require('./redis')
const bullQueue = require('./bullQueue')

let changeStream = async () => {
    const uri = process.env.DB_FROM
    const client = new MongoClient(uri)

    try {
        await client.connect()

        const pipelineConfig = {
            customer: [
                {
                    $match: {
                        $or: [{ operationType: 'insert' }, { operationType: 'update' }],
                    },
                },
            ],
        }

        const collections = [
            { coll: 'customer', pipeline: pipelineConfig.customer },
        ]
        for (let { coll, pipeline } of collections) {
            await monitorListingsUsingEventEmitter(client, pipeline, coll)
        }
    } finally {
        console.log('MongoDB change stream is watching........')
    }
}

let monitorListingsUsingEventEmitter = async (client, pipeline = [], coll) => {

    const collection = client.db(process.env.DATABASE_NAME).collection(coll)
    const watch = collection.watch(pipeline)


    watch.on('change', async (stream) => {
        const locked = await redis.setNX(stream._id._data, 'CSIdValue')
        if (!locked) {
            console.log('ChangeStream Avoided Duplication')
        } else {

            redis.expire(stream._id._data, 4)
            .then( rs =>  rs )
            .catch( err => console.log('Set Expiry Error : ', err) );
    
            let updatedFields = stream.operationType === 'update' ? restructureObj(stream.updateDescription.updatedFields) : {}

            let payload =
                stream.operationType === 'insert'
                    ? {
                          changeStreamId: stream._id._data,
                          operationType: stream.operationType,
                          document: Object.assign(stream.fullDocument, { _id: stream.fullDocument._id.toString() }),
                          documentKey: stream.fullDocument._id.toString(),
                          collection: stream.ns.coll,
                          database: stream.ns.db,
                          status: 'pending',
                      }
                    : {
                          changeStreamId: stream._id._data,
                          operationType: stream.operationType,
                          document: { _id: stream.documentKey._id.toString(), ...updatedFields },
                          documentKey: stream.documentKey._id.toString(),
                          collection: stream.ns.coll,
                          database: stream.ns.db,
                          status: 'pending',
                      }

            let logData = stream.operationType === 'insert' ? stream.fullDocument : { _id: stream.documentKey._id.toString(), ...updatedFields }
            console.log('New event : ', logData)

            if (payload.collection === 'customer') {
                ChangeStreamLog.create(payload)
                .then((rs) => {
                    bullQueue.socialSyncQ
                        .add(rs, { removeOnComplete: true })
                        .then((job) => {
                            ChangeStreamLog.updateOne({ _id: rs.id }, { status: 'processing', jobId: job.id })
                                .then((result) => result)
                                .catch((err) => console.log(`Process Update Error with ${logData} : ${err.message}`))
                        })
                        .catch((err) => console.log(`Job Error with ${logData} : ${err.message}`))
                })
                .catch((err) => console.log(`Process Create Error with ${logData} : ${err.message}`))
            }

            
        }
    })
}

let restructureObj = (obj) => {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
        const keys = key.split('.')
        let nestedObject = result
        for (let i = 0; i < keys.length - 1; i++) {
            const nestedKey = keys[i]
            nestedObject[nestedKey] = nestedObject[nestedKey] || {}
            nestedObject = nestedObject[nestedKey]
        }
        nestedObject[keys[keys.length - 1]] = value
    }
    return result
}

module.exports = changeStream
