import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import propertyReducer from "./propertySlice.js"

const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer, // Add the property slice to the store
  },
});

export default store;
