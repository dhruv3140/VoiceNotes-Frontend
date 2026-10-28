import Icon from './Icon';
function VoiceRecorder({isRecording,startRecording,stopRecording,disabled,pendingAudio,isUploading,elapsed,audioStatus,retryAudio,downloadAudio,discardAudio}) {
 const time = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2,'0')}`;
 return <div className={`capture-dock ${pendingAudio && !isUploading ? 'has-recovery' : ''}`}>
  {pendingAudio && !isUploading ? <div className="audio-recovery"><p role="status">Audio kept on this screen. It will be lost if you close the app.</p><div><button onClick={retryAudio}>Retry upload</button><button className="text-button" onClick={downloadAudio}>Download audio</button><button className="text-button" onClick={discardAudio}>Discard</button></div></div> : <>
   <span className="capture-hint">{isRecording ? 'Listening. Your idea is worth keeping.' : 'A thought worth keeping?'}</span>
   <button className={`voice-button ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording} disabled={disabled || isUploading} aria-pressed={isRecording}>{isRecording ? <span className="stop-icon"/> : <Icon name="mic"/>}{isUploading ? 'Saving voice note...' : isRecording ? `Stop & save · ${time}` : 'Record a thought'}<span className="record-indicator"/></button>
  </>}
  {audioStatus && <span className="audio-status" role="status">{audioStatus}</span>}
 </div>;
}
export default VoiceRecorder;
