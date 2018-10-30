/**
 * listening to browser connect
 */
const https = require('https');
const net = require('net');
const url = require('url');

/**
 * onConnect client -> connect -> proxy
 * Synchronize booth sockets
 */
function connect(clientRequest, clientSocket, head) {
    console.log('connect start...');
    const urlObj = url.parse('http://' + clientRequest.url);
    console.log('onconnect   urlObj:::' + JSON.stringify(urlObj));
    const hostname = urlObj.hostname;
    const port = Number(urlObj.port) || 443;

    const proxySocket = net.connect(port, hostname, ()=>{
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        proxySocket.write(head);
        proxySocket.pipe(clientSocket);
    }).on('error', (e)=>{
        console.error('proxy error', e.message);
        console.info('proxy error', e.stack);
        clientSocket.end();
    }).on('data', function (data) {
        console.log('proxy socket data:', data.toString());
        clientSocket.write(data);
    });
    clientSocket.pipe(proxySocket);
}

function request(clientRequest, clientResponse) {
    const urlObj = url.parse(clientRequest.url);
    console.log('onrequest   urlObj:::' + JSON.stringify(urlObj));
    const options = {
        hostname : urlObj.hostname,
        port : urlObj.port || 80,
        path : urlObj.path,
        method : clientRequest.method,
        headers : clientRequest.headers
    };
    console.log(clientRequest.socket === clientResponse.socket);
    const serverRequest = http.request(options, (serverRequest)=>{
        clientResponse.writeHead(serverRequest.statusCode, serverRequest.headers);
        serverRequest.pipe(clientRequest);
    }).on('error', ()=>{
        clientResponse.end('error');
    });
    clientRequest.pipe(serverRequest);
}

/**
 * @param [options] IncomingMessage, ServerResponse
 * @param requestListener 自动添加到'request'事件的方法。
 * @return obj <http.Server> 继承自 net.Server.
 * net.Server.on('connect') 开始connect服务
 * net.Server.listen 开启HTTP服务器监听连接,为 connections 启动一个 server 监听. 一个 net.Server 可以是一个 TCP 或者 一个 IPC server，这取决于它监听什么。
 */
const server = https.createServer().listen(3002);
server.on('request', request)
    .on('connect', connect);