/**
 * a simple server, creating by NodeJs, using `http.createServer`
 * @type {{_connectionListener, METHODS, STATUS_CODES, Agent, ClientRequest, globalAgent, IncomingMessage, OutgoingMessage, Server, ServerResponse, createServer, get, request}|*}
 */
const http = require('http');
const url = require('url');

const requestListener = (req, res)=>{
    const urlObj = url.parse(req.url);
    console.log(urlObj);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`hi ::: ${JSON.stringify(urlObj)} \n`);
};
// path 1
// const server = http.createServer(requestListener);
// server.listen(3001);

// path 2
http.createServer().listen(3001).on('request', requestListener);
