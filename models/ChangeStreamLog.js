/* eslint-disable no-undef */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { dbTo } = require('../utils/db');

const ChangeStreamLogSchema = new Schema({
}, {
    collection : 'changeStreamLog',
    timestamps: true,
    strict: false
});

module.exports = dbTo.model('ChangeStreamLog', ChangeStreamLogSchema);