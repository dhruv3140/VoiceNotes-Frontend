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

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    fetchNotes,
    startLoading,
    stopLoading,
    setError,
  });
  const [folders, setFolders] = useState([]);
  const [sidebarProfileOpen, setSidebarProfileOpen] = useState(false);
  const [headerProfileOpen, setHeaderProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  return (
    <div className={`app-container ${sidebarCollapsed ? "sidebar-hidden" : ""}`}>
      {/* LEFT SIDEBAR */}
      <aside className={`app-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="brand-logo">🎙️</span>
            <h2 className="brand-name">VoxNote AI</h2>
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(true)} title="Collapse Sidebar">
            ◀
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
          <div className="sidebar-user" onClick={() => setSidebarProfileOpen(!sidebarProfileOpen)}>
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : "U"}</div>
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Free Plan</p>
            </div>
            <span className="user-menu-dots">⋮</span>
          </div>

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
              <button onClick={handleLogout} className="logout-popover-btn">
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
              <button className="sidebar-expand-btn" onClick={() => setSidebarCollapsed(false)} title="Expand Sidebar">
                ☰
              </button>
            )}
            <span className="breadcrumb-parent">Notes</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">
              {selectedFolder ? `📁 ${selectedFolder.name}` : selectedtag ? `🏷️ #${selectedtag}` : "All Notes"}
            </span>
          </div>

          <div className="header-actions">
            <div className="header-user-menu-wrapper" style={{ position: "relative" }}>
              <div className="header-user-menu" onClick={() => setHeaderProfileOpen(!headerProfileOpen)}>
                <span className="header-user-name">{user?.name}</span>
                <div className="user-avatar header-avatar">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
              </div>

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
                  <button onClick={handleLogout} className="logout-popover-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="app-content">
          {loading && <p className="loading">⏳ {loadingMessage}</p>}
          {error && <p className="error">⚠️ {error}</p>}

          {/* STATS GRID */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div>
                <h3>{notes.length}</h3>
                <p>Total Notes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
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
              <div className="stat-icon">📁</div>
              <div>
                <h3>{folders.length}</h3>
                <p>Folders</p>
              </div>
            </div>
          </div>

          <div className="dashboard">
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
            <div className="right-panel">
              <div className="right-panel-header">
                <h2>Saved Notes</h2>

                <div className="actions-row">
                  <div className="sort-box">
                    <label>Sort: </label>
                    <select value={sortType} onChange={(e) => sortNotes(e.target.value)}>
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
      </main>

      <VoiceRecorder
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
    </div>
  );
}

export default Dashboard;
