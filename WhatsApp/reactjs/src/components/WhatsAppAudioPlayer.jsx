import { useRef, useState, useEffect } from "react";
import { Play, Pause, X } from "lucide-react";

const WhatsAppAudioPlayer = ({ audioBlob, onRemove }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  // --- Toggle play/pause ---
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
  };

  // --- Cycle playback speed ---
  const handleSpeedChange = () => {
    const newSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  // --- Format seconds to mm:ss ---
  const formatTime = (sec) => {
    if (!sec) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setDur = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setDur);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setDur);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // --- Get current time (e.g. 10:31 PM) ---
  const getClockTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="relative bg-[#E9FDD8] rounded-2xl px-3 py-2 w-80 shadow-sm border border-green-200 flex items-center gap-3">
      {/* ▶️ / ⏸ button */}
      <button
        onClick={togglePlay}
        className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-600 transition"
      >
        {isPlaying ? (
          <Pause size={20} />
        ) : (
          <Play size={20} className="ml-[2px]" />
        )}
      </button>

      {/* Progress bar + time */}
      <div className="flex-1 flex flex-col">
        {/* Slider */}
        <div
          className="relative w-full h-1 bg-green-200 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = duration * percent;
          }}
        >
          <div
            className="absolute top-0 left-0 h-1 bg-green-600 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-green-600 rounded-full"
            style={{ left: `calc(${progress}% - 4px)` }}
          ></div>
        </div>

        {/* Time Row */}
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{getClockTime()}</span>
        </div>
      </div>

      {/* Speed toggle */}
      <button
        onClick={handleSpeedChange}
        className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full hover:bg-gray-300 min-w-[30px] text-center"
      >
        {speed}x
      </button>

      {/* Remove (X) */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full text-red-500 w-5 h-5 flex items-center justify-center hover:bg-red-50"
        >
          <X size={12} />
        </button>
      )}

      <audio ref={audioRef} src={URL.createObjectURL(audioBlob)} />
    </div>
  );
};

export default WhatsAppAudioPlayer;
