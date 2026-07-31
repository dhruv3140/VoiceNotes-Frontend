import { useEffect, useState } from "react";
import {
  getNotes,
  createTextNote,
  deleteNoteById,
  updateNoteById,
  semanticSearchNotes,
} from "../api/notesApi";
import jspdf from "jspdf"

function useNotes() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("newest");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);

  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [selectedtag, setSelectedTag] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [allNotes, setAllNotes] = useState([]);

  const filterByTag = (tag) => {
  setSelectedTag(tag);

  const filtered = notes.filter((note) => {
    const tags = note.metadata?.tags || [];
    return tags.includes(tag);
  });

  setNotes(filtered);
};

  const startLoading = (message) => {
    setLoading(true);
    setLoadingMessage(message);
    setError(null);
  };

  const stopLoading = () => {
    setLoading(false);
    setLoadingMessage("");
  };

  const toggleSelectNote = (id) => {
  setSelectedNoteIds((prev) => {
    if (prev.includes(id)) {
      return prev.filter((noteId) => noteId !== id);
    }

    return [...prev, id];
  });
};

  const deleteSelectedNotes = async () => {
  if (selectedNoteIds.length === 0) return;

  const confirmDelete = confirm(
    `Are you sure you want to delete ${selectedNoteIds.length} notes?`
  );

  if (!confirmDelete) return;

  try {
    startLoading("Deleting selected notes...");

    for (const id of selectedNoteIds) {
      await deleteNoteById(id);
    }

    setSelectedNoteIds([]);
    await fetchNotes();
  } catch (err) {
    console.error(err);
    setError("Failed to delete selected notes.");
  } finally {
    stopLoading();
  }
};

const getNotesToExport = () => {
  return selectedNoteIds.length > 0
    ? notes.filter((note) => selectedNoteIds.includes(note.id))
    : notes;
};

const exportNotesAsTxt = () => {
  const notesToExport = getNotesToExport();

  if (notesToExport.length === 0) {
    alert("No notes to export");
    return;
  }

  const content = notesToExport
    .map((note, index) => {
      const text = note.metadata?.transcript || "";
      const tags = note.metadata?.tags?.join(", ") || "No tags";
      const folder = note.metadata?.folder_name || "General";
      const createdAt = note.metadata?.created_at
        ? new Date(note.metadata.created_at).toLocaleString()
        : "Old note";

      return `Note ${index + 1}
Folder: ${folder}
Created At: ${createdAt}
Tags: ${tags}

${text}

------------------------------
`;
    })
    .join("\n");

  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "smart-notes-export.txt";
  link.click();

  URL.revokeObjectURL(url);
};

const exportNotesAsPdf = () => {
  const notesToExport = getNotesToExport();

  if (notesToExport.length === 0) {
    alert("No notes to export");
    return;
  }

  const pdf = new jspdf();

  let y = 20;
  const margin = 14;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFontSize(18);
  pdf.text("Smart Notes Export", margin, y);
  y += 15;

  notesToExport.forEach((note, index) => {
    const text = note.metadata?.transcript || "";
    const tags = note.metadata?.tags?.join(", ") || "No tags";
    const folder = note.metadata?.folder_name || "General";
    const createdAt = note.metadata?.created_at
      ? new Date(note.metadata.created_at).toLocaleString()
      : "Old note";

    const noteContent = `Note ${index + 1}
Folder: ${folder}
Created At: ${createdAt}
Tags: ${tags}

${text}
`;

    const lines = pdf.splitTextToSize(noteContent, pageWidth - margin * 2);

    lines.forEach((line) => {
      if (y > pageHeight - 15) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(11);
      pdf.text(line, margin, y);
      y += 7;
    });

    y += 8;
  });

  pdf.save("smart-notes-export.pdf");
};

  const fetchNotes = async () => {
  try {
    startLoading("Fetching notes...");
    const data = await getNotes();

    setAllNotes(data);
    applyFolderFilter(data, selectedFolder);
  } catch (err) {
    console.error(err);
    setError("Failed to fetch notes.");
  } finally {
    stopLoading();
  }
};

  const filterNotesByFolder = (folder) => {
  setSelectedFolder(folder);
  applyFolderFilter(allNotes, folder);

  if (!folder) {
    setNotes(allNotes);
    return;
  }

  const filtered = allNotes.filter(
    (note) => note.metadata?.folder_id === folder.id
  );

  setNotes(filtered);
};

  const saveNote = async () => {
    if (!text.trim()) {
      alert("Please type something");
      return;
    }

    try {
      startLoading("Saving note...");
      await createTextNote(text.trim(), selectedFolder?.id || 0, selectedFolder?.name || "General");
      setText("");
      await fetchNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
    } finally {
      stopLoading();
    }
  };

  const deleteNote = async (id) => {
    try {
      startLoading("Deleting note...");
      await deleteNoteById(id);
       setSelectedNoteIds((prev) => prev.filter((noteId) => noteId !== id));
      await fetchNotes();
    } catch (err) {
      console.error(err);
      setError("Failed to delete note.");
    } finally {
      stopLoading();
    }
  };

  const selectAllNotes = () => {
  if (selectedNoteIds.length === notes.length) {
    setSelectedNoteIds([]);
  } else {
    setSelectedNoteIds(notes.map((note) => note.id));
  }
};

