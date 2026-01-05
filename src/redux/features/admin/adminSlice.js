import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/services/supabaseClient.js";

// Async thunk only fetches if needed
export const fetchAdmins = createAsyncThunk(
    "admins/fetchAdmins",
    async (_, thunkAPI) => {
        const state = thunkAPI.getState();
        const cached = state.admins.list;
        if (cached.length > 0) {
            return cached;
        }
        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url,email")
            .eq("role", "admin");

        if (error) throw error;
        return data;
    }
);

const adminSlice = createSlice({
    name: "admins",
    initialState: {
        list: [],
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchAdmins.pending, state => {
                state.status = "loading";
            })
            .addCase(fetchAdmins.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.list = action.payload;
            })
            .addCase(fetchAdmins.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    }
});

export default adminSlice.reducer;
