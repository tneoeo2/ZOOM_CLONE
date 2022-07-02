const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;     //디폴트 값 설정
let cameraOff = false;

async function getCameras() {   //user 장치 목록 얻어오기
  try{                  //promise -> trycatch 처리
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput"); //video관련기기만 추출
    const currentCamera = myStream.getVideoTracks()[0];  //최근에 선택된 카메라 찾기
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
    video: {facingMode: "user"},
  };
  const cameraConstraints = {
    audio: true, 
    video: { deviceId: { exact: deviceId }} , //특정 장치 요청
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId? cameraConstraints : initialConstrains   
    );
    // console.log(myStream);
    myFace.srcObject = myStream;
    if(!deviceId){   //처음에만 실행되게 변경
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}


getMedia();

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

async function handleCameraChange(){
  await getMedia(cameraSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick); 
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);