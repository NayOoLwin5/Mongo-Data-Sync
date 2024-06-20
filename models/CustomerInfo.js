const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { dbTo } = require('../utils/db')

const CustomerInfoSchema = new Schema(
    {
    },
    {
        timestamps: true,
        strict: false,
    }
)

module.exports = dbTo.model('CustomerInfo', CustomerInfoSchema)
