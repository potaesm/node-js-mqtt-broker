const mqtt = require('mqtt')
const client = mqtt.connect('ws://node-js-mqtt-broker.herokuapp.com')

client.on('connect', function () {
    client.subscribe('test/greeting', function (err) {
        if (!err) {
            client.publish('test/greeting', 'Hello from subscriber');
        }
    })
})

client.on('message', function (topic, message) {
    console.log('Got message: ', message.toString(), ' from topic ', topic)
    // client.end()
});