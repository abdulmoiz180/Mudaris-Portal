import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/services/supabaseClient";

// --- Fetch notifications (paginated) with unread count
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async ({ userId, workspaceId, page = 0, pageSize = 20 }) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    let queryBuilder = supabase
      .from("notifications")
      .select(
        `
        id,
        description,
        created_at,
        type,
        "workspaceId",
        "channelId",
        "userId",
        token,
         workspaces:workspaceId(workspace_name),
         profiles:userId (
               id,
               full_name,
               avatar_url,
               email
         )
        `)
      .or(`workspaceId.eq.${workspaceId},userId.eq.${userId}`)
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return { data, page };
  }
);
// selectors.js
export const selectUnreadNotifications = (state, lastSeen) => {
  if (!lastSeen) return state.notifications.items;

  const lastSeenMs = new Date(lastSeen).getTime();

  return state.notifications.items.filter(
    (n) => new Date(n.created_at).getTime() > lastSeenMs
  );
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    page: 0,
    pageSize: 20,
    hasMore: true,
    loading: false,
  },
  reducers: {
    prependNotification: (state, action) => {
      state.items.unshift(action.payload);
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
    },
    resetNotifications: (state) => {
      state.items = [];
      state.page = 0;
      state.hasMore = true;
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page, unread } = action.payload;

        if (page === 0) {
          state.items = data;
          state.unreadCount = unread;
        } else {
          // Prevent duplicates on pagination
          const newItems = data.filter(
            (n) => !state.items.some((existing) => existing.id === n.id)
          );
          state.items.push(...newItems);
        }

        state.hasMore = data.length === state.pageSize;
        state.page = page;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { prependNotification, markAllAsRead, resetNotifications } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
