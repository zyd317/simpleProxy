/**
 *
 */
const http = require('http');
const net = require('net');
const url = require('url');

/**
 * onConnect
 * @param cRequest <http.IncomingMessage> HTTP 请求，同 'request' 事件。
 * @param cSocket <net.Socket> 服务器与客户端之间的网络 socket。
 * @param head  <Buffer> 流的第一个数据包，可能为空。
 * 获取request里需要转发的信息，使用net.connect转发到对应的sever。
 */
function connect(cRequest, cSocket, head) {
    const urlObj = url.parse('http://' + cRequest.url);
    console.log(cRequest)
    console.log(cSocket)
    const hostname = urlObj.hostname;
    const port = Number(urlObj.port) || 443;

    const proxySocket = net.connect(port, hostname, ()=>{
        cSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        proxySocket.write(head);
        proxySocket.pipe(cSocket); // socket pipe到proxySocket。浏览器发送到服务器
    }).on('error', (e)=>{
        console.error('proxy error', e.message);
        console.info('proxy error', e.stack);
        cSocket.end();
    }).on('data', function (data) {
        console.log('proxy socket data:', data.toString());
        cSocket.write(data);
    });
    cSocket.pipe(proxySocket); // proxySocket pipe到 socket。把服务器数据发送到浏览器
}

/**
 * @param [options] IncomingMessage, ServerResponse
 * @param requestListener 自动添加到'request'事件的方法。
 * @return obj <http.Server> 继承自 net.Server.
 * net.Server.on('connect') 开始connect服务
 * net.Server.listen 开启HTTP服务器监听连接,为 connections 启动一个 server 监听. 一个 net.Server 可以是一个 TCP 或者 一个 IPC server，这取决于它监听什么。
 */
const server = http.createServer().listen(3002);
server.on('connect', connect);