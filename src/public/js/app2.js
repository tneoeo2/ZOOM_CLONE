const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const msgBtn = document.querySelector("#inputDiv button");
const chatList = document.getElementById("chatList");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;     //디폴트 값 설정
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;


async function getCameras() {   //user 장치 목록 얻어오기
  try{                  //promise -> trycatch 처리
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput"); //video관련기기만 추출
    const currentCamera = myStream.getVideoTracks()[0];  //최근에 선택된 카메라 찾기
    // console.log('test: ', myStream);
    cameras.forEach(camera => {
      const option = document.createElement("option");
      option.value = camera.deviceId;   //deviceID 얻어와 value로 지정
      option.innerText = camera.label;    //camera label innerText로 지정
      if(currentCamera.label == camera.label){
        option.selected = true; 
      }
      cameraSelect.appendChild(option);
    })
    // console.log(devices);
    // console.log("cameras : ", cameras);
  }catch (e){
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {     //ㅋㅏㅁㅔㄹㅏ초기설정(deviceId 변수없을때)
    audio: true, 
    video: {
      mandatory: {
        maxWidth: 160,
        maxHeight: 120,
        maxFrameRate: 5,
      },
      optional: [
        { facingMode: 'user' },
      ],
    },
  };
  const cameraConstraints = {
    audio: true, 
    video: { deviceId: { exact: deviceId }} , //특정 장치 요청
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(  //새로운 stream 만듬
      deviceId? cameraConstraints : initialConstrains   
    );
    console.log("myStream: ", myStream);
    myFace.srcObject = myStream;
    if(!deviceId){   //처음에만 실행되게 변경
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}


function handleMuteClick() {
  // console.log(myStream.getAudioTracks());
  myStream
  .getAudioTracks()
  .forEach((track) => (track.enabled = !track.enabled));
  if(!muted){
    muteBtn.innerText = "Unmute";
    muted = true;
  }else{
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  // console.log(myStream.getVideoTracks());
  myStream
  .getVideoTracks()
  .forEach((track) => (track.enabled = !track.enabled));
  if(cameraOff){
    cameraBtn.innerText = "Turn Camera Off"
    cameraOff = false;
  }else{
    cameraBtn.innerText = "Turn Camera On"
    cameraOff = true;
  }

}

async function handleCameraChange(){ //카메라 변경시 stream은 바뀌어도 stack가 그대로 => 다른 브라우저에는 적용 안됨
  await getMedia(cameraSelect.value); //new Stream 만듬
  if(myPeerConnection){
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
    .getSenders()
    .find((sender) => sender.track.kind === "video");
    // console.log(videoSender);
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick); 
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);


//Welcome Form(join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector('form');

async function initCall(){
  welcome.hidden = true;
  call.hidden = false;
  await getMedia(); 
  makeConnection();
}

async function handleWelcomeSubmit(event){
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

function submitTextarea(){
    console.log("focusing!!!!")
    window.addEventListener("keydown", (e) => {
    // console.log("keydown!!!!", e, e.key);
        if (e.key === "Enter"){  //13 == Enter
            document.querySelector("#inputDiv button").click();
        }
    });
}


welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//Socket Code
document.querySelector("#inputDiv button").addEventListener("click", handleMsgBtn);
document.querySelector("#inputDiv textarea").addEventListener("focus", submitTextarea);


function handleMsgBtn(){   //sent 버튼 클릭시 실행
  console.log("메시지 전송!");
  let msg = document.querySelector("#inputDiv textarea").value;
  tmpDiv = document.createElement("div");
  chatList.insertAdjacentElement("afterEnd", tmpDiv);
  // console.log("data: ", event.data);
  // tmpDiv.innerText =  "recieve_data__-" + event.data;
  tmpDiv.innerText =  "나\n" + msg;
  myDataChannel.send(msg);
  document.querySelector("#inputDiv textarea").value = "";
  // console.log("textArea 비우기")
  
}
//test

socket.on("welcome", async() => {  //*peer A브라우저 에서 실행
  myDataChannel = myPeerConnection.createDataChannel("chat");
  // myDataChannel.addEventListener("message", (event) => console.log(event.data));   //메시지오면 이벤트 실행
  myDataChannel.addEventListener("message", (event) => {
    console.log('host입니다.---', event.data);
    tmpDiv = document.createElement("div");
    chatList.insertAdjacentElement("afterEnd", tmpDiv);
    tmpDiv.innerText = "guest_nick\n" + event.data;       //gueest가 받아봄
  } );   //메시지오면 이벤트 실행
  console.log("made data channel")
  const offer = await myPeerConnection.createOffer();  //peerA offer 생성
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);   //B로 offer 보냄
});


//? setLocalDescription  --> emit ---> on ---> setRemoteDescription    두브라우저 모두 local remote 가진다.
socket.on("offer",  async(offer) =>{   //*peer B 브라우저에서 실행
  myPeerConnection.addEventListener("datachannel", (event)=>{  //datachannel 이벤트 있으면 (ex> 데이터 채널 생성)
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) =>{
      console.log;
      console.log("guest입니다.---", event.data)
      tmpDiv = document.createElement("div");
      chatList.insertAdjacentElement("afterEnd", tmpDiv);
      tmpDiv.innerText = "guest_nick\n" + event.data;
      
    });
    // myDataChannel.addEventListener("message", handleMsgBtn(event));
  });
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
})

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", (ice)=>{
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
})

// RTC Code
//각 브라우저에서 카메라 마이크 데이터 stream 받아서 연결안에 집어넣는다

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [               //google에서 제공하는 stun서버 : request시 요청자의 공용ip주소 알려주는 서버
      {                         // 다른 네트워크에 있는 장치들이 서로를 찾기 위함
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ]
      }
    ]
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
  const peersStream = document.getElementById("peerFace");
  // console.log("got an stream from my peer");
  console.log("Peer',s Stream", data.stream);
  peersStream.srcObject = data.stream;
  // console.log("My stream: ", myStream);
  
}

////????? DATA CHannel 만들기 (websocket 없이 채팅 만들기 가능해짐)
/**
 * peer가 많아질수록 속도 느려짐
 *  => SFU방식 사용 : 한서버에 스트림 압축해서 보내고 각각 사양 스트림 보냄 
 *  발표자에겐 좀 더 고사양 스트림을 보냄
 *  ? data channel: 텍스트여서 peer많아도 빠르고 부담이 적다
 */