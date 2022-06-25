const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector('#message');
//socket : 서버로의 연결
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}

function handleOpen(){
    console.log("Connected to Server!");
}

function handleClose(){
    console.log("Discconnected from Server! ")
}

socket.addEventListener("message", (message)=>{    //메시지 입력되면 li 태그 생성하여 추가
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", handleClose);


function handleSubmit(event){
    event.preventDefault();   //키입력이 input칸 채우는 것을 방지
    const input = messageForm.querySelector('input');
    socket.send(makeMessage("new_message", input.value));   //값 소켓에 전송한후
    input.value = '';           //input 값 초기화
}

function handleNickSubmit(event){
    event.preventDefault();   //키입력이 input칸 채우는 것을 방지
    const input = nickForm.querySelector('input');
    socket.send(makeMessage("nickname", input.value));
    input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);


