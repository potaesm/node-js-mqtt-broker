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

const client = mqtt.connect(railway.url, railway.options)

client.on('connect', function () {
    client.subscribe(topic, function (err) {
        if (!err) {
            const updateObject = {
                update: true,
                url: 'http://node-js-storage.herokuapp.com/download-file/NodeMqttWsUpdate.ino.nodemcu.bin'
            };
            client.publish(topic, JSON.stringify(updateObject));
        }
    });
});

// function getBase64FromFile(fileName) {
//     const data = fs.readFileSync(fileName);
//     const file = fileName.split('.');
//     const fileExtension = file[file.length - 1];
//     const payload = {
//         fileName,
//         mimeType: 'image/' + fileExtension,
//         data: data.toString('base64')
//     }
//     return JSON.stringify(payload);
// }

// setInterval(() => {
//     const message = getBase64FromFile('me.jpeg');
//     client.publish(topic, message);
// }, 500);
