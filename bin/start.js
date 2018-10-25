/**
 * express as server
 * @type {createApplication}
 */
let express = require('express');
let http = require('http');
let debug = require('debug')('genapp:server');
let proxy = require('../src/middleware/proxy');
const port = normalizePort(process.env.PORT || '3008');
let app = express(); // express实例
app.set('port', port);

/**
 * Create HTTP server.
 * Listen on provided port, on all network interfaces.
 */
let server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * router
 */
let router = express.Router();
app.use('/', router);
router.get("/interface/api/:key", proxy);
router.post("/interface/api/:key", proxy);


/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    console.log('listening...');
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}