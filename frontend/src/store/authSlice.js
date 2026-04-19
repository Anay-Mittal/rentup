import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: !!localStorage.getItem("token"),
    userId: localStorage.getItem("userId"),
    token: localStorage.getItem("token"), // Add token to initial state
    isAdmin: localStorage.getItem("isAdmin") ? JSON.parse(localStorage.getItem("isAdmin")) : false,
  },
  reducers: {
    login: (state, action) => {
      const { token, userId, isAdmin } = action.payload;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
      state.isLoggedIn = true;
      state.userId = userId;
      state.token = token; // Set token in Redux state
      state.isAdmin = isAdmin;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("isAdmin");
      state.isLoggedIn = false;
      state.userId = null;
      state.token = null; // Clear token from Redux state
      state.isAdmin = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
