/**
 * 演示 Node.js 支持 CONNECT 的代理
 */
const http = require('http');
const net = require('net');
const url = require('url');

function connect(cRequest, cSocket, head) {
    const urlObj = url.parse('http://' + cRequest.url);
    const hostname = urlObj.hostname;
    const port = Number(urlObj.port) || 443;

    const proxySocket = net.connect(port, hostname, ()=>{
        cSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        proxySocket.write(head);
        proxySocket.pipe(cSocket);
    }).on('error', (e)=>{
        console.error('proxy error', e.message);
        console.info('proxy error', e.stack);
        cSocket.end();
    }).on('data', function (data) {
        console.log('proxy socket data:', data.toString());
        cSocket.write(data);
    });
    cSocket.pipe(proxySocket);
}

http.createServer().on('connect', connect).listen(8888, '0.0.0.0');