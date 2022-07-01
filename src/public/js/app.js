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
  const input = room.querySelector("input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);

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


socket.on("welcome", () => {
  addMessage("someone joined!");
})

socket.on("bye", () => {
  addMessage("someone left!");
})

socket.on("new_message", addMessage);   ///addMessage == (msg) => {addMessage{msg}}
