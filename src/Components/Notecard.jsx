import React from "react";

function NoteCard({
  note,
  editingNoteId,
  setEditingNoteId,
  editingText,
  setEditingText,
  updateNote,
  deleteNote,
  loading,
  selectedNoteIds,
  toggleSelectNote,
  filterByTag,
  folders,
}) {
  const isEditing = editingNoteId === note.id;
  const isSelected = selectedNoteIds.includes(note.id);

  return (
    <div className="note-card">
      <div style={{ marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectNote(note.id)}
        />
        <span style={{ marginLeft: "8px" }}>Select</span>
      </div>

      {isEditing ? (
        <>
          <textarea
            rows="5"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
          />

          <div className="button-row">
            <button onClick={() => updateNote(note.id)} disabled={loading}>
              Save Changes
            </button>

            <button
              onClick={() => {
                setEditingNoteId(null);
                setEditingText("");
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="note-text">{note.metadata?.transcript}</p>


          <p className="note-date">
            Created:{" "}
            {note.metadata?.created_at
              ? new Date(note.metadata.created_at).toLocaleString()
              : "Old note"}
          </p>
          <p className="note-folder">
            📁 {note.metadata?.folder_name || "General"}
          </p>

          <p className="note-date">
            Updated:{" "}
            {note.metadata?.updated_at
              ? new Date(note.metadata.updated_at).toLocaleString()
              : "Not updated"}
          </p>

          <div className="tags">
            {note.metadata?.tags?.map((tag, index) => (
              <span
                key={index}
                className="tag"
                onClick={() => filterByTag(tag)}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="button-row">
            <button
              onClick={() => {
                setEditingNoteId(note.id);
                setEditingText(note.metadata?.transcript || "");
              }}
              disabled={loading}
            >
              Edit
            </button>

            <button onClick={() => deleteNote(note.id)} disabled={loading}>
              Delete
            </button>
          </div>
        </>
      )}
      <select
  className="folder-move-select"
  value={note.metadata?.folder_id || 0}
  onChange={(e) => {
    const folderId = Number(e.target.value);

    const folder =
      folderId === 0
        ? { id: 0, name: "General" }
        : folders.find((f) => Number(f.id) === folderId);

    updateNote(
      note.id,
      note.metadata?.transcript || "",
      folder.id,
      folder.name
    );
  }}
>
  <option value={0}>General</option>

  {folders.map((folder) => (
    <option key={folder.id} value={folder.id}>
      {folder.name}
    </option>
  ))}
</select>
    </div>
    
  );
}

export default NoteCard;