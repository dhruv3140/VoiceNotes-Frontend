import Icon from "./Icon";
import { useState } from "react";
import { createFolder, deleteFolder } from "../api/authApi";

function FolderSidebar({ selectedFolder, setSelectedFolder, folders, loadFolders, fetchNotes, filterNotesByFolder, allNotes }) {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");
  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      await createFolder(folderName);
      setFolderName("");
      loadFolders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFolder = async (id) => {
    try {
      await deleteFolder(id);

      if (selectedFolder?.id === id) {
        setSelectedFolder(null);
        fetchNotes();
      }

      loadFolders();
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="folder-sidebar">
      <h3>Folders</h3>

      {error && <p className="error">⚠️ {error}</p>}

      <button
        className={!selectedFolder ? "folder-item active-folder" : "folder-item"}
        onClick={() => filterNotesByFolder(null)}
        >
        <Icon name="note" size={18} /> All notes
      </button>

      <div className="folder-create">
        <input
          type="text"
          placeholder="New folder"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <button onClick={handleCreateFolder} aria-label="Create folder"><Icon name="plus" size={18} /></button>
      </div>
      {folders.map((folder) => {
  const count = allNotes.filter(
    (note) => Number(note.metadata?.folder_id) === Number(folder.id)
  ).length;

  return (
    <div
      key={folder.id}
      className={
        selectedFolder?.id === folder.id
          ? "folder-row active-folder"
          : "folder-row"
      }
    >
      <button
        className="folder-name"
        onClick={() => filterNotesByFolder(folder)}
      >
        <Icon name="folder" size={17} /> {folder.name} <span className="folder-count">{count}</span>
      </button>

      <button
        className="folder-delete"
        aria-label={`Delete folder ${folder.name}`}
        onClick={() => handleDeleteFolder(folder.id)}
      >
        ×
      </button>
    </div>
  );
})}

    </div>
  );
}

export default FolderSidebar;