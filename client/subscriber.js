const fs = require('fs-extra');
const mqtt = require('mqtt')
const url = 'wss://c6349f3ac0ae.up.railway.app/';
const options = {
    // wsOptions: {
    //     port: 443
    // },
    username: 'web',
    password: 'client',
    properties: {
        maximumPacketSize: 5242880
    }
}
const client = mqtt.connect(url, options)

client.on('connect', function () {
    client.subscribe('test/greeting', function (err) {
        if (!err) {
            client.publish('test/greeting', '{ "message": "Hello from subscriber" }');
        }
    })
})

client.on('message', function (topic, message) {
    const payload = JSON.parse(message.toString());
    if (!!payload.fileName && !!payload.data) {
        fs.writeFileSync('sub-' + payload.fileName, Buffer.from(payload.data, 'base64'));
    }
    console.log('Got message: ', payload, ' from topic ', topic)
    // client.end()
});
