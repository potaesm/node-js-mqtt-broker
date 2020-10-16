const mqtt = require('mqtt')
const client = mqtt.connect('ws://node-js-mqtt-broker.herokuapp.com')

client.on('connect', function () {
    client.subscribe('test/greeting', function (err) {
        if (!err) {
            client.publish('test/greeting', 'Hello from publisher');
        }
    });
});

setInterval(() => {
    client.publish('test/greeting', 'Hello world');
}, 1000);
