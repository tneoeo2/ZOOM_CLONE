const socket = io();  //backend에 socket 정보 출력된다. (연결된 소켓 자동 추적)

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);  
}

function handleMessageSubmit(event){
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event){
  event.preventDefault();
  
  room.querySelector('#msg').hidden = false;      //메시지칸 보이게 설ㅈ정
  const input = room.querySelector("#name input");
  // room.querySelector('#msg').hidden = false;
  socket.emit("nickname",  input.value);
  socket.emit("set_name", roomName);
}

function showRoom(event) {
  // welcome.hidden = true;
  // room.hidden = false;
  // event.preventDefault();
  welcome.hidden = true;
  room.hidden = false;
  room.querySelector('#msg').hidden = true;   //닉네임 설정전 메시지X
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  
  msgForm.addEventListener("submit", handleMessageSubmit);
  

}


function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    //function 서버에 전송(서버에서 호출가능)  //?function은 맨 마지막에 보내야한다!
    //emit : event전송 (object전송가능)
    socket.emit("enter_room", input.value, showRoom);  //? emit(app)  == on(server) 같은 이름(str)
    roomName = input.value;
    
    input.value = "";
  }
  
  form.addEventListener("submit", handleRoomSubmit);
  room.querySelector("#name").addEventListener("submit", handleNicknameSubmit);   //닉네임 설정  
  
socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
})

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left!`);
})

socket.on("new_message", addMessage);   ///addMessage == (msg) => {addMessage{msg}}

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if(rooms.length === 0){
    return;
  }
  rooms.forEach(room => {   //rooms이 비어있지 않으면 li 생성하여 추가
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  })
});  //새로운 방 생성시 콘솔에 확인

