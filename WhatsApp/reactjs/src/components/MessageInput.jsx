import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../Store/useChatStore";
import { Image, Send, X, Mic, Square } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // Handle image upload
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

  // Remove selected image
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
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
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

  return (
    <div className="fixed bottom-3 pl-[10px] pr-[10px] flex justify-center">
      <form onSubmit={handleSendMessage}>
        <div className="relative">
          {/* Emoji icon */}
          <div className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
            😊
          </div>

          {/* Image picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
          >
            <Image size={20} />
          </div>

          {/* Send / Mic toggle */}
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
                {isRecording ? (
                  <Square className="text-red-500 animate-pulse" size={22} />
                ) : (
                  <Mic size={22} />
                )}
              </div>
            )}
          </div>

          {/* Text input */}
          <input
            onChange={(e) => setText(e.target.value)}
            type="text"
            value={text}
            className="h-[55px] pl-[95px] pr-[50px] border w-[925px] rounded-full"
            placeholder={isRecording ? "Recording..." : "Type a message"}
            disabled={isRecording}
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="absolute bottom-14 left-[100px] bg-green-400 border p-5 rounded-md">
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
                <X className="size-3" />
              </button>
            </div>
          )}

          {/* Audio preview (after recording) */}
          {audioBlob && (
            <div className="absolute bottom-20 left-[100px] bg-gray-100 border p-3 rounded-lg flex items-center gap-2">
              <audio controls src={URL.createObjectURL(audioBlob)} />
              <button
                type="button"
                onClick={() => setAudioBlob(null)}
                className="text-red-500"
              >
                <X size={16} />
              </button>
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
