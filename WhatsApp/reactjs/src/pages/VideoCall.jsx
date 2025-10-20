import React, { useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import CallScreen from "../components/CallScreen.jsx";

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
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
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
      setCallerInfo,
    });
  }, [callingfunc]);

  useEffect(() => {
    if (!userId) return;

    const createPeer = async (idToUse) => {
      if (peerRef.current) {
        try {
          peerRef.current.destroy();
        } catch (e) {}
        await new Promise((r) => setTimeout(r, 300));
      }

      const peer = new Peer(idToUse, {
        host: "localhost",
        port: 5001,
        path: "/peerjs/myapp",
      });

      peerRef.current = peer;

      peer.on("open", (id) => setMyPeerId(id));

      peer.on("connection", (conn) => {
        conn.on("data", (data) => {
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
            stopAllSounds();
            endCall();
          }
          if (data.type === "state") {
            if (data.videoEnabled !== undefined)
              setRemoteVideoEnabled(data.videoEnabled);
            if (data.audioEnabled !== undefined)
              setRemoteAudioEnabled(data.audioEnabled);
          }
        });
      });

      peer.on("call", (call) => {
        setCallerInfo({
          callerName: call.metadata?.name || "Unknown User",
          callerAvatar:
            call.metadata?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          reason: call.metadata?.reason || "Incoming video call...",
        });
        setRemotePeerId(call.metadata?.userId);
        setIncomingCall(call);
        playIncomingRingtone();
      });

      peer.on("disconnected", handlePeerDisconnect);
      peer.on("close", handlePeerDisconnect);
      peer.on("error", (err) => console.error("PeerJS error:", err));
    };

    createPeer(userId);

    return () => {
      peerRef.current?.destroy();
      stopAllSounds();
    };
  }, [userId]);

  const handlePeerDisconnect = () => endCall();

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

  const sendStateUpdate = (newState) => {
    if (remotePeerId && peerRef.current) {
      const conn = peerRef.current.connect(remotePeerId);
      conn.on("open", () => conn.send({ type: "state", ...newState }));
    }
  };

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
        userId: userId.toString(),
        name: userName,
        avatar: userProfile,
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

    call.on("close", endCall);
    call.on("error", endCall);
    currentCall.current = call;
    setCallActive(true);
  };

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
      remoteVideoRef.current.play().catch(console.error);
    });
    incomingCall.on("close", endCall);
    incomingCall.on("error", endCall);
    currentCall.current = incomingCall;
    setIncomingCall(null);
    setCallActive(true);
  };

  const endCall = () => {
    stopAllSounds();
    if (currentCall.current) currentCall.current.close();
    setIsStreaming(false);
    setCallActive(false);
    setIncomingCall(null);
    if (localStreamRef.current)
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    if (remotePeerId && peerRef.current) {
      const conn = peerRef.current.connect(remotePeerId);
      conn.on("open", () => conn.send({ type: "end" }));
    }
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current
      .getTracks()
      .find((t) => t.kind === "video");
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
      sendStateUpdate({ videoEnabled: track.enabled });
    }
  };

  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current
      .getTracks()
      .find((t) => t.kind === "audio");
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
      sendStateUpdate({ audioEnabled: track.enabled });
    }
  };

  const rejectCall = () => {
    stopAllSounds();
    if (incomingCall) incomingCall.close();
    setIncomingCall(null);
    if (remotePeerId && peerRef.current) {
      const conn = peerRef.current.connect(remotePeerId);
      conn.on("open", () =>
        conn.send({
          type: "reject",
          name: userName || "Unknown User",
          avatar:
            userProfile ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          reason: "User declined the call.",
        })
      );
    }
    endCall();
  };

  return (
    <div
      style={
        callActive || incomingCall || rejectInfo
          ? { position: "fixed", inset: 0, zIndex: 1000 }
          : {}
      }
    >
      {/* Popups */}
      {incomingCall && callerInfo && (
        <CallScreen
          title={callerInfo.reason}
          callerName={callerInfo.callerName}
          callerImage={callerInfo.callerAvatar}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      {!isStreaming && callActive && (
        <CallScreen
          title="Calling..."
          callerName={callerInfo?.callerName}
          callerImage={callerInfo?.callerAvatar}
          onReject={endCall}
          rejectText="Hang Up"
        />
      )}

      {rejectInfo && (
        <CallScreen
          title="Call Rejected"
          callerName={rejectInfo.name}
          callerImage={rejectInfo.avatar}
          onReject={() => setRejectInfo(null)}
          rejectText="Close"
        />
      )}

      {/* VIDEO UI */}
      <div
        className="relative w-full h-screen bg-black overflow-hidden"
        style={{ display: isStreaming ? "block" : "none" }}
      >
        {/* Remote video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            playsInline
            autoPlay
            className={`absolute inset-0 w-full h-full object-contain ${
              remoteVideoEnabled ? "block" : "hidden"
            }`}
          />
          {!remoteVideoEnabled && (
            <img
              src={callerInfo?.callerAvatar || "/avatar.png"}
              alt="Remote Avatar"
              className="w-32 h-32 rounded-full border-2 border-white object-cover"
            />
          )}
        </div>

        {/* Remote mic status */}
        <div className="absolute top-4 left-4 bg-black/60 rounded-full p-2">
          {remoteAudioEnabled ? (
            <Mic className="w-5 h-5 text-green-400" />
          ) : (
            <MicOff className="w-5 h-5 text-red-500" />
          )}
        </div>

        {/* Local preview */}
        <div className="absolute top-4 right-4 w-32 h-24 border-2 border-white rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-black/60">
          <video
            ref={localVideoRef}
            muted
            playsInline
            autoPlay
            className={`w-full h-full object-cover ${
              videoEnabled ? "block" : "hidden"
            }`}
          />
          {!videoEnabled && (
            <img
              src={userProfile}
              alt="You"
              className="w-16 h-16 rounded-full border-2 border-white object-cover"
            />
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 items-center">
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105 ${
              videoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-500"
            }`}
          >
            {videoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transition transform hover:scale-110"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>

          <button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105 ${
              audioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-500"
            }`}
          >
            {audioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
