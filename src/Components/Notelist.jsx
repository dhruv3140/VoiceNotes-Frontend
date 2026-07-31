import React from "react";
import NoteCard from "./Notecard";

function NotesList({
  notes,
  folders,
  editingNoteId,
  setEditingNoteId,
  editingText,
  setEditingText,
  updateNote,
  deleteNote,
  loading,
  selectedNoteIds,
  toggleSelectNote,
  deleteSelectedNotes,
  clearSelection,
  selectAllNotes,
  filterByTag,
}) {
  if (notes.length === 0) {
    return <p>No notes found.</p>;
  }

  return (
    <div className="notes-list">
      {selectedNoteIds.length > 0 && (
        <button
          onClick={deleteSelectedNotes}
          disabled={loading}
          style={{
            marginBottom: "12px",
            background: "crimson",
          }}
        >
          Delete Selected ({selectedNoteIds.length})
        </button>
      )}
      <button
        onClick={selectAllNotes}
        disabled={loading || notes.length === 0}
        style={{
          marginBottom: "12px",
          marginLeft: "8px",
        }}
      >
        {selectedNoteIds.length === notes.length ? "Deselect All" : "Select All"}
      </button>

      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          editingNoteId={editingNoteId}
          setEditingNoteId={setEditingNoteId}
          editingText={editingText}
          setEditingText={setEditingText}
          updateNote={updateNote}
          deleteNote={deleteNote}
          loading={loading}
          selectedNoteIds={selectedNoteIds}
          toggleSelectNote={toggleSelectNote}
          filterByTag={filterByTag}
          folders={folders}
        />
      ))}
    </div>
  );
}

export default NotesList;