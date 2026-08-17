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

  return res.data.results || [];
};

export const createAudioNote = async (audioBlob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "note.webm");

  const res = await axios.post(`${API_URL}/notes/audio`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};