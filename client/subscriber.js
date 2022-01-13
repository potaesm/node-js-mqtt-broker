const fs = require('fs-extra');
const mqtt = require('mqtt');
const cloudamqp = {
    url: 'mqtt://woodpecker.rmq.cloudamqp.com',
    options: {
        username: 'dahrusvc:dahrusvc',
        password: '6lYM_XMYbBTM-rfU3vg4Qsdfmx8J1TlA'
    }
};
const heroku = {
    url: 'ws://node-js-mqtt-broker.herokuapp.com',
    options: {
        // wsOptions: { port: 443 },
        username: 'web',
        password: 'client'
    }
};
const railway = {
    url: 'wss://mqtt.up.railway.app',
    options: {
        username: 'web',
        password: 'client'
    }
};

const topic = 'main/update';

const client = mqtt.connect(heroku.url, heroku.options);

client.on('connect', function () {
    client.subscribe(topic, function (err) {
        if (!err) {
            client.publish(topic, JSON.stringify({ message: 'Hello from subscriber!' }));
        }
    })
});

client.on('message', function (topic, message) {
    const payload = JSON.parse(message.toString());
    if (!!payload.fileName && !!payload.data) {
        fs.writeFileSync('sub-' + payload.fileName, Buffer.from(payload.data, 'base64'));
    }
    console.log('Got message: ', payload, ' from topic ', topic);
    // client.end();
});
