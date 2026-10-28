import { useEffect, useState } from "react";
import {
  getNotes,
  createTextNote,
  deleteNoteById,
  updateNoteById,
  semanticSearchNotes,
} from "../api/notesapi";
import { createNotesPdf } from "../utils/notesPdf";
import { Capacitor } from "@capacitor/core";
import {
  Directory,
  Encoding,
  Filesystem,
} from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

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
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [selectedtag, setSelectedTag] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [allNotes, setAllNotes] = useState([]);

  const startLoading = (message) => {
    setLoading(true);
    setLoadingMessage(message);
    setError(null);
    setSuccessMessage("");
  };

  const stopLoading = () => {
    setLoading(false);
    setLoadingMessage("");
  };

  const applyFolderFilter = (data, folder) => {
    if (!folder) {
      setNotes(data);
      return;
    }

    const filtered = data.filter(
      (note) =>
        Number(note.metadata?.folder_id) === Number(folder.id)
    );

    setNotes(filtered);
  };

  const fetchNotes = async () => {
    try {
      startLoading("Fetching notes...");
      const data = await getNotes();

      setAllNotes(data);
      setSelectedTag("");
      applyFolderFilter(data, selectedFolder);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch notes.");
    } finally {
      stopLoading();
    }
  };

  const filterByTag = (tag) => {
    setSelectedTag(tag);

    const filtered = allNotes.filter((note) => {
      const tags = note.metadata?.tags || [];
      return tags.includes(tag);
    });

    setNotes(filtered);
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

    const confirmDelete = window.confirm(
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

  const filterNotesByFolder = (folder) => {
    setSelectedTag("");
    setSelectedFolder(folder);
    applyFolderFilter(allNotes, folder);
  };

  const getNotesToExport = () => {
    return selectedNoteIds.length > 0
      ? notes.filter((note) => selectedNoteIds.includes(note.id))
      : notes;
  };

  const exportNotesAsTxt = async () => {
    const notesToExport = getNotesToExport();

    if (!notesToExport.length) {
      alert("No notes to export");
      return;
    }

    const content = notesToExport
      .map((note, index) => {
        const transcript = note.metadata?.transcript || "";
        const tags = note.metadata?.tags?.join(", ") || "No tags";
        const folder = note.metadata?.folder_name || "General";
        const createdAt = note.metadata?.created_at
          ? new Date(note.metadata.created_at).toLocaleString()
          : "Old note";

        return `Note ${index + 1}
Folder: ${folder}
Created At: ${createdAt}
Tags: ${tags}

${transcript}

------------------------------
`;
      })
      .join("\n");

    try {
      const filename = "voicenotes-export.txt";

      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        const file = await Filesystem.getUri({
          path: filename,
          directory: Directory.Cache,
        });

        await Share.share({
          title: "Export notes as TXT",
          files: [file.uri],
          dialogTitle: "Save or share your notes",
        });
      } else {
        const blob = new Blob([content], {
          type: "text/plain;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("TXT export failed:", err);
      alert(`TXT export failed: ${err.message}`);
    }
  };

  const exportNotesAsPdf = async () => {
    const notesToExport = getNotesToExport();

    if (!notesToExport.length) {
      alert("No notes to export");
      return;
    }

    try {
      const pdf = await createNotesPdf(notesToExport);

      const filename = "voicenotes-export.pdf";

      if (Capacitor.isNativePlatform()) {
        const base64 = pdf.output("datauristring").split(",")[1];

        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache,
        });

        const file = await Filesystem.getUri({
          path: filename,
          directory: Directory.Cache,
        });

        await Share.share({
          title: "Export notes as PDF",
          files: [file.uri],
          dialogTitle: "Save or share your PDF",
        });
      } else {
        pdf.save(filename);
      }
    } catch (err) {
      console.error("PDF export failed:", err);
      alert(`PDF export failed: ${err.message}`);
    }
  };

  const saveNote = async () => {
    if (!text.trim()) {
      alert("Please type something");
      return;
    }

    try {
      startLoading("Saving note...");

      await createTextNote(
        text.trim(),
        selectedFolder?.id || 0,
        selectedFolder?.name || "General"
      );

      setText("");
      await fetchNotes();
      setSuccessMessage("Note saved. You can find it in Saved notes.");
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
    } finally {
      stopLoading();
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      startLoading("Deleting note...");
      await deleteNoteById(id);

      setSelectedNoteIds((prev) =>
        prev.filter((noteId) => noteId !== id)
      );

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

  const clearSelection = () => {
    setSelectedNoteIds([]);
  };

  const sortNotes = (type) => {
    setSortType(type);

    const sorted = [...notes].sort((a, b) => {
      const textA = a.metadata?.transcript || "";
      const textB = b.metadata?.transcript || "";

      const dateA = new Date(a.metadata?.created_at || 0);
      const dateB = new Date(b.metadata?.created_at || 0);

      if (type === "newest") return dateB - dateA;
      if (type === "oldest") return dateA - dateB;
      if (type === "az") return textA.localeCompare(textB);
      if (type === "za") return textB.localeCompare(textA);

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
        const data = await getNotes();

        const filteredNotes = data.filter((note) =>
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

  useEffect(() => {
    // Start the initial network read without synchronously setting state in this effect.
    const timer = setTimeout(fetchNotes, 0);
    return () => clearTimeout(timer);
    // Initial fetch only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    successMessage,
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