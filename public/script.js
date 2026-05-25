const socket = io();

const myVideo =
document.getElementById("myVideo");

const remoteVideo =
document.getElementById("remoteVideo");

const joinBtn =
document.getElementById("joinBtn");

const roomInput =
document.getElementById("roomInput");

const passwordInput =
document.getElementById("passwordInput");

const loginScreen =
document.getElementById("loginScreen");

const chatToggle =
document.getElementById("chatToggle");

const chatPanel =
document.getElementById("chatPanel");

const input =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

const messages =
document.getElementById("messages");

const cameraBtn =
document.getElementById("cameraBtn");

const micBtn =
document.getElementById("micBtn");

const volumeSlider =
document.getElementById("volumeSlider");

let localStream;

let peer;

let roomName = "";

remoteVideo.volume = 0;

navigator.mediaDevices
.getUserMedia({
video:true,
audio:true
})
.then(stream=>{

localStream = stream;

myVideo.srcObject =
stream;

})
.catch(err=>{

alert(
"Kamera veya mikrofon açılamadı\n\n"
+ err.message
);

});

joinBtn.onclick = ()=>{

const room =
roomInput.value.trim();

const password =
passwordInput.value.trim();

if(!room){

alert(
"Oda adı gir"
);

return;
}

if(!password){

alert(
"Şifre gir"
);

return;
}

roomName = room;

socket.emit(
"join-room",
{
room:room,
password:password
}
);

};

socket.on(
"joined",
()=>{

loginScreen.style.display =
"none";

});

socket.on(
"wrong-password",
()=>{

alert(
"Şifre yanlış"
);

});

socket.on(
"room-full",
()=>{

alert(
"Oda dolu"
);

});

socket.on(
"ready",
()=>{

if(peer) return;

createPeer(true);

});

function createPeer(initiator){

peer =
new SimplePeer({

initiator:initiator,

trickle:false,

stream:localStream

});

peer.on(
"signal",
signal=>{

socket.emit(
"signal",
{
room:roomName,
signal:signal
}
);

});

peer.on(
"stream",
stream=>{

remoteVideo.srcObject =
stream;

});

peer.on(
"error",
err=>{

console.log(err);

});

}

socket.on(
"signal",
signal=>{

if(!peer){

createPeer(false);

}

peer.signal(signal);

});

cameraBtn.onclick = ()=>{

if(!localStream) return;

const track =
localStream.getVideoTracks()[0];

track.enabled =
!track.enabled;

cameraBtn.textContent =
track.enabled
?
"📷 Açık"
:
"📷 Kapalı";

};

micBtn.onclick = ()=>{

if(!localStream) return;

const track =
localStream.getAudioTracks()[0];

track.enabled =
!track.enabled;

micBtn.textContent =
track.enabled
?
"🎤 Açık"
:
"🎤 Kapalı";

};

volumeSlider.oninput = ()=>{

remoteVideo.volume =
volumeSlider.value / 100;

};

chatToggle.onclick = ()=>{

if(chatPanel.style.display==="flex"){

chatPanel.style.display =
"none";

document.body.classList.remove(
"chat-open"
);

}else{

chatPanel.style.display =
"flex";

document.body.classList.add(
"chat-open"
);

}

};

function addMyMessage(text){

const div =
document.createElement("div");

div.className =
"myMessage";

div.textContent =
"BEN -> " + text;

messages.appendChild(div);

messages.scrollTop =
messages.scrollHeight;

}

function addOtherMessage(text){

const div =
document.createElement("div");

div.className =
"otherMessage";

div.textContent =
"SEN -> " + text;

messages.appendChild(div);

messages.scrollTop =
messages.scrollHeight;

}

function sendMessage(){

const text =
input.value.trim();

if(!text) return;

addMyMessage(text);

socket.emit(
"chat-message",
text
);

input.value="";

}

sendBtn.onclick =
sendMessage;

input.addEventListener(
"keydown",
e=>{

if(e.key==="Enter"){

sendMessage();

}

}
);

socket.on(
"chat-message",
msg=>{

addOtherMessage(msg);

}
);

document
.querySelectorAll(".emoji")
.forEach(emoji=>{

emoji.onclick = ()=>{

input.value +=
emoji.textContent;

input.focus();

};

});