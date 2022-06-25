const messageList = document.querySelector('ul');
const messageForm = document.querySelector('form');
//socket : 서버로의 연결
const socket = new WebSocket(`ws://${window.location.host}`);

function handleOpen(){
    console.log("Connected to Server!");
}

function handleClose(){
    console.log("Discconnected from Server! ")
}

socket.addEventListener("message", (message)=>{
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", handleClose);


function handleSubmit(event){
    event.preventDefault();   //키입력이 input칸 채우는 것을 방지
    const input = messageForm.querySelector('input');
    socket.send(input.value);
    input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);

