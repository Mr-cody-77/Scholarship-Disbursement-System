export const initiateWebRTC = (userId, role, sessionId) => {
  const signalingServerUrl = import.meta.env.VITE_SIGNALING_SERVER_URL || "ws://localhost:3000";
  let signalingServer;
  const peerConnection = new RTCPeerConnection();

  // Initialize the signaling server connection
  const connectSignalingServer = () => {
    signalingServer = new WebSocket(signalingServerUrl);

    signalingServer.onopen = () => {
      console.log("Connected to the signaling server");
      // Register with the signaling server
      signalingServer.send(
        JSON.stringify({ type: "register", role, sessionId })
      );
    };

    signalingServer.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (data.type === "ready") {
        console.log("Both admin and client are ready for the call");
        if (role === "client") startCall(); // Client initiates the call
      } else if (data.type === "answer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === "candidate") {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else if (data.type === "offer" && role === "admin") {
        // Handle incoming offer for admin
        await handleIncomingOffer(data.offer, data.userId);
      }
    };

    signalingServer.onclose = () => {
      console.log("Disconnected from the signaling server");
    };

    signalingServer.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      signalingServer.send(
        JSON.stringify({ type: "candidate", candidate: event.candidate, userId })
      );
    }
  };

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = event.streams[0];
  };

  // Create and send an offer (client-side)
  const startCall = async () => {
    if (signalingServer.readyState !== WebSocket.OPEN) {
      console.error("Signaling server is not ready");
      return;
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingServer.send(JSON.stringify({ type: "offer", offer, userId }));
  };

  // Handle incoming offer (admin-side)
  const handleIncomingOffer = async (offer, userId) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    signalingServer.send(JSON.stringify({ type: "answer", answer, userId }));
  };

  // Add local media stream
  const addLocalMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
      const localVideo = document.getElementById("localVideo");
      localVideo.srcObject = stream;
    } catch (error) {
      console.error("Failed to access media devices:", error);
    }
  };

  // Start everything
  const initialize = async () => {
    connectSignalingServer();
    await addLocalMediaStream();
  };

  initialize();
};
