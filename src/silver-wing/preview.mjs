import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'web');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const url=new URL(req.url,'http://localhost');const relative=decodeURIComponent(url.pathname);
  const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
  if(!file.startsWith(root+path.sep)||relative.split('/').some(s=>s.startsWith('.'))){res.writeHead(403).end();return;}
  const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404).end('Not found');}
});
server.on('error',error=>{if(error.code==='EADDRINUSE')server.listen(0,'0.0.0.0');else{console.error(error.message);process.exitCode=1;}});
server.on('listening',()=>{const port=server.address().port;console.log('Mac: http://localhost:'+port);for(const values of Object.values(os.networkInterfaces()))for(const v of values||[])if(v.family==='IPv4'&&!v.internal)console.log('局域网 Safari: http://'+v.address+':'+port);console.log('保持此窗口运行；Ctrl+C 停止。');});
server.listen(8776,'0.0.0.0');
