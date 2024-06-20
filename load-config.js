const fs = require('fs')

const environment = process.env.NODE_ENV || 'develop'

const configFilePath = `./config/env/${environment}.json`

try {
    const jsonContent = fs.readFileSync(configFilePath, 'utf8')

    const config = JSON.parse(jsonContent)

    for (const key in config) {
        if (config.hasOwnProperty(key)) {
            process.env[key] = config[key]
        }
    }

    console.log(`Environment variables loaded from ${configFilePath}`)
} catch (err) {
    console.error(`Error reading or parsing configuration file '${configFilePath}':`, err)
}
