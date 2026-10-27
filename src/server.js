import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanName, cleanMessage, cleanRoom, cleanPosition, ROOMS } from './shared.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const dataFile = path.join(dataDir, 'messages.json');
const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => { res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('Referrer-Policy','no-referrer'); next(); });
app.use(express.static(path.join(root, 'public')));
app.get('/health', (_req,res) => res.json({ok:true, rooms:ROOMS}));
const server = createServer(app);
const io = new Server(server, { maxHttpBufferSize: 8192, cors: { origin: false } });
let history = Object.fromEntries(ROOMS.map(room => [room, []]));
const players = new Map();
let writeQueue = Promise.resolve();
function save() {
  const snapshot = JSON.stringify(history);
  writeQueue = writeQueue.then(async () => {
    await mkdir(dataDir, {recursive:true});
    const tmp = dataFile + '.tmp';
    await writeFile(tmp, snapshot, 'utf8');
    await rename(tmp, dataFile);
  }).catch(error => console.error('History persistence failed:', error));
}
function presence(room) { io.to(room).emit('players', [...players.values()].filter(p => p.room === room)); }
function reply(ack, data) { if (typeof ack === 'function') ack(data); }
function enter(socket, requestedRoom, ack) {
  const player = players.get(socket.id);
  if (!player) return reply(ack,{ok:false,error:'Join first'});
  const oldRoom = player.room;
  const room = cleanRoom(requestedRoom);
  if (oldRoom) socket.leave(oldRoom);
  player.room = room;
  player.x = 110 + Math.floor(Math.random()*120);
  player.y = 350 + Math.floor(Math.random()*140);
  socket.join(room);
  socket.emit('room:joined', {room, history:history[room], player});
  if (oldRoom) presence(oldRoom);
  presence(room);
  reply(ack,{ok:true,room});
}
io.on('connection', socket => {
  let lastMessageAt = 0;
  let lastMoveAt = 0;
  socket.on('join', (payload, ack) => {
    if (players.has(socket.id)) return reply(ack,{ok:false,error:'Already joined'});
    const name = cleanName(payload?.name);
    const player = {id:socket.id,name,room:null,x:150,y:420,avatar:Math.round(Math.max(0,Math.min(5,Number(payload?.avatar)||0)))};
    players.set(socket.id, player);
    enter(socket, payload?.room, ack);
  });
  socket.on('room:change', (room, ack) => enter(socket, room, ack));
  socket.on('chat:send', (raw, ack) => {
    const player = players.get(socket.id);
    if (!player) return reply(ack,{ok:false,error:'Join first'});
    const now = Date.now();
    if (now - lastMessageAt < 700) return reply(ack,{ok:false,error:'Please slow down'});
    const text = cleanMessage(raw);
    if (!text) return reply(ack,{ok:false,error:'Message is empty'});
    lastMessageAt = now;
    const message = {id:randomUUID(),room:player.room,user:player.name,playerId:socket.id,text,at:new Date().toISOString()};
    history[player.room].push(message);
    history[player.room] = history[player.room].slice(-100);
    save();
    io.to(player.room).emit('chat:message',message);
    reply(ack,{ok:true});
  });
  socket.on('player:move', raw => {
    const player = players.get(socket.id);
    if (!player || Date.now()-lastMoveAt < 45) return;
    lastMoveAt = Date.now();
    const pos = cleanPosition(raw);
    player.x = pos.x; player.y = pos.y;
    socket.to(player.room).emit('player:moved',{id:socket.id,...pos});
  });
  socket.on('typing', value => {
    const player = players.get(socket.id);
    if (player) socket.to(player.room).emit('typing',{id:socket.id,name:player.name,active:!!value});
  });
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (!player) return;
    players.delete(socket.id);
    presence(player.room);
  });
});
try {
  const stored = JSON.parse(await readFile(dataFile,'utf8'));
  for (const room of ROOMS) if (Array.isArray(stored[room])) history[room] = stored[room].slice(-100);
} catch (error) { if (error.code !== 'ENOENT') console.error('Could not load history:',error); }
const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => console.log(`Pixel Tavern running at http://localhost:${port}`));
