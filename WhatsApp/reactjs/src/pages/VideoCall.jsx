import React, { use, useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";
import CallScreen from "../components/CallScreen.jsx";

// Ringtone assets (replace with your own)
const incomingRingUrl = "/sounds/incoming.mp3";
const outgoingRingUrl = "/sounds/outgoing.mp3";

const VideoCall = ({
  userId,
  userName = "User Name",
  userProfile = "/avatar.png",
  remoteId = "",
  callingfunc,
}) => {
  const [myPeerId, setMyPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [rejectInfo, setRejectInfo] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentCall = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const incomingAudioRef = useRef(null);
  const outgoingAudioRef = useRef(null);
  const debug = false;

  useEffect(() => {
    setRemotePeerId(remoteId.toString() || "");
  }, [remoteId]);

  useEffect(() => {
    callingfunc({
      startCall,
      endCall,
    });
  }, [callingfunc]);

  // ==== INITIAL SETUP ====
  useEffect(() => {
    if (!userId) return;

    // Helper to create a peer safely
    const createPeer = async (idToUse) => {
      // Destroy any existing peer before reconnecting
      if (peerRef.current) {
        try {
          peerRef.current.destroy();
          console.log("🧹 Old peer destroyed before reconnecting");
        } catch (e) {
          console.warn("Failed to destroy old peer:", e);
        }
        await new Promise((r) => setTimeout(r, 300)); // wait for cleanup
      }

      console.log("🔌 Creating peer with ID:", idToUse);

      const peer = new Peer(idToUse, {
        host: "localhost",
        port: 5001,
        path: "/peerjs/myapp",
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("✅ Peer connected:", id);
        setMyPeerId(id);
      });

      // Handle incoming data connections
      peer.on("connection", (conn) => {
        console.log("Data connection with:", conn.peer);
        conn.on("data", (data) => {
          console.log("Received data:", data);

          if (data.type === "reject") {
            stopAllSounds();
            endCall();
            setRejectInfo({
              name: data.name,
              avatar: data.avatar,
              reason: data.reason,
            });
          }

          if (data.type === "end") {
            console.log("Call ended by remote user");
            stopAllSounds();
            endCall();
          }
        });
      });

      // Handle incoming call
      peer.on("call", (call) => {
        console.log("Incoming call metadata:", call.metadata);
        setRemotePeerId(call.metadata.userId);

        setCallerInfo({
          callerName: call.metadata?.name || "Unknown User",
          callerAvatar:
            call.metadata?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          reason: call.metadata?.reason || "Incoming video call...",
        });

        setIncomingCall(call);
        playIncomingRingtone();
      });

      // Handle disconnect / close
      peer.on("disconnected", handlePeerDisconnect);
      peer.on("close", handlePeerDisconnect);

      // Handle errors — retry if ID is taken
      peer.on("error", (err) => {
        console.error("PeerJS error:", err);

        if (err.type === "unavailable-id") {
          console.warn("ID already taken — retrying...");
          peer.destroy();
          setTimeout(() => createPeer(idToUse), 500); // retry after short delay
        }
      });
    };

    // Start peer
    createPeer(userId);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up peer...");
      peerRef.current?.destroy();
      stopAllSounds();
    };
  }, [userId]);

  // ==== Handle Peer Disconnect ====
  const handlePeerDisconnect = () => {
    console.log("Peer disconnected");
    endCall();
  };

  // ==== Ringtone ====
  const playIncomingRingtone = () => {
    stopAllSounds();
    incomingAudioRef.current = new Audio(incomingRingUrl);
    incomingAudioRef.current.loop = true;
    incomingAudioRef.current.play().catch(() => {});
  };

  const playOutgoingRingtone = () => {
    stopAllSounds();
    outgoingAudioRef.current = new Audio(outgoingRingUrl);
    outgoingAudioRef.current.loop = true;
    outgoingAudioRef.current.play().catch(() => {});
  };

  const stopAllSounds = () => {
    [incomingAudioRef, outgoingAudioRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  };

  // ==== START CALL ====
  const startCall = async (remotePeerId) => {
    if (!remotePeerId) return alert("Enter a valid user ID!");

    playOutgoingRingtone();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    localVideoRef.current.srcObject = stream;
    localVideoRef.current.muted = true;
    await localVideoRef.current.play().catch(console.error);

    const call = peerRef.current.call(remotePeerId, stream, {
      metadata: {
        userId: myPeerId,
        name: "Tahir Iqbal",
        avatar: "https://i.pravatar.cc/100?u=tahir",
      },
    });

    call.on("stream", (remoteStream) => {
      stopAllSounds();
      setIsStreaming(true);
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;
      remoteVideoRef.current.play().catch(console.error);
    });

    call.on("close", () => {
      console.log("Call closed by remote");
      endCall();
    });

    call.on("error", (err) => {
      console.log("Call error:", err);
      endCall();
    });

    currentCall.current = call;
    setCallActive(true);
  };

  // ==== ACCEPT CALL ====
  const acceptCall = async () => {
    if (!incomingCall) return;
    stopAllSounds();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;

    localVideoRef.current.srcObject = stream;
    localVideoRef.current.muted = true;
    await localVideoRef.current.play().catch(console.error);

    incomingCall.answer(stream);

    incomingCall.on("stream", (remoteStream) => {
      stopAllSounds();
      setIsStreaming(true);
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;
      remoteVideoRef.current.play().catch(console.error);
    });

    incomingCall.on("close", endCall);
    incomingCall.on("error", endCall);

    currentCall.current = incomingCall;
    setIncomingCall(null);
    setCallActive(true);
  };

  // ==== END CALL ====
  const endCall = () => {
    stopAllSounds();
    if (currentCall.current) currentCall.current.close();

    setIsStreaming(false);
    setCallActive(false);
    setIncomingCall(null);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    //Notify remote via PeerJS
    if (remotePeerId && peerRef.current) {
      const conn = peerRef.current.connect(remotePeerId);
      conn.on("open", () => conn.send({ type: "end" }));
    }

    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  // ==== TOGGLE VIDEO ====
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current
        .getTracks()
        .find((t) => t.kind === "video");
      if (track) {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
      }
    }
  };

  // ==== TOGGLE AUDIO ====
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current
        .getTracks()
        .find((t) => t.kind === "audio");
      if (track) {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      }
    }
  };

  // ==== REJECT CALL ====
  const rejectCall = () => {
    stopAllSounds();
    if (incomingCall) incomingCall.close();
    setIncomingCall(null);

    if (remotePeerId && peerRef.current) {
      const conn = peerRef.current.connect(remotePeerId);
      conn.on("open", () => {
        conn.send({
          type: "reject",
          name: "Tahir Iqbal",
          avatar: "https://i.pravatar.cc/100?u=tahir",
          reason: "User declined the call.",
        });
      });
    }

    endCall();
  };

  return (
    <div
      className=""
      style={
        callActive || incomingCall || rejectInfo
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            }
          : {}
      }
    >
      {debug && (
        <>
          <p className="text-gray-700 mb-2">
            <strong>Your ID:</strong> {myPeerId || "Connecting..."}
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter user ID to call"
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
              className="border p-2 rounded w-72"
            />
            <button
              onClick={startCall}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Call
            </button>
            <button
              onClick={endCall}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              End
            </button>
          </div>
        </>
      )}

      {/* Incoming Call Popup */}
      {incomingCall && callerInfo && (
        <CallScreen
          title={callerInfo.reason}
          callerName={callerInfo.callerName}
          callerImage={callerInfo.callerAvatar}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      {/* Calling Call Popup */}
      {!isStreaming && callActive && (
        <CallScreen
          title="Calling..."
          callerName={"Leonardo DiCaprio"}
          callerImage={"https://i.pravatar.cc/100?u=leonardo"}
          onReject={endCall}
          rejectText="Hang Up"
        />
      )}

      {/* Rejection Popup */}
      {rejectInfo && (
        <CallScreen
          title="Call Rejected"
          callerName={rejectInfo.name}
          callerImage={rejectInfo.avatar}
          onReject={() => setRejectInfo(null)}
          rejectText="Close"
        />
      )}

      {/* Video Panels */}

      <div
        className="relative w-full h-screen bg-black overflow-hidden"
        style={{ display: isStreaming ? "block" : "none" }}
      >
        {/* Remote video (full screen) */}
        <video
          ref={remoteVideoRef}
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Local video (small preview, top-right corner) */}
        <div className="absolute top-4 right-4 w-32 h-24 border-2 border-white rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            muted
            playsInline
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>

        {/* Control buttons (bottom center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            className={`px-4 py-2 rounded-full ${
              videoEnabled ? "bg-green-600" : "bg-gray-600"
            } text-white text-sm`}
          >
            {videoEnabled ? "Camera On" : "Camera Off"}
          </button>

          {/* Toggle Audio */}
          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-full ${
              audioEnabled ? "bg-green-600" : "bg-gray-600"
            } text-white text-sm`}
          >
            {audioEnabled ? "Mic On" : "Mic Off"}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="px-4 py-2 rounded-full bg-red-600 text-white text-sm"
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
