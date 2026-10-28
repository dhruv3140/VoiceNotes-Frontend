function TextNoteForm({text,setText,saveNote,loading,selectedFolder}) {
 return <section className="card composer"><p className="eyebrow">LET IT OUT</p><h2>What's on your mind?</h2><p className="selected-folder-text">A quick thought. A big idea. Anything.</p><label className="sr-only" htmlFor="new-note">Write a new note</label><textarea id="new-note" rows="6" placeholder="Start writing here..." value={text} onChange={e=>setText(e.target.value)} /><div className="composer-footer"><span>In {selectedFolder?.name || 'General'}</span><button onClick={saveNote} disabled={loading || !text.trim()}>Save note <span aria-hidden="true">↗</span></button></div></section>;
}
export default TextNoteForm;