const clearSelection = () => {  setSelectedNoteIds([]);
};

const sortNotes = (type) => {
  setSortType(type);

  const sorted = [...notes].sort((a, b) => {
    const textA = a.metadata?.transcript || "";
    const textB = b.metadata?.transcript || "";

    const dateA = new Date(a.metadata?.created_at || 0);
    const dateB = new Date(b.metadata?.created_at || 0);

    if (type === "newest") {
      return dateB - dateA;
    }

    if (type === "oldest") {
      return dateA - dateB;
    }

    if (type === "az") {
      return textA.localeCompare(textB);
    }

    if (type === "za") {
      return textB.localeCompare(textA);
    }

    return 0;
  });

  setNotes(sorted);
};

const updateNote = async (
  id,
  customText = null,
  folderId = null,
  folderName = null
) => {
  const finalText = customText ?? editingText.trim();

  if (!finalText.trim()) {
    alert("Please type something");
    return;
  }

  try {
    startLoading("Updating note...");

    const currentNote = notes.find((note) => note.id === id);

    await updateNoteById(
      id,
      finalText.trim(),
      folderId ?? currentNote?.metadata?.folder_id ?? 0,
      folderName ?? currentNote?.metadata?.folder_name ?? "General"
    );

    setEditingNoteId(null);
    setEditingText("");

    await fetchNotes();
  } catch (err) {
    console.error(err);
    setError("Failed to update note.");
  } finally {
    stopLoading();
  }
};

  const handleSearch = async (query) => {
    try {
      startLoading("Searching notes...");

      if (!query.trim()) {
        await fetchNotes();
        return;
      }

      if (query.startsWith("#")) {
        const tag = query.replace("#", "").toLowerCase().trim();
        const allNotes = await getNotes();

        const filteredNotes = allNotes.filter((note) =>
          note.metadata?.tags?.some((t) =>
            t.toLowerCase().includes(tag)
          )
        );

        setNotes(filteredNotes);
        return;
      }

      const results = await semanticSearchNotes(query.trim());
      setNotes(results);
    } catch (err) {
      console.error(err);
      setError("Search failed.");
    } finally {
      stopLoading();
    }
  };

  const clearSearch = async () => {
    setSearchQuery("");
    await fetchNotes();
  };


  const applyFolderFilter = (data, folder) => {
  if (!folder) {
    setNotes(data);
    return;
  }

  const filtered = data.filter(
    (note) => Number(note.metadata?.folder_id) === Number(folder.id)
  );

  setNotes(filtered);
};

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    text,
    setText,
    searchQuery,
    setSearchQuery,

    editingNoteId,
    setEditingNoteId,
    editingText,
    setEditingText,
    selectedtag,
    setSelectedTag,
    filterByTag,
    allNotes,
    filterNotesByFolder,


    loading,
    loadingMessage,
    error,
    setError,
    startLoading,
    stopLoading,

    selectedNoteIds,
    toggleSelectNote,
    deleteSelectedNotes,
    selectedFolder,
    setSelectedFolder,
    sortType,
    sortNotes,
    exportNotesAsTxt,
    exportNotesAsPdf,

    fetchNotes,
    saveNote,
    deleteNote,
    updateNote,
    handleSearch,
    clearSearch,
    clearSelection,
    selectAllNotes,
  };
}

export default useNotes;