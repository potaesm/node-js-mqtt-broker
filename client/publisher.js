const fs = require('fs-extra');
const mqtt = require('mqtt')
const url = 'wss://node-js-mqtt-broker.herokuapp.com';
const options = {
    wsOptions: {
        port: 443
    },
    username: 'web',
    password: 'client'
}
const client = mqtt.connect(url, options)

function getBase64FromFile(fileName) {
    const data = fs.readFileSync(fileName);
    const payload = {
        fileName,
        data: data.toString('base64')
    }
    return JSON.stringify(payload);
}

client.on('connect', function () {
    client.subscribe('test/greeting', function (err) {
        if (!err) {
            client.publish('test/greeting', '{ "message": "Hello from publisher" }');
        }
    });
});

setInterval(() => {
    const message = getBase64FromFile('me.jpeg');
    client.publish('test/greeting', message);
}, 1000);
