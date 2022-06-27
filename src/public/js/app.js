const socket = io();  //backend에 socket 정보 출력된다. (연결된 소켓 자동 추적)

const welcome = document.getElementById('welcome')
const form = welcome.querySelector('form');

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", {payload: input.value},()=> {   //? emit(app)  == on(server) 같은 이름(str)
    console.log("server is done!" );    //function 서버에 전송(서버에서 호출가능)
});     //emit : event전송 (object전송가능)
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);