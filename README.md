# Overview

This project primarily focuses on mongo data sync from one database to another seamlessly wriiten in javascript. 
**Note**: Not yet suitable for any other relational or non retaional database. 

## Tech stacks
- Express.js
- Mongodb
- [Redis](https://github.com/redis/node-redis) for caching and bull.js as backbone
- [Bull.js](https://github.com/OptimalBits/bull) for queuing
- [Mongo Change Streams](https://www.mongodb.com/docs/manual/changeStreams/) for change event triggers

## Project Structure Breakdown
- **Redis based queue Bull.js**: Used to stablize the system load for handling impressive amount of change events per second by processing data one by one
- **Producer**: Change Stream watches for update and insert operations of a collection and add each event asynchronously in bull.js queue without any blocking process
- **Consumer**: Bull.js get those job data one by one from redis, process the data synchronously and add them in another database
- **Duplicates and logs tracking in Consumer**: With use of changeStreamLog collection that tracks each event processing state, duplicates can be checked with its status of each event. And also, can make use of uniqeue indexes additionally in database level
- **Duplicates in Producer**: Change stream event can trigger more than one time depending on database shreding and replica sets. To avoid duplicates, redis caching comes into play to cache each event with change streams Id with 4 secs expiry set



