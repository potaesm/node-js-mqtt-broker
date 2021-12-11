const express = require('express');
const cors = require('cors');
const { auth, getId } = require('./auth');
const ws = require('websocket-stream');
const cluster = require('cluster');

/** MongoDB Integration */
// const mqemitter = require('mqemitter-mongodb');
// const mongoPersistence = require('aedes-persistence-mongodb');
// const MONGO_URL = 'mongodb+srv://suthinan:musitmani@instance-0.wclpq.gcp.mongodb.net/broker?retryWrites=true&w=majority';

const configPort = 3000;
const PORT = process.env.PORT || configPort;

const users = require('./user');

function __generateObjectId() {
    const os = require('os');
    const crypto = require('crypto');
    const secondInHex = Math.floor(new Date() / 1000).toString(16);
    const machineId = crypto.createHash('md5').update(os.hostname()).digest('hex').slice(0, 6);
    const processId = process.pid.toString(16).slice(0, 4).padStart(4, '0');
    const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0');
    return secondInHex + machineId + processId + counter;
}

function startAedes() {
    let brokerId = 'BROKER_' + __generateObjectId();
    if (!!cluster.worker && !!cluster.worker.id) {
        brokerId = 'BROKER_' + cluster.worker.id;
    }
    const aedes = require('aedes')({
        id: brokerId,
        /** MongoDB Integration */
        // mq: mqemitter({
        //     url: MONGO_URL
        // }),
        // persistence: mongoPersistence({
        //     url: MONGO_URL,
        //     // Optional ttl settings
        //     ttl: {
        //         packets: 300, // Number of seconds
        //         subscriptions: 300
        //     }
        // }),
        authenticate: (client, username, password, callback) => {
            const usernameArray = users.map(user => user.username);
            const passwordArray = users.map(user => user.password);
            if (usernameArray.includes(username) && password.toString() === passwordArray[usernameArray.indexOf(username)]) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
    });

    /** Http Server */
    // const server = require('net').createServer(aedes.handle)
    // server.listen(PORT, function () {
    //     console.log(`Listening on ${PORT}`);
    // });

    /** WebSocket Server */
    const server = express()
        .use(cors({ origin: true }))
        .use(auth)
        /** HiveMQ View */
        .use(express.static(__dirname + '/dist'))
        /** EJS View */
        // .set('view engine', 'ejs')
        // .get('', (request, response) => {
        //     const id = getId(request);
        //     const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        //     response.render('log', { clientName: ip, userName: id.username, password: id.password, configPort, useSSL: !(configPort === PORT) })
        // })
        .listen(PORT, () => {
            console.log(`Listening on ${PORT}`);
            aedes.publish({ topic: 'aedes/greeting', payload: `{ "message": "Hello, I am broker ${aedes.id}" }` });
        });
    ws.createServer({ server }, aedes.handle);

    aedes.on('subscribe', function (subscriptions, client) {
        console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id);
    })

    aedes.on('unsubscribe', function (subscriptions, client) {
        console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id);
    })

    /** Fired when a client connects */
    aedes.on('client', function (client) {
        console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
    })

    /** Fired when a client disconnects */
    aedes.on('clientDisconnect', function (client) {
        console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
    })

    /** Fired when a message is published */
    aedes.on('publish', async function (packet, client) {
        console.log('Client \x1b[31m' + (client ? client.id : aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id);
    })
}

/** Clustering */
if (cluster.isMaster) {
    const numCores = require('os').cpus().length;
    /** Limit number of workers to 25 */
    const numWorkers = numCores > 25 ? 25 : numCores;
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    })

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    })
} else {
    startAedes();
}

/** Non-clustering */
// startAedes();
