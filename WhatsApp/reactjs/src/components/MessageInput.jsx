import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../Store/useChatStore";
import { Image, Send, X, Mic } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // --- 🔊 Short beep sound ---
  const playBeep = (frequency = 800, duration = 150) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // soft volume

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);
    } catch (err) {
      console.warn("Beep sound failed:", err);
    }
  };

  // --- 📸 Handle image upload ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // --- ❌ Remove selected image ---
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- 🎙 AUDIO RECORDING ----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      playBeep(); // Start beep
      toast.success("Recording started 🎙");
    } catch (err) {
      toast.error("Microphone access denied or unavailable");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      playBeep(400); // Stop beep (lower tone)
      toast.success("Recording stopped");
    }
  };

  // Convert Blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // ---- SEND MESSAGE ----
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;

    let audioBase64 = null;
    if (audioBlob) {
      audioBase64 = await blobToBase64(audioBlob);
    }

    try {
      sendMessage({
        text: text.trim(),
        file: imagePreview,
        audio: audioBase64,
      });

      setText("");
      setImagePreview(null);
      setAudioBlob(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // --- Responsive input width ---
  const [width, setWidth] = useState(
    window.innerWidth >= 1280 ? "calc(100vw - 520px)" : "calc(100vw - 15px)"
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(
        window.innerWidth >= 1280 ? "calc(100vw - 520px)" : "calc(100vw - 15px)"
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed bottom-3 pl-[10px] pr-[10px] flex justify-center">
      <form onSubmit={handleSendMessage}>
        <div className="relative">
          {/* 📷 Image picker */}
          <div
            onClick={() => {
              if (!audioBlob && !isRecording) fileInputRef.current?.click(); // disable click when audio attached
            }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full 
    ${
      audioBlob || isRecording
        ? "cursor-not-allowed"
        : "hover:bg-gray-100 cursor-pointer"
    } 
    ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            title={
              audioBlob
                ? "Cannot add image while audio is attached"
                : "Add image"
            }
          >
            <Image size={20} />
          </div>

          {/* ✉️ Send / 🎙 Mic toggle */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {text.trim() || imagePreview || audioBlob ? (
              <button type="submit" className="btn btn-sm btn-circle">
                <Send size={22} />
              </button>
            ) : (
              <div
                onClick={isRecording ? stopRecording : startRecording}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <Mic
                  size={22}
                  className={`transition-all ${
                    isRecording ? "text-red-600" : "text-gray-700"
                  }`}
                />
              </div>
            )}
          </div>

          {/* ✏️ Text input */}
          <input
            onChange={(e) => setText(e.target.value)}
            type="text"
            value={text}
            className="h-[55px] pl-[55px] pr-[50px] border rounded-full"
            style={{ width: width, backgroundColor: "#FFF" }}
            placeholder={isRecording ? "Recording..." : "Type a message"}
            // disabled={isRecording}
          />

          {/* 🖼 Image preview */}
          {imagePreview && (
            <div className="absolute bottom-16 left-[5px] mb-2 border rounded-md">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                type="button"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              >
                <X className="size-3 text-red-500" />
              </button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className=""
                aria-hidden="true"
                role="img"
                style={{ position: "absolute", bottom: 10, left: 10 }}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.5v.006a6.5 6.5 0 0 1-11.593 4.596L3.5 11.19a4.5 4.5 0 0 1 6.364-6.364l6.05 6.05a3.5 3.5 0 0 1-4.95 4.95L7.086 9.86"
                />
              </svg>
            </div>
          )}

          {/* 🔊 Audio preview */}
          {audioBlob && (
            <div className="absolute bottom-16 left-[5px] bg-gray-100 border p-3 rounded-lg flex items-center gap-2">
              <audio controls src={URL.createObjectURL(audioBlob)} />
              <button
                type="button"
                onClick={() => setAudioBlob(null)}
                className="text-red-500"
              >
                <X size={16} />
              </button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className=""
                aria-hidden="true"
                role="img"
                style={{ position: "absolute", bottom: 10, left: 10 }}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.5v.006a6.5 6.5 0 0 1-11.593 4.596L3.5 11.19a4.5 4.5 0 0 1 6.364-6.364l6.05 6.05a3.5 3.5 0 0 1-4.95 4.95L7.086 9.86"
                />
              </svg>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
