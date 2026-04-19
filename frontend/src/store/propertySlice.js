import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL as BASE_URL } from "../config";

// Thunk to fetch only verified properties
export const fetchVerifiedProperties = createAsyncThunk(
  "properties/fetchVerifiedProperties",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/properties/verified`);
      return response.data;
    } catch (error) {
      console.error("Error fetching verified properties:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to fetch all properties (admin only)
export const fetchAllProperties = createAsyncThunk(
  "properties/fetchAllProperties",
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    console.log("Token for fetchAllProperties:", token); // Debugging token
    try {
      const response = await axios.get(`${BASE_URL}/api/properties/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all properties:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk to verify a property (admin only)
export const verifyProperty = createAsyncThunk(
  "properties/verifyProperty",
  async (propertyId, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.post(`${BASE_URL}/api/properties/verify/${propertyId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying property:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const propertySlice = createSlice({
  name: "properties",
  initialState: {
    properties: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch verified properties
      .addCase(fetchVerifiedProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerifiedProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchVerifiedProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all properties (admin only)
      .addCase(fetchAllProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchAllProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify property (admin only)
      .addCase(verifyProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyProperty.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProperty = action.payload;
        state.properties = state.properties.map((property) =>
          property._id === updatedProperty._id ? updatedProperty : property
        );
      })
      .addCase(verifyProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default propertySlice.reducer;
