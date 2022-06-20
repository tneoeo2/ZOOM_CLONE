import express from "express";   //express view 설정, render해주는 역할

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));   //home에서 res, req를 받고 home을 렌더해줌

const handleListen = () => console.log('Lintening on http://localhost:3000');
app.listen(3000, handleListen); 

//nodemon  ignore 설정으로 server 수정시에만 서버 새로고침되게 변경