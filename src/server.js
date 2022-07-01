import http from "http";
import SocketIO from "socket.io";
import express from "express";   //express view 설정, render해주는 역할
import { SocketAddress } from "net";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));   //frontend에서 구동되는 코드(app.js) (user가 볼수 있는 폴더)
app.get("/", (req, res) => res.render("home"));   //home에서 res, req를 받고 home을 렌더해줌 (template 렌더)
app.get("/*", (req, res) => res.redirect("/"));  //home 외의 나머지 주소 redirect
const handleListen = () => console.log('Lintening on http://localhost:3000');   //? ws://localhost:3000  => ws / http 요청 둘 다 처리 가능
// app.listen(3000, handleListen); 

const httpserver = http.createServer(app);      //express app로부터 서버 만들기   //? httpServer
const wsServer = SocketIO(httpserver);   //socket.io는 websocket의 부가기능이 아니다!!

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event)=>{
        console.log(`Socket Event: ${event}`);
    });
    socket.on("set_name", (roomName) => {    //done(client단에서 전달받은 func)
        console.log("setID"); //user id == room id  : 방이 생성되면 기본적으로 id 가짐
        socket.to(roomName).emit("welcome", socket.nickname);   //roomName의 모든사람에게 emit
        
    });
    socket.on("enter_room", (roomName, done) => {    //done(client단에서 전달받은 func)
        // console.log(socket.id); //user id == room id  : 방이 생성되면 기본적으로 id 가짐
        socket.join(roomName);
        done();   //함수 호출(show room!!)

    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => 
            socket.to(room).emit("bye", socket.nickname)
            ); //모든 sockt disconnect시 모든 rooms에 bye 전송
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));  //nickname 이벤트 발생시 nickname 받아오서 socket{"nickname"}에 등록
});

/*
const wss = new WebSocketServer({ server }); //?websocketServer    ==> websocker 서버 && httpServer 둘다 돌릴 수 있다!!
const sockets = [];
//socket : 브라우저로의 연결
wss.on("connection", (socket) =>{
    sockets.push(socket);
    socket["nickname"] = "Anon"; //닉네임X 사람들 기본설정
    console.log("Connected to Browser!");
    socket.on("close", onSocketClose); //서버 닫혔을때 실행
    socket.on("message", (msg)=>{
        const message = JSON.parse(msg.toString("utf-8"));
        switch(message.type){   //type가 new_message일때만 모든 브라우저에 보이기 => 닉네임은 안뜨게 처리
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));    //sockets안의 브라우저에게 모두 메시지 전송
                break;
            case "nickname":
                socket["nickname"] = message.payload;   //socket에 새로운 아이템 추가(socket안에 데이터 저장가능)
                break;
        }
    });      //브라우저에서 보내기
});
 */
httpserver.listen(3000, handleListen);

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