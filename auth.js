const users = require('./user');

function __sendError(message, response) {
    response.setHeader('WWW-Authenticate', 'Basic')
    response.status(401).json({ message });
}

function auth(request, response, next) {
    const { username, password } = getId(request);
    if (!!username && !!password) {
        const usernameArray = users.map(user => user.username);
        const passwordArray = users.map(user => user.password);
        if (usernameArray.includes(username) && password === passwordArray[usernameArray.indexOf(username)]) {
            return next();
        } else {
            return __sendError('You are not authenticated', response);;
        }
    } else {
        return __sendError('Authorization header not found', response);;
    }
}

function getId(request) {
    const authHeader = request.headers.authorization;
    let username = null;
    let password = null;
    if (!authHeader) {
        return { username, password };
    } else {
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        username = auth[0];
        password = auth[1];
        return { username, password };
    }
}

module.exports = {
    auth,
    getId
};
