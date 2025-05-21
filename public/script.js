const socket = io("https://video-call-app-gvys.onrender.com");
const peer = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
});


let localStream;
let remoteSocketId;

const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
const callBtn = document.getElementById("call-btn");
const callToIdInput = document.getElementById("call-to-id");

document.getElementById("socket-id").textContent = socket.id;

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
  localVideo.srcObject = stream;
  localStream = stream;
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
});

peer.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};

peer.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", {
      to: remoteSocketId,
      candidate: event.candidate,
    });
  }
};

socket.on("connect", () => {
  document.getElementById("socket-id").textContent = socket.id;
});

callBtn.addEventListener("click", async () => {
  remoteSocketId = callToIdInput.value;
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  socket.emit("call-user", { offer, to: remoteSocketId });
});

socket.on("call-made", async (data) => {
  remoteSocketId = data.socket;
  await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  socket.emit("make-answer", { answer, to: data.socket });
});

socket.on("answer-made", async (data) => {
  await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
});

socket.on("ice-candidate", async (data) => {
  if (data.candidate) {
    try {
      await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (e) {
      console.error("Error adding ICE candidate", e);
    }
  }
});
