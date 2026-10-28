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
  selectAllNotes,
  filterByTag,
}) {
  if (notes.length === 0) {
    return <div className="empty-state"><span className="empty-mark">✦</span><h3>A fresh page for your thoughts.</h3><p>Write a note or record your first idea.<br />Your saved notes will live here.</p></div>;
  }

  return (
    <div className="notes-list"><div className="selection-toolbar">
      {selectedNoteIds.length > 0 && (
        <button
          onClick={deleteSelectedNotes}
          disabled={loading}
          className="danger-button"
        >
          Delete Selected ({selectedNoteIds.length})
        </button>
      )}
      <button
        onClick={selectAllNotes}
        disabled={loading || notes.length === 0}
        className="text-button"
      >
        {selectedNoteIds.length === notes.length ? "Deselect All" : "Select All"}
      </button>

      </div>{notes.map((note) => (
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