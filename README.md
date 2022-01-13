# NodeJS MQTT Broker

## Local usage
```bash
npm i
npm test
```
## Heroku deployment
1. Create heroku app
```bash
heroku create -a my-mqtt-broker
```
2. Add heroku remote repository
```bash
heroku git:remote -a my-mqtt-broker
```
3. Push to heroku repository
```bash
git push heroku master
```
4. View logs
```bash
heroku logs --tail -a my-mqtt-broker
```

## Railway deployment
1. Connect the project
```bash
railway link project-id
```
2. Set environment variables
    - PORT: 80
    - WEB_MEMORY: 1024
3. Push to railway
```bash
railway up
```