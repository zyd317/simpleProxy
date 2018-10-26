/**
 *
 */
const http = require('http');
const net = require('net');
const url = require('url');

/**
 * onConnect
 * @param clientRequest <http.IncomingMessage> HTTP 请求，同 'request' 事件。
 * @param clientSocket <net.Socket> 服务器与客户端之间的网络 socket。
 * @param head  <Buffer> 流的第一个数据包，可能为空。
 * 获取request里需要转发的信息，使用net.connect转发到对应的sever。
 */
function connect(clientRequest, clientSocket, head) {
    const urlObj = url.parse('http://' + clientRequest.url);
    console.log(clientRequest)
    console.log(clientSocket)
    const hostname = urlObj.hostname;
    const port = Number(urlObj.port) || 443;

    const proxySocket = net.connect(port, hostname, ()=>{
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        proxySocket.write(head);
        proxySocket.pipe(clientSocket); // socket pipe到proxySocket。浏览器发送到服务器
    }).on('error', (e)=>{
        console.error('proxy error', e.message);
        console.info('proxy error', e.stack);
        clientSocket.end();
    }).on('data', function (data) {
        console.log('proxy socket data:', data.toString());
        clientSocket.write(data);
    });
    clientSocket.pipe(proxySocket); // proxySocket pipe到 socket。把服务器数据发送到浏览器
}

function request(clientRequest, clientResponse) {
    const urlObj = url.parse(clientRequest.url);
    const options = {
        hostname : urlObj.hostname,
        port : urlObj.port || 80,
        path : urlObj.path,
        method : clientRequest.method,
        headers : clientRequest.headers
    };
    const serverRequest = http.request(options, (serverRequest)=>{
        clientResponse.writeHead(serverRequest.statusCode, serverRequest.headers);
        serverRequest.pipe(clientRequest);
    }).on('error', ()=>{
        clientResponse.end('end');
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
const server = http.createServer().listen(3002);
server.on('request', request)
    .on('connect', connect);