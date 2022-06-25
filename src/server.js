import http from "http";
import WebSocket, {WebSocketServer} from "ws";
import express from "express";   //express view 설정, render해주는 역할

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));   //frontend에서 구동되는 코드(app.js) (user가 볼수 있는 폴더)
app.get("/", (req, res) => res.render("home"));   //home에서 res, req를 받고 home을 렌더해줌 (template 렌더)
app.get("/*", (req, res) => res.redirect("/"));  //home 외의 나머지 주소 redirect
const handleListen = () => console.log('Lintening on http://localhost:3000');   //? ws://localhost:3000  => ws / http 요청 둘 다 처리 가능
// app.listen(3000, handleListen); 

const server = http.createServer(app);      //express app로부터 서버 만들기   //? httpServer
const wss = new WebSocketServer({ server }); //?websocketServer    ==> websocker 서버 && httpServer 둘다 돌릴 수 있다!!


function onSocketClose(){
    console.log("Disconnected from the Browser X");
}

const sockets = [];

//socket : 브라우저로의 연결
wss.on("connection", (socket) =>{
    sockets.push(socket);
    console.log("Connected to Browser!");
    socket.on("close", onSocketClose); //서버 닫혔을때 실행
    socket.on("message", (message)=>{
        sockets.forEach(aSocket => aSocket.send(message.toString("utf-8")));    //sockets안의 브라우저에게 모두 메시지 전송
    });      //브라우저에서 보내기
});

server.listen(3000, handleListen);

{
    type:"message";
    payload:"hello everyone!";
}
{
type:"nickname";
payload:"hey";
}

//nodemon  ignore 설정으로 server 수정시에만 서버 새로고침되게 변경
//server.js    node(backend에서 구동되는 코드)