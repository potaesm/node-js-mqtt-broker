const express = require('express');
const ws = require('websocket-stream');
const cluster = require('cluster');
const mqemitter = require('mqemitter-mongodb');
const mongoPersistence = require('aedes-persistence-mongodb');

const MONGO_URL = 'mongodb+srv://suthinan:musitmani@instance-0.wclpq.gcp.mongodb.net/broker?retryWrites=true&w=majority';

const PORT = process.env.npm_package_config_port || require('./package.json').config.port;

function startAedes() {

    const aedes = require('aedes')({
        id: 'BROKER_' + cluster.worker.id,
        mq: mqemitter({
            url: MONGO_URL
        }),
        persistence: mongoPersistence({
            url: MONGO_URL,
            // Optional ttl settings
            ttl: {
                packets: 300, // Number of seconds
                subscriptions: 300
            }
        })
    });

    // Http
    // const server = require('net').createServer(aedes.handle)
    // server.listen(PORT, function () {
    //     console.log(`Listening on ${PORT}`);
    // });

    // WebSocket
    const server = express().listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
        aedes.publish({ topic: 'aedes/greeting', payload: `Hello, I am broker ${aedes.id}` });
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

    // fired when a client connects
    aedes.on('client', function (client) {
        console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
    })

    // fired when a client disconnects
    aedes.on('clientDisconnect', function (client) {
        console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
    })

    // fired when a message is published
    aedes.on('publish', async function (packet, client) {
        console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id);
    })
}

if (cluster.isMaster) {
    const numWorkers = require('os').cpus().length;
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
