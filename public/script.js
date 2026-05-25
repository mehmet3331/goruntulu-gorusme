const socket = io();

let localStream;

navigator.mediaDevices.getUserMedia({

    video:true,
    audio:true

})
.then(stream=>{

    localStream=stream;

    document
    .getElementById("myVideo")
    .srcObject=stream;

})
.catch(err=>{

    alert(err.message);

});

/* KAMERA */

function toggleCamera(){

    const track=
    localStream.getVideoTracks()[0];

    track.enabled=!track.enabled;

}

/* MİKROFON */

function toggleMic(){

    const track=
    localStream.getAudioTracks()[0];

    track.enabled=!track.enabled;

}

/* SOHBET */

function toggleChat(){

    const panel=
    document.getElementById("chatPanel");

    if(panel.style.display==="flex"){

        panel.style.display="none";

    }else{

        panel.style.display="flex";

    }

}

/* ŞİFRE */

function changePassword(){

    const yeniSifre=
    prompt("Yeni oda şifresi");

    if(!yeniSifre) return;

    alert(
        "Yeni şifre: "
        + yeniSifre
    );

}

/* MESAJ GÖNDER */

function sendMessage(){

    const input=
    document.getElementById(
        "messageInput"
    );

    const text=
    input.value.trim();

    if(!text) return;

    socket.emit(
        "chat-message",
        text
    );

    addMyMessage(text);

    input.value="";
}

function addMyMessage(text){

    const div=
    document.createElement("div");

    div.className=
    "myMessage";

    div.innerHTML=
    "<b>BEN -> </b>"
    + text;

    document
    .getElementById("messages")
    .appendChild(div);

}

function addOtherMessage(text){

    const div=
    document.createElement("div");

    div.className=
    "otherMessage";

    div.innerHTML=
    "<b>SEN -> </b>"
    + text;

    document
    .getElementById("messages")
    .appendChild(div);

}

socket.on(
    "chat-message",
    msg=>{

        addOtherMessage(msg);

    }
);