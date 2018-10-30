/**
 * https
 */
const http = require('http');
const https = require('https');
const net = require('net');
const fs = require('fs');
const url = require('url');

https.createServer({
    keys: fs.readFileSync('./zyd.pem'),
    cert: fs.readFileSync('./server.crt')
}).on('request', request)
.on('connect', connect)
.listen('3003');

function request(cReq, cRes) {
    const u = url.parse(cReq.url);

    const options = {
        hostname : u.hostname,
        port     : u.port || 80,
        path     : u.path,
        method     : cReq.method,
        headers     : cReq.headers
    };

    const pReq = http.request(options, function(pRes) {
        cRes.writeHead(pRes.statusCode, pRes.headers);
        pRes.pipe(cRes);
    }).on('error', function(e) {
        cRes.end('error');
    });
    cReq.pipe(pReq);
}

function connect(cReq, cSock) {
    const u = url.parse('http://' + cReq.url);
    const pSock = net.connect(u.port, u.hostname, function() {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function(e) {
        cSock.end('error');
    });
    cSock.pipe(pSock);
}

