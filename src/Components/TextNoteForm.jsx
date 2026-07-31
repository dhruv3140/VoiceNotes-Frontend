import React from "react";
function TextNoteForm({ text, setText, saveNote, loading, selectedFolder }) {
  return (
    <div className="card">
      <h2>Create Note</h2>

      <p className="selected-folder-text">
        Saving in: <strong>{selectedFolder?.name || "General"}</strong>
      </p>

      <textarea
        rows="6"
        placeholder="Write your note..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={saveNote} disabled={loading}>
        Save Note
      </button>
    </div>
  );
}

export default TextNoteForm;