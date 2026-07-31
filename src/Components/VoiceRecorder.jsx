import React from "react";

function VoiceRecorder({ isRecording, startRecording, stopRecording }) {
  return (
    <button
      className={`voice-button ${isRecording ? "recording" : ""}`}
      onClick={isRecording ? stopRecording : startRecording}
    >
      {isRecording ? "Stop Recording" : "Start Recording"}
    </button>
  );
}

export default VoiceRecorder;