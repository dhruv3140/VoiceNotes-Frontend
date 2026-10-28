import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE_URL.replace(/\/+$/, "")}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getNotes = async () => {
  const res = await axios.get(`${API_URL}/notes`, {
    headers: getAuthHeaders(),
  });

  window.dispatchEvent(new CustomEvent("voxnote:notes-meta", { detail: { truncated: Boolean(res.data.truncated) } }));
  return res.data.notes || [];
};

export const createTextNote = async (text, folderId, folderName) => {
  const res = await axios.post(
    `${API_URL}/notes/text`,
    {
      text,
      folder_id: folderId,
      folder_name: folderName,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data;
};

export const deleteNoteById = async (id) => {
  const res = await axios.delete(`${API_URL}/notes/${id}`, {
    headers: getAuthHeaders(),
  });

  return res.data;
};

export const updateNoteById = async (id, text, folderId, folderName) => {
  const res = await axios.put(
    `${API_URL}/notes/${id}`,
    {
      text,
      folder_id: folderId,
      folder_name: folderName,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data;
};

export const semanticSearchNotes = async (query) => {
  const res = await axios.post(
    `${API_URL}/notes/search`,
    { query },
    {
      headers: getAuthHeaders(),
    }
  );

  window.dispatchEvent(new CustomEvent("voxnote:search-mode", { detail: { mode: res.data.search_mode || "keyword" } }));
  return res.data.results || [];
};

export const createAudioNote = async (audioBlob) => {
  const formData = new FormData();
  const extension = audioBlob.type.includes("mp4") ? "m4a" : audioBlob.type.includes("ogg") ? "ogg" : "webm";
  formData.append("file", audioBlob, `note.${extension}`);

  const res = await axios.post(`${API_URL}/notes/audio`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};