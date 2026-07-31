import { useState } from "react";
import { createAudioNote } from "../api/notesapi";

function useVoiceRecorder({ fetchNotes, startLoading, stopLoading, setError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    try {
      startLoading("Accessing microphone...");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      let chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          startLoading("Transcribing and saving voice note...");

          const audioBlob = new Blob(chunks, {
            type: "audio/webm",
          });

          await createAudioNote(audioBlob);
          await fetchNotes();
        } catch (err) {
          console.error(err);
          setError("Voice transcription failed.");
        } finally {
          stopLoading();
          stream.getTracks().forEach((track) => track.stop());
          chunks = [];
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Could not access microphone.");
    } finally {
      stopLoading();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}

export default useVoiceRecorder;