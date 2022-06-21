import express from "express";   //express view 설정, render해주는 역할

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));   //frontend에서 구동되는 코드(app.js) (user가 볼수 있는 폴더)
app.get("/", (req, res) => res.render("home"));   //home에서 res, req를 받고 home을 렌더해줌 (template 렌더)
app.get("/*", (req, res) => res.redirect("/"));  //home 외의 나머지 주소 redirect
const handleListen = () => console.log('Lintening on http://localhost:3000');
app.listen(3000, handleListen); 

//nodemon  ignore 설정으로 server 수정시에만 서버 새로고침되게 변경
//server.js    node(backend에서 구동되는 코드)