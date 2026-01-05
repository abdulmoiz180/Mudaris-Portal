import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { supabase } from "@/services/supabaseClient.js";

// --- Thunks ---
const fetchChannels = createAsyncThunk(
  "channels/fetchChannels",
  async (workspaceId, thunkAPI) => {
    const state = thunkAPI.getState();
    const cachedChannel = Object.values(state.channels.byId)
      .filter((channel) => channel.workspace_id === workspaceId)
    if (cachedChannel.length > 0) return cachedChannel;
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (error) return thunkAPI.rejectWithValue(error.message);
    return data;
  }
);


const createChannel = createAsyncThunk(
  "channels/createChannel",
  async (
    {
      channel_name,
      description,
      visibility = "public",
      channel_members,
      workspace_id,
      creator_id,
    },
    { rejectWithValue }
  ) => {
    try {
      const { data: channel, error: channelError } = await supabase
        .from("channels")
        .insert([
          {
            channel_name,
            description,
            visibility,
            workspace_id,
          },
        ])
        .select()
        .single();

      if (channelError) return rejectWithValue(channelError.message);

      // --- Add members ---
      let membersSet = new Set();
      if (visibility === "public") {
        const { data: workspaceMembers, error: workspaceError } = await supabase
          .from("workspace_members")
          .select("user_id")
          .eq("workspace_id", workspace_id);

        if (workspaceError) rejectWithValue(workspaceError);
        workspaceMembers.forEach((wm) => membersSet.add(wm.user_id));
      } else if (channel_members && channel_members.length > 0) {
        channel_members.forEach((userId) => membersSet.add(userId));
      }

      if (creator_id) {
        membersSet.add(creator_id);
      }

      const membersToInsert = Array.from(membersSet).map((userId) => ({
        channel_id: channel.id,
        user_id: userId,
      }));

      if (membersToInsert.length > 0) {
        const { error: membersError } = await supabase
          .from("channel_members")
          .insert(membersToInsert);
        if (membersError) rejectWithValue(membersError.message);
      }

      return channel;
    } catch (error) {
      rejectWithValue(error.message);
    }
  }
);

const updateChannel = createAsyncThunk(
  "channels/updateChannel",
  async ({ id, updates }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("channels")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

const deleteChannel = createAsyncThunk(
  "channels/deleteChannel",
  async (id, { rejectWithValue }) => {
    const { error } = await supabase.from("channels").delete().eq("id", id);

    if (error) return rejectWithValue(error.message);
    return id;
  }
);


// --- Initial State ---
const initialState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
  activeChannelId: null, // 👈 NEW FIELD
};

// --- Slice ---
const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    channelInserted: (state, action) => {
      const channel = action.payload;
      state.byId[channel.id] = channel;
      if (!state.allIds.includes(channel.id)) {
        state.allIds.push(channel.id);
      }
    },
    channelUpdated: (state, action) => {
      const channel = action.payload;
      if (state.byId[channel.id]) {
        state.byId[channel.id] = channel;
      }
    },
    channelDeleted: (state, action) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((cid) => cid !== id);

      // If the active channel was deleted, reset it
      if (state.activeChannelId === id) {
        state.activeChannelId = null;
      }
    },
    resetChannels: () => initialState,

    // 👇 NEW REDUCER
    setActiveChannel: (state, action) => {
      state.activeChannelId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.byId = {};
        state.allIds = [];
        action.payload.forEach((channel) => {
          state.byId[channel.id] = channel;
          state.allIds.push(channel.id);
        });
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const channel = action.payload;
        state.byId[channel.id] = channel;
        if (!state.allIds.includes(channel.id)) {
          state.allIds.push(channel.id);
        }
      })
      .addCase(updateChannel.fulfilled, (state, action) => {
        const channel = action.payload;
        if (state.byId[channel.id]) {
          state.byId[channel.id] = channel;
        }
      })
      .addCase(deleteChannel.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.byId[id];
        state.allIds = state.allIds.filter((cid) => cid !== id);

        if (state.activeChannelId === id) {
          state.activeChannelId = null;
        }
      });
  },
});

// --- Actions ---
export const {
  channelInserted,
  channelUpdated,
  channelDeleted,
  resetChannels,
  setActiveChannel, // 👈 NEW ACTION
} = channelsSlice.actions;

// --- Selectors ---
export const selectChannels = createSelector(
  (state) => state.channels.allIds,
  (state) => state.channels.byId,
  (allIds, byId) => allIds.map((id) => byId[id])
);

export const selectActiveChannelId = (state) => state.channels.activeChannelId;

export const selectActiveChannel = createSelector(
  [selectActiveChannelId, (state) => state.channels.byId],
  (activeChannelId, byId) =>
    activeChannelId ? byId[activeChannelId] || null : null
);

// --- Exports ---
export { fetchChannels, createChannel, updateChannel, deleteChannel };

export default channelsSlice.reducer;
