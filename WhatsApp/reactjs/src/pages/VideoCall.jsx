import React, { useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";

// Ringtone assets (replace with your own)
const incomingRingUrl = "/sounds/incoming.mp3";
const outgoingRingUrl = "/sounds/outgoing.mp3";

const VideoCall = ({ userId }) => {
  const [myPeerId, setMyPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [rejectInfo, setRejectInfo] = useState(null); // 💬 For reject popup
  const [callerInfo, setCallerInfo] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentCall = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const incomingAudioRef = useRef(null);
  const outgoingAudioRef = useRef(null);

  // ==== INITIAL SETUP ====
  useEffect(() => {
    const peer = new Peer(userId, {
      host: "localhost",
      port: 5001,
      path: "/peerjs/myapp",
    });
    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("Peer connected:", id);
      setMyPeerId(id);
    });

    // ✅ Handle data events (reject/end)
    peer.on("connection", (conn) => {
      console.log("🔗 Data connection with:", conn.peer);
      conn.on("data", (data) => {
        console.log("📩 Received data:", data);
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
          console.log("📴 Call ended by remote user");
          stopAllSounds();
          endCall();
        }
      });
    });

    // Handle incoming calls
    peer.on("call", (call) => {
      console.log("📞 Incoming call metadata:", call.metadata);
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

    peer.on("disconnected", handlePeerDisconnect);
    peer.on("close", handlePeerDisconnect);
    peer.on("error", handlePeerDisconnect);

    return () => {
      peer.destroy();
      stopAllSounds();
    };
  }, [userId]);

  // ==== Handle Peer Disconnect ====
  const handlePeerDisconnect = () => {
    console.log("🔌 Peer disconnected");
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
  const startCall = async () => {
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
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;
      remoteVideoRef.current.play().catch(console.error);
    });

    call.on("close", () => {
      console.log("📴 Call closed by remote");
      endCall();
    });

    call.on("error", (err) => {
      console.log("❌ Call error:", err);
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

    setCallActive(false);
    setIncomingCall(null);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    // 🔥 Notify remote via PeerJS
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
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-semibold mb-2">
        PeerJS Video Call (No Socket)
      </h2>

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

      {/* Video Panels */}
      <div className="flex gap-6">
        {/* Local video */}
        <div>
          <p className="text-center text-sm text-gray-500 mb-1">You</p>
          <video
            ref={localVideoRef}
            muted
            playsInline
            className="w-64 h-48 bg-black rounded"
          />
          <div className="flex justify-center gap-2 mt-2">
            <button
              onClick={toggleVideo}
              className={`px-3 py-1 rounded ${
                videoEnabled ? "bg-green-600" : "bg-gray-500"
              } text-white text-sm`}
            >
              {videoEnabled ? "Camera On" : "Camera Off"}
            </button>
            <button
              onClick={toggleAudio}
              className={`px-3 py-1 rounded ${
                audioEnabled ? "bg-green-600" : "bg-gray-500"
              } text-white text-sm`}
            >
              {audioEnabled ? "Mic On" : "Mic Off"}
            </button>
          </div>
        </div>

        {/* Remote video */}
        <div>
          <p className="text-center text-sm text-gray-500 mb-1">Remote</p>
          <video
            ref={remoteVideoRef}
            playsInline
            autoPlay
            className="w-64 h-48 bg-black rounded"
          />
        </div>
      </div>

      {/* Incoming Call Popup */}
      {incomingCall && callerInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
            <img
              src={callerInfo.callerAvatar || "/default-avatar.png"}
              alt={callerInfo.callerName || "Caller"}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-gray-300 object-cover"
            />
            <h3 className="text-lg font-semibold mb-1 text-gray-800">
              {callerInfo.callerName || "Unknown User"} is calling 📞
            </h3>
            <p className="mb-4 text-gray-600 italic">
              “{callerInfo.reason || "Incoming video call..."}”
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={acceptCall}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Popup */}
      {rejectInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm">
            <img
              src={rejectInfo.avatar}
              alt="avatar"
              className="w-20 h-20 mx-auto rounded-full mb-3"
            />
            <h3 className="text-xl font-semibold mb-2">
              {rejectInfo.name} rejected your call
            </h3>
            <p className="text-gray-600 mb-4">{rejectInfo.reason}</p>
            <button
              onClick={() => setRejectInfo(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {callActive && (
        <p className="text-green-600 font-semibold mt-3">Call Active ✅</p>
      )}
    </div>
  );
};

export default VideoCall;
