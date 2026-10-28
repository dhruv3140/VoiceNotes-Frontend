import Icon from "./Icon";
import useNotes from "../hooks/usenotes";
import useVoiceRecorder from "../hooks/usevoicerecorder";

import TextNoteForm from "./TextNoteForm";
import SearchBar from "./SearchBar";
import VoiceRecorder from "./VoiceRecorder";
import NotesList from "./Notelist";
import FolderSidebar from "./FolderSidebar";
import { getFolders } from "../api/authApi";
import { useEffect, useState } from "react";

function Dashboard({ user, handleLogout }) {
  const notesData = useNotes();

  const {
    notes,
    text,
    sortType,
    sortNotes,
    exportNotesAsTxt,
    exportNotesAsPdf,
    setText,
    searchQuery,
    setSearchQuery,
    selectedtag,
    filterByTag,
    selectedFolder,
    setSelectedFolder,
    filterNotesByFolder,
    allNotes,

    editingNoteId,
    setEditingNoteId,
    editingText,
    setEditingText,

    loading,
    loadingMessage,
    successMessage,
    error,
    setError,
    startLoading,
    stopLoading,

    fetchNotes,
    saveNote,
    deleteNote,
    updateNote,
    handleSearch,
    clearSearch,

    selectedNoteIds,
    toggleSelectNote,
    deleteSelectedNotes,
    selectAllNotes,
    clearSelectedNotes,
  } = notesData;

  const { isRecording, startRecording, stopRecording, pendingAudio, isUploading, elapsed, audioStatus, retryAudio, downloadAudio, discardAudio } = useVoiceRecorder({
    fetchNotes,
    startLoading,
    stopLoading,
    setError,
  });
  const guardedLogout = () => {
    if ((isRecording || pendingAudio || isUploading) && !window.confirm("You have unsaved audio. Leaving will lose it. Download or finish saving first. Leave anyway?")) return;
    handleLogout();
  };
  const [mobileView, setMobileView] = useState("capture");
  const [folders, setFolders] = useState([]);
  const [sidebarProfileOpen, setSidebarProfileOpen] = useState(false);
  const [headerProfileOpen, setHeaderProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.matchMedia("(max-width: 900px)").matches);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let active = true;
    getFolders().then(data => { if (active) setFolders(data); }).catch(console.error);
    return () => { active = false; };
  }, []);

  return (
    <div className={`app-container ${sidebarCollapsed ? "sidebar-hidden" : ""}`}>
      {!sidebarCollapsed && <button className="sidebar-scrim" aria-label="Close folders" onClick={() => setSidebarCollapsed(true)} />}
      {/* LEFT SIDEBAR */}
      <aside className={`app-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="brand-mark"><Icon name="mic" /></span>
            <h2 className="brand-name">VoxNote AI</h2>
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(true)} title="Close folders" aria-label="Close folders">
            <Icon name="close" size={18} />
          </button>
        </div>

        <FolderSidebar
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          folders={folders}
          loadFolders={loadFolders}
          fetchNotes={fetchNotes}
          filterNotesByFolder={filterNotesByFolder}
          allNotes={allNotes}
        />

        <div className="sidebar-footer">
          <button type="button" className="sidebar-user" aria-expanded={sidebarProfileOpen} aria-label="Account menu" onClick={() => setSidebarProfileOpen(!sidebarProfileOpen)}>
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : "U"}</div>
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Free Plan</p>
            </div>
            <span className="user-menu-dots">⋮</span>
          </button>

          {sidebarProfileOpen && (
            <div className="user-popover sidebar-user-popover">
              <div className="popover-header">
                {user?.auth_provider?.includes("mobile") ? (
                  <>
                    <p className="popover-name">
                      <strong>Name:</strong> {user?.name || "No name"}
                    </p>
                    <p className="popover-mobile">
                      <strong>Mobile:</strong> {user?.mobile || "No mobile number"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="popover-name">
                      <strong>Name:</strong> {user?.name || "No name"}
                    </p>
                    <p className="popover-email">
                      <strong>Email:</strong> {user?.email || "No email"}
                    </p>
                  </>
                )}
              </div>
              <button onClick={guardedLogout} className="logout-popover-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="app-main">
        {/* HEADER NAVBAR */}
        <header className="app-header">
          <div className="header-breadcrumbs">
            {sidebarCollapsed && (
              <button className="sidebar-expand-btn" onClick={() => setSidebarCollapsed(false)} title="Open folders" aria-label="Open folders" aria-expanded={!sidebarCollapsed}>
                <Icon name="menu" />
              </button>
            )}
            <span className="breadcrumb-parent">Notes</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">
              {selectedFolder ? selectedFolder.name : selectedtag ? `#${selectedtag}` : "All Notes"}
            </span>
          </div>

          <div className="header-actions">
            <div className="header-user-menu-wrapper" style={{ position: "relative" }}>
              <button type="button" className="header-user-menu" aria-expanded={headerProfileOpen} aria-label="Account menu" onClick={() => setHeaderProfileOpen(!headerProfileOpen)}>
                <span className="header-user-name">{user?.name}</span>
                <div className="user-avatar header-avatar">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
              </button>

              {headerProfileOpen && (
                <div className="user-popover header-user-popover">
                  <div className="popover-header">
                    {user?.auth_provider?.includes("mobile") ? (
                      <>
                        <p className="popover-name"><strong>Name:</strong> {user?.name || "No name"}</p>
                        <p className="popover-mobile"><strong>Mobile:</strong> {user?.mobile || "No mobile number"}</p>
                      </>
                    ) : (
                      <>
                        <p className="popover-name"><strong>Name:</strong> {user?.name || "No name"}</p>
                        <p className="popover-email"><strong>Email:</strong> {user?.email || "No email"}</p>
                      </>
                    )}
                  </div>
                  <button onClick={guardedLogout} className="logout-popover-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="app-content">
          {successMessage && <p className="success-message" role="status">{successMessage}</p>}
          {loading && <p className="loading" role="status">{loadingMessage}</p>}
          {error && <p className="error" role="alert">{error}</p>}

          <section className="workspace-intro"><div><p className="eyebrow">YOUR PERSONAL THOUGHT SPACE</p><h1><span className="mobile-greeting">Your thought space</span><span className="desktop-greeting">{selectedFolder?.name || (selectedtag ? `#${selectedtag}` : 'Every thought, in one place.')}</span></h1><p>Make room for your next good idea.</p></div><span className="workspace-label"><span /> VoxNote workspace</span></section>
          {/* STATS GRID */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Icon name="note" /></div>
              <div>
                <h3>{notes.length}</h3>
                <p>Total Notes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icon name="tag" /></div>
              <div>
                <h3>
                  {
                    new Set(
                      notes.flatMap((note) => note.metadata?.tags || [])
                    ).size
                  }
                </h3>
                <p>Total Tags</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><Icon name="folder" /></div>
              <div>
                <h3>{folders.length}</h3>
                <p>Folders</p>
              </div>
            </div>
          </div>

          <nav className="mobile-workspace-tabs" aria-label="Workspace view"><button aria-pressed={mobileView === 'capture'} className={mobileView === 'capture' ? 'active' : ''} onClick={() => setMobileView('capture')}>Capture a thought</button><button aria-pressed={mobileView === 'notes'} className={mobileView === 'notes' ? 'active' : ''} onClick={() => setMobileView('notes')}>Saved notes <span>{notes.length}</span></button></nav>
          <div className={`dashboard mobile-view-${mobileView}`}>
            {/* LEFT WORKSPACE PANEL */}
            <div className="left-panel">
              <TextNoteForm
                text={text}
                setText={setText}
                saveNote={saveNote}
                loading={loading}
                selectedFolder={selectedFolder}
              />

              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                clearSearch={clearSearch}
                fetchNotes={fetchNotes}
                loading={loading}
              />

              {(selectedFolder || selectedtag) && (
                <button onClick={fetchNotes} className="clear-filter-btn">
                  Show All Notes
                </button>
              )}
            </div>

            {/* RIGHT WORKSPACE PANEL */}
            <div className="right-panel"><div className="mobile-search-slot"><SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} clearSearch={clearSearch} fetchNotes={fetchNotes} loading={loading} /></div>
              <div className="right-panel-header">
                <div><p className="eyebrow">YOUR COLLECTION</p><h2>Saved notes <span className="note-total">{notes.length}</span></h2></div>

                <div className="actions-row">
                  <div className="sort-box">
                    <label>Sort: </label>
                    <select aria-label="Sort saved notes" value={sortType} onChange={(e) => sortNotes(e.target.value)}>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="az">A-Z</option>
                      <option value="za">Z-A</option>
                    </select>
                  </div>

                  <div className="export-actions">
                    <button
                      onClick={exportNotesAsTxt}
                      className="export-btn"
                      disabled={notes.length === 0}
                    >
                      Export TXT
                    </button>

                    <button
                      onClick={exportNotesAsPdf}
                      className="export-btn pdf-export-btn"
                      disabled={notes.length === 0}
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>

              <NotesList
                notes={notes}
                editingNoteId={editingNoteId}
                setEditingNoteId={setEditingNoteId}
                editingText={editingText}
                setEditingText={setEditingText}
                updateNote={updateNote}
                deleteNote={deleteNote}
                loading={loading}
                selectedNoteIds={selectedNoteIds}
                toggleSelectNote={toggleSelectNote}
                deleteSelectedNotes={deleteSelectedNotes}
                selectAllNotes={selectAllNotes}
                clearSelectedNotes={clearSelectedNotes}
                filterByTag={filterByTag}
                folders={folders}
              />
            </div>
          </div>
        </div>
      <VoiceRecorder
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        pendingAudio={pendingAudio}
        isUploading={isUploading}
        elapsed={elapsed}
        audioStatus={audioStatus}
        retryAudio={retryAudio}
        downloadAudio={downloadAudio}
        discardAudio={discardAudio}
        disabled={loading && !isRecording}
      />
      </main>
    </div>
  );
}

export default Dashboard;
