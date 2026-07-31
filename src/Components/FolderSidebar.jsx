import { useState } from "react";
import { createFolder, getFolders, deleteFolder, renameFolder } from "../api/authApi";

function FolderSidebar({ selectedFolder, setSelectedFolder, folders, loadFolders, fetchNotes, filterNotesByFolder, allNotes }) {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
const [editingFolderName, setEditingFolderName] = useState("");


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
  const handleRenameFolder = async (id) => {
  if (!editingFolderName.trim()) return;

  try {
    await renameFolder(id, editingFolderName);

    if (selectedFolder?.id === id) {
      setSelectedFolder({
        ...selectedFolder,
        name: editingFolderName,
      });
    }

    setEditingFolderId(null);
    setEditingFolderName("");
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
        All Notes
      </button>

      <div className="folder-create">
        <input
          type="text"
          placeholder="New folder"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <button onClick={handleCreateFolder}>+</button>
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
        📁 {folder.name} <span className="folder-count">{count}</span>
      </button>

      <button
        className="folder-delete"
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