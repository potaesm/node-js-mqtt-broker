const mqtt = require('mqtt')
const client = mqtt.connect('wss://web:client@node-js-mqtt-broker.herokuapp.com:443')

client.on('connect', function () {
    client.subscribe('test/greeting', function (err) {
        if (!err) {
            client.publish('test/greeting', '{ "message": "Hello from subscriber" }');
        }
    })
})

client.on('message', function (topic, message) {
    console.log('Got message: ', message.toString(), ' from topic ', topic)
    // client.end()
});
