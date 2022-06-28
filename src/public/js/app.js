const socket = io();  //backend에 socket 정보 출력된다. (연결된 소켓 자동 추적)

const welcome = document.getElementById('welcome')
const form = welcome.querySelector('form');

function backendDone(msg){
    console.log(`The backend says: `, msg);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    //function 서버에 전송(서버에서 호출가능)  //?function은 맨 마지막에 보내야한다!
    //emit : event전송 (object전송가능)
    socket.emit("enter_room", input.value, backendDone);  //? emit(app)  == on(server) 같은 이름(str)
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);