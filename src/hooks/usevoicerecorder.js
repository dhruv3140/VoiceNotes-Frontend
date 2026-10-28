import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { createAudioNote } from '../api/notesapi';

// Audio recovery is memory-only. It is never silently persisted to disk.
function useVoiceRecorder({ fetchNotes, startLoading, stopLoading, setError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [pendingAudio, setPendingAudio] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioStatus, setAudioStatus] = useState('');
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const uploadRef = useRef(false);
  const startingRef = useRef(false);
  const uncertainRef = useRef(false);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording && !pendingAudio && !isUploading) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isRecording, pendingAudio, isUploading]);

  useEffect(() => () => {
    if (recorderRef.current) recorderRef.current.onstop = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const uploadAudio = async blob => {
    if (uploadRef.current) return;
    uploadRef.current = true;
    setIsUploading(true);
    setAudioStatus('Uploading and transcribing. Keep this screen open.');
    startLoading('Transcribing and saving voice note...');
    try {
      await createAudioNote(blob);
      setPendingAudio(null);
      uncertainRef.current = false;
      await fetchNotes();
      setAudioStatus('Voice note saved. Find the transcript in Saved notes.');
    } catch (error) {
      // A lost response can mean the server saved the note already. Never auto-retry.
      uncertainRef.current = !error.response;
      setPendingAudio(blob);
      setAudioStatus('Upload failed. Your audio is still held on this screen.');
      setError(uncertainRef.current
        ? 'The server response was not received. Check Saved notes before retrying to avoid a duplicate. Download the audio before leaving this screen.'
        : 'The upload was not completed. Retry or download your audio before leaving this screen.');
    } finally {
      uploadRef.current = false;
      setIsUploading(false);
      stopLoading();
    }
  };

  const startRecording = async () => {
    if (startingRef.current || isRecording || uploadRef.current || pendingAudio) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Audio recording is not supported here. Try a current browser or write a text note.');
      return;
    }
    startingRef.current = true;
    try {
      startLoading('Accessing microphone...');
      setAudioStatus('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (!blob.size) { setError('No audio was captured. Please try again.'); return; }
        setPendingAudio(blob);
        void uploadAudio(blob);
      };
      recorder.onerror = () => {
        setError('Recording was interrupted. Stop to keep any audio captured so far.');
      };
      setElapsed(0);
      recorder.start();
      setIsRecording(true);
    } catch {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setError('Could not access the microphone. Allow microphone permission, or write a text note.');
    } finally {
      startingRef.current = false;
      stopLoading();
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') { recorder.stop(); setIsRecording(false); }
  };

  const retryAudio = () => {
    if (!pendingAudio || uploadRef.current) return;
    if (uncertainRef.current && !window.confirm('The previous request may have reached the server. Check Saved notes first. Retry anyway? This could create a duplicate.')) return;
    void uploadAudio(pendingAudio);
  };

  const downloadAudio = async () => {
    if (!pendingAudio) return;
    const filename = `voxnote-recovery.${pendingAudio.type.includes('mp4') ? 'm4a' : pendingAudio.type.includes('ogg') ? 'ogg' : 'webm'}`;
    try {
      if (Capacitor.isNativePlatform()) {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(pendingAudio);
        });
        await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
        const file = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        await Share.share({ title: 'Save your unsaved audio', files: [file.uri], dialogTitle: 'Save or share audio recovery' });
      } else {
        const url = URL.createObjectURL(pendingAudio);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      setError('Could not export the audio. It is still held on this screen. Try again before leaving.');
    }
  };

  const discardAudio = () => {
    if (uploadRef.current || !window.confirm('Discard this unsaved audio? Download it first if you want to keep it.')) return;
    setPendingAudio(null);
    setAudioStatus('Unsaved audio discarded.');
    setError(null);
  };

  return { isRecording, startRecording, stopRecording, pendingAudio, isUploading, elapsed, audioStatus, retryAudio, downloadAudio, discardAudio };
}
export default useVoiceRecorder;
