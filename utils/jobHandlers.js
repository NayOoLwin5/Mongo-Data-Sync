const CustomerInfo = require('../models/CustomerInfo')

let HANDLERS = {}
HANDLERS.handle_insert_customer = async (job) => {
    try {

        if (job.data.document.status === 'init') {
            return
        }

        let payload = {
            phone: job.data.document?.phone,
            name: job.data.document?.name,
            email: job.data.document?.email,
            avatar: job.data.document?.avatar,
            address: job.data.document?.address,
            gender: job.data.document?.gender,
            township: job.data.document?.township,
            customerId: job.data.documentKey,
        }

        const findCustomer = await CustomerInfo.findOne({ customerId: job.data.documentKey }).lean()
        if (!findCustomer) {
            await CustomerInfo.create(payload)
        }
        return
    } catch (err) {
        throw err
    }
}

HANDLERS.handle_update_customer = async (job) => {
    try {
        let select = 'phone name email avatar address gender township recentPhone'
        const specificKeys = select.split(' ')
        const filteredObject = specificKeys.reduce((result, key) => {
            if (key in job.data.document) {
                result[key] = job.data.document[key]
            }
            return result
        }, {})

        await CustomerInfo.updateOne({ customerId: job.data.documentKey }, filteredObject)
        return
    } catch (err) {
        throw err
    }
}

module.exports = HANDLERS