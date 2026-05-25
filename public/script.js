const socket = io();

const myVideo = document.getElementById("myVideo");
const remoteVideo = document.getElementById("remoteVideo");

const roomScreen = document.getElementById("roomScreen");
const mainScreen = document.getElementById("mainScreen");

const joinBtn = document.getElementById("joinBtn");
const roomName = document.getElementById("roomName");
const roomPassword = document.getElementById("roomPassword");

const chatToggle = document.getElementById("chatToggle");
const chatPanel = document.getElementById("chatPanel");

const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const soundBtn = document.getElementById("soundBtn");
const volumeSlider = document.getElementById("volumeSlider");
const changePasswordBtn = document.getElementById("changePasswordBtn");

let localStream;
let peer = null;
let currentRoom = "";

let micEnabled = true;
let camEnabled = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
.then(stream => {

    localStream = stream;

    myVideo.srcObject = stream;

})
.catch(err => {

    alert(
        "Kamera/Mikrofon açılamadı:\n" +
        err.message
    );

});

joinBtn.onclick = () => {

    const room =
    roomName.value.trim();

    const password =
    roomPassword.value.trim();

    if(!room || !password){

        alert(
        "Oda adı ve şifre gir"
        );

        return;
    }

    currentRoom = room;

    socket.emit(
        "join-room",
        {
            room,
            password
        }
    );

};

socket.on(
    "room-error",
    msg => {

        alert(msg);

    }
);

socket.on(
    "joined-room",
    count => {

        roomScreen.style.display =
        "none";

        mainScreen.style.display =
        "block";

        if(count === 1){

            createPeer(true);

        }

    }
);

socket.on(
    "user-connected",
    () => {

        if(!peer){

            createPeer(false);

        }

    }
);

function createPeer(initiator){

    peer = new SimplePeer({

        initiator: initiator,

        trickle: false,

        stream: localStream,

        config:{
            iceServers:[
                {
                    urls:[
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302"
                    ]
                }
            ]
        }

    });

    peer.on(
        "signal",
        signal => {

            socket.emit(
                "signal",
                {
                    room: currentRoom,
                    signal: signal
                }
            );

        }
    );

    peer.on(
        "stream",
        stream => {

            remoteVideo.srcObject =
            stream;

        }
    );

    peer.on(
        "error",
        err => {

            console.log(
                "Peer hata:",
                err
            );

        }
    );

}

socket.on(
    "signal",
    signal => {

        if(!peer){

            createPeer(false);

        }

        peer.signal(signal);

    }
);

socket.on(
    "user-disconnected",
    () => {

        remoteVideo.srcObject =
        null;

        if(peer){

            peer.destroy();

            peer = null;

        }

    }
);

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

    if(
        chatPanel.style.display !==
        "flex"
    ){

        chatToggle.classList.add(
            "newMessageBlink"
        );

    }

}

sendBtn.onclick = () => {

    const text =
    input.value.trim();

    if(!text) return;

    socket.emit(
        "chat-message",
        text
    );

    addMyMessage(text);

    input.value = "";

};

input.addEventListener(
    "keydown",
    e => {

        if(
            e.key === "Enter"
        ){

            sendBtn.click();

        }

    }
);

socket.on(
    "chat-message",
    msg => {

        addOtherMessage(msg);

    }
);

chatToggle.onclick = () => {

    if(
        chatPanel.style.display ===
        "flex"
    ){

        chatPanel.style.display =
        "none";

        document.body.classList.remove(
            "chat-open"
        );

    }
    else{

        chatPanel.style.display =
        "flex";

        document.body.classList.add(
            "chat-open"
        );

        chatToggle.classList.remove(
            "newMessageBlink"
        );

    }

};

micBtn.onclick = () => {

    micEnabled =
    !micEnabled;

    localStream
    .getAudioTracks()
    .forEach(track => {

        track.enabled =
        micEnabled;

    });

    micBtn.textContent =
    micEnabled
    ? "🎤 Açık"
    : "🔇 Kapalı";

};

camBtn.onclick = () => {

    camEnabled =
    !camEnabled;

    localStream
    .getVideoTracks()
    .forEach(track => {

        track.enabled =
        camEnabled;

    });

    camBtn.textContent =
    camEnabled
    ? "📷 Açık"
    : "🚫 Kapalı";

};

remoteVideo.muted = true;
remoteVideo.volume = 0;

volumeSlider.value = 0;

volumeSlider.oninput = () => {

    remoteVideo.muted = false;

    remoteVideo.volume =
    parseFloat(
        volumeSlider.value
    );

};

soundBtn.onclick = () => {

    if(
        remoteVideo.muted
    ){

        remoteVideo.muted =
        false;

        soundBtn.textContent =
        "🔊 Açık";

    }
    else{

        remoteVideo.muted =
        true;

        soundBtn.textContent =
        "🔇 Kapalı";

    }

};

changePasswordBtn.onclick = () => {

    const pass =
    prompt(
        "Yeni şifre"
    );

    if(!pass) return;

    socket.emit(
        "change-password",
        pass
    );

};

socket.on(
    "password-changed",
    () => {

        alert(
            "Oda şifresi değiştirildi"
        );

    }
);

document
.querySelectorAll(
"#emojiPanel span"
)
.forEach(item => {

    item.onclick = () => {

        input.value +=
        item.textContent;

        input.focus();

    };

});