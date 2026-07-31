const API_URL = "http://127.0.0.1:8000/auth";

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
};

export const sendEmailOtp = async (name, email) => {
  const response = await fetch(`${API_URL}/email/send-otp`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send email OTP");
  }

  return data;
};


export const verifyEmailOtp = async (email, otp) => {
  const response = await fetch(`${API_URL}/email/verify-otp`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Email OTP verification failed");
  }

  return data;
};


export const sendMobileOtp = async (name, mobile) => {
  const response = await fetch(`${API_URL}/mobile/send-otp`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, mobile }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send OTP");
  }

  return data;
};

export const verifyMobileOtp = async (mobile, otp) => {
  const response = await fetch(`${API_URL}/mobile/verify-otp`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ mobile, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "OTP verification failed");
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send reset OTP");
  }

  return data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Password reset failed");
  }

  return data;
};

export const googleLogin = async (token) => {
  const response = await fetch(`${API_URL}/google`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({token}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Google login failed");
  }

  return data;
};

export const createFolder = async (name) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create folder");
  }

  return data;
};

export const getFolders = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/folders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch folders");
  }

  return data.folders || [];
};

export const deleteFolder = async (folderId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/folders/${folderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to delete folder");
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const renameFolder = async (folderId, name) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/folders/${folderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to rename folder");
  }

  return data;
};

export const loginWithPassword = async (identifier, password) => {
  const response = await fetch(`${API_URL}/login/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Password login failed");
  }

  return data;
};


export const sendLoginOtp = async (identifier) => {
  const response = await fetch(`${API_URL}/login/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send OTP");
  }

  return data;
};


export const verifyLoginOtp = async (identifier, otp) => {
  const response = await fetch(`${API_URL}/login/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "OTP verification failed");
  }

  return data;
};
