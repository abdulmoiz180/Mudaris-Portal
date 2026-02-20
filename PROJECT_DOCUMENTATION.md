# Mudaris-Portal — Complete Project Documentation

> **Purpose:** This document provides a precise, unambiguous reference of the entire Mudaris-Portal codebase. It is intended to be fed into ChatGPT (or any LLM) as project context so that the AI can assist with development, debugging, and feature implementation with full knowledge of the architecture and conventions.

---

## 1. Project Overview

**Mudaris-Portal** is a **multi-tenant academy collaboration platform** (similar to Slack for education) built for **Mudaris Academy**. It enables instructors and students to communicate via real-time messaging within organized workspaces and channels, share lecture videos (via Vimeo), post announcements, and manage educational content.

### Key Capabilities

| Feature | Description |
|---|---|
| **Multi-workspace** | Users can belong to multiple workspaces. Each workspace is a self-contained academy group. |
| **Group & Individual Chat** | Public/private channel-based messaging and 1-on-1 direct messages within a workspace. |
| **Rich-text Editor** | TipTap-based WYSIWYG editor with mentions, formatting, and file attachments. |
| **Announcements** | Paginated announcement boards per workspace (CRUD). |
| **Lecture Links** | Tracked lecture link repository per workspace (CRUD). |
| **Video & Presentations** | Chapter-based video content system with Vimeo integration and progress tracking. |
| **Invite System** | Email-based user invitation flow with CSV bulk import and private-channel assignment. |
| **Admin Panel** | User management table with role assignment (admin-only access). |
| **Notifications** | In-app notification system with pagination and unread tracking. |
| **Dark Mode** | Persistent dark/light theme toggle. |

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 19.0.0 |
| **Build Tool** | Vite | 6.3.1 |
| **Language** | JavaScript (JSX) | ES Modules |
| **Routing** | React Router DOM | 7.5.1 |
| **State Management** | Redux Toolkit + React-Redux | RTK 2.8.2 / RR 9.2.0 |
| **Backend / BaaS** | Supabase (Auth, Database, Storage, Edge Functions) | 2.50.2 |
| **CSS Framework** | Tailwind CSS 4 (via `@tailwindcss/vite` plugin) | 4.1.4 |
| **UI Components** | shadcn/ui (Radix primitives: Dialog, Dropdown, Avatar, Tooltip, Sheet, Separator, Label, Slot) | Various |
| **Rich-text Editor** | TipTap (StarterKit, Mention, Placeholder, Suggestion) | 3.x |
| **Form Handling** | Formik + Yup | Formik 2.4.6 / Yup 1.6.1 |
| **Icons** | Lucide React, Heroicons, Radix Icons | Various |
| **Video** | Vimeo API (private video fetching), React Player | — |
| **HTTP Client** | Axios (for Vimeo API only) | 1.12.2 |
| **Drawer** | Vaul | 1.1.2 |
| **Animations** | tw-animate-css | 1.4.0 |
| **Dev Tools** | Why-did-you-render, ESLint, Sass | — |

---

## 3. Project Structure

```
Mudaris-Portal/
├── index.html                 # SPA entry, mounts React on <div id="root">
├── vite.config.js             # Vite config with @alias, Tailwind plugin, HMR overlay off
├── package.json               # Dependencies & scripts (dev, build, preview, lint, email)
├── components.json            # shadcn/ui config
├── .env                       # Environment variables (Supabase URL/key, Vimeo token)
│
├── public/                    # Static assets (logo.png)
│
└── src/
    ├── main.jsx               # App entry: Redux Provider, AppInitializer, RouterProvider
    ├── appInitializer.jsx     # Theme init (dark/light), session detection on mount
    ├── wdyr.js                # Why-did-you-render setup
    │
    ├── routes/
    │   ├── router.jsx         # All route definitions (createBrowserRouter)
    │   └── privateRoute.jsx   # PrivateRoute (auth guard) + OnlyAdmin (admin@gmail.com guard)
    │
    ├── redux/
    │   ├── app/
    │   │   └── store.js       # Redux store (configureStore, 22 reducers)
    │   └── features/          # 15 feature slice directories (see §6)
    │
    ├── pages/                 # Route-level page components (see §5)
    │   ├── auth/              # login/, signup/, forgotpassword/
    │   ├── dashboard/         # Workspace selection dashboard
    │   ├── chat/              # Real-time messaging view
    │   ├── channels/          # announcements/, lecturesLink/, Videos & Presentations/
    │   ├── admin/             # Admin user management table
    │   ├── invite/            # Bulk user invitation page
    │   ├── profile/           # User profile drawer/dialog
    │   ├── apps/              # calendar/, market/
    │   ├── chatsViewer/       # Admin-only chat viewer
    │   ├── vimeoGallery/      # Vimeo video gallery
    │   ├── terms/             # Privacy policy / terms page
    │   └── errorPage/         # 404 / error boundary page
    │
    ├── components/
    │   ├── ui/                # 17 shadcn/ui primitives (button, dialog, input, sidebar, etc.)
    │   ├── Dialogs/           # ChannelsDialog, add-channel-dialog, add-workspace-dialog, invite-dialog
    │   ├── Editor/            # TipTap rich-text editor (index.jsx, TextEditor.jsx, components/, config/)
    │   ├── Drawer/            # Vaul-based user profile drawer
    │   └── toast/             # ToastContainer component
    │
    ├── layout/
    │   ├── SidebarLayout.jsx  # Sidebar + content area wrapper (SidebarProvider)
    │   ├── ThemeLayout.jsx    # Outlet wrapper with ToastContainer for all themed routes
    │   ├── sidebar/           # Sidebar menu (index.jsx + 17 sub-components)
    │   ├── topbar/            # Primary topbar with search, notifications, members, profile
    │   └── TopbarTwo/         # Secondary topbar for channel pages (name + description)
    │
    ├── hooks/
    │   ├── editor-hook/       # TipTap editor hooks (5 files)
    │   ├── infinteScroll-hook/ # Infinite scroll pagination hook (2 files)
    │   └── messages-hook/     # Message-related hook (1 file)
    │
    ├── services/
    │   ├── supabaseClient.js  # Supabase client singleton (URL + anon key from env)
    │   └── vimeo/             # Vimeo API: vimeo.js (fetchPrivateVideos), player components
    │
    ├── constants/
    │   ├── constants.js       # useIsAdmin() hook, mention colors array
    │   ├── FarsiQuote.jsx     # Farsi quote wrapper component
    │   ├── fallbackColors.js  # Fallback color palette
    │   └── terms.js           # Terms and conditions text content
    │
    ├── lib/
    │   ├── utils.js           # clsx + tailwind-merge cn() utility
    │   └── tiptap-utils.js    # 342-line TipTap utility library (shortcuts, node operations, file upload, URL sanitization)
    │
    ├── styles/
    │   ├── global.css         # Global CSS imports
    │   ├── tailwind.css       # Tailwind CSS base file with CSS custom properties (design tokens)
    │   ├── _variables.scss    # SCSS variables (11KB — extensive theme token definitions)
    │   └── _keyframe-animations.scss  # Keyframe animations
    │
    ├── utils/
    │   ├── crud/              # CRUD utility helpers (2 files)
    │   ├── invite/            # Invite utility (1 file)
    │   └── rtl/               # RTL text direction utility (1 file)
    │
    └── validation/
        └── authSchema.js      # Yup schemas: login, fullName, contact, password, channelInfo, workspaceInfo, inviteUsers
```

---

## 4. Environment Variables

All environment variables use the `VITE_` prefix (except non-client-side ones) and are loaded via `import.meta.env`:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_KEY` | Supabase anonymous (public) API key |
| `VITE_VIMEO_ACCESS_TOKEN` | Vimeo API access token for fetching private videos |
| `ACESS_TOKEN` | Access token (not VITE-prefixed, not used client-side) |
| `SECRET_KEY` | Secret key (not VITE-prefixed, not used client-side) |

---

## 5. Routing Architecture

All routes are defined in `src/routes/router.jsx` using `createBrowserRouter`. The router uses three layout wrappers:

### Layout Wrappers

1. **`ThemeLayout`** — Wraps all authenticated routes. Renders `<Outlet />` inside a full-screen section with `<ToastContainer />`.
2. **`WorkspaceLayout`** — `SidebarLayout > Topbar > Outlet`. Used for workspace chat views.
3. **`TopBarSecond`** — `SidebarLayout > TopbarTwo(name, desc) > Outlet`. Used for channel feature pages.
4. **`TopbarOnly`** — `SidebarLayout > Outlet` (no topbar). Used for the invite page.

### Route Guards

- **`PrivateRoute`** — Checks `state.auth.session`. Redirects to `/` (login) if no session. Shows "Loading…" while auth state resolves.
- **`OnlyAdmin`** — Checks if `session.user.email === "admin@gmail.com"`. Blocks all other users.

### Complete Route Table

| Path | Component | Guard | Layout |
|---|---|---|---|
| `/` | `Login` | None | None |
| `/invite/verify` | `SignUp` | None | None |
| `/forgot-password` | `ForgotPassword` | None | None |
| `/reset-password` | `ResetPassword` | None | None |
| `/privacypolicy` | `Terms` | None | None |
| `/dashboard/:adminId` | `Dashboard` | `PrivateRoute` | `ThemeLayout` |
| `/seeAllUsers` | `UsersList` | `OnlyAdmin` | `ThemeLayout` |
| `/seePersonalChats` | `HandleChatsViewer` | `OnlyAdmin` | `ThemeLayout` |
| `/seePersonalChats/:token` | `ChatGet` | `OnlyAdmin` | `ThemeLayout` |
| `/workspace/:workspace_id` | — | `PrivateRoute` | `ThemeLayout > WorkspaceLayout` |
| `→ group/:groupId` | `WorkSpaceInd` (Chat) | (inherited) | (inherited) |
| `→ individual/:token` | `WorkSpaceInd` (DM) | (inherited) | (inherited) |
| `/workspace/:workspace_id/videospresentations` | `VideosPresentations` | `PrivateRoute` | `ThemeLayout > TopBarSecond` |
| `/workspace/:workspace_id/lecturesLink` | `LecturesLink` | `PrivateRoute` | `ThemeLayout > TopBarSecond` |
| `/workspace/:workspace_id/announcements` | `Announcements` | `PrivateRoute` | `ThemeLayout > TopBarSecond` |
| `/workspace/:workspace_id/calendar` | `Calendar` | `PrivateRoute` | `ThemeLayout > TopBarSecond` |
| `/workspace/:workspace_id/market` | `Market` | `PrivateRoute` | `ThemeLayout > TopBarSecond` |
| `/workspace/:workspace_id/invite` | `InviteUsersPage` | `PrivateRoute` | `ThemeLayout > TopbarOnly` |

---

## 6. Redux State Architecture

The Redux store is configured in `src/redux/app/store.js` using `configureStore` with `serializableCheck: false` middleware.

### Store Shape

```
{
  auth,               // Session, user, token, loading, error
  signupForm,         // Multi-step signup form state (fullName, email, password, avatarUrl)
  file,               // File attachment array for editor
  notifications,      // Paginated notification items
  reply,              // Reply drawer open/close + parent message
  messages,           // Current channel/DM message list
  admins,             // Admin profiles list (cached)
  search,             // Search query string
  workSpaces,         // Workspace list + currentWorkspace
  workspaceMembers,   // Members indexed by workspaceId (byWorkspaceId)
  channels,           // Normalized channel entities (byId, allIds, activeChannelId)
  direct,             // Current direct message channel reference
  channelMembers,     // Members indexed by channelId AND userId (byChannelId, byUserId)
  pinnedMessages,     // Pinned messages for current channel/DM
  announcements,      // Announcement list per workspace
  lectureLinks,       // Lecture link list per workspace
  chapters,           // Video chapters indexed by workspaceId (chaptersByWorkspace)
  videos,             // Videos indexed by chapterId (videosByChapter)
  toast,              // Toast notification queue (array of {id, message, type, duration})
  markComplete,       // Completed video IDs for current user (completedVideos[])
}
```

### Slice Details

#### `authSlice` (`state.auth`)
- **State:** `{ session, token, loading, user, error }`
- **Thunks:**
  - `sessionDetection` — Calls `supabase.auth.getSession()` and dispatches `setSession`.
  - `signupUser({ fullName, email, password, avatarUrl })` — Signs up via `supabase.auth.signUp()` with user metadata (`fullName`, `user_role: "user"`, `avatar`).
  - `loginUser({ email, password })` — Signs in via `supabase.auth.signInWithPassword()`.
  - `logOut()` — Signs out and clears localStorage.
- **Reducers:** `logout`, `setSession`
- **Auth Listener:** In `main.jsx`, `supabase.auth.onAuthStateChange` dispatches `setSession` on every auth event.

#### `signupSlice` (`state.signupForm`)
- **State:** `{ fullName, email, password, avatarUrl }`
- **Reducers:** `updateField({ field, value })`, `resetSignupForm()`
- **Usage:** Multi-step signup form state persistence across form steps.

#### `workspaceSlice` (`state.workSpaces`)
- **State:** `{ workspaces[], currentWorkspace, loading, error }`
- **Thunks:**
  - `createWorkspace({ name, description, avatarFile, adminId })` — Uploads avatar to Supabase Storage (`media` bucket), then calls Supabase Edge Function `createWorkspace` with session bearer token.
  - `fetchAllWorkspaces()` — Selects `id, workspace_name, avatar_url, description` from `workspaces` table.
  - `fetchWorkspaceById(workspaceId)` — Fetches single workspace; skips fetch if already in `currentWorkspace`.
- **Reducers:** `setCurrentWorkspace`

#### `channelsSlice` (`state.channels`)
- **State (Normalized):** `{ byId: {}, allIds: [], loading, error, activeChannelId }`
- **Thunks:**
  - `fetchChannels(workspaceId)` — Fetches channels by `workspace_id`. Uses in-memory cache check before Supabase query.
  - `createChannel({ channel_name, description, visibility, channel_members, workspace_id, creator_id })` — Inserts channel, then adds members. For public channels: adds all workspace members. For private: adds specified `channel_members`.
  - `updateChannel({ id, updates })` — Updates channel fields.
  - `deleteChannel(id)` — Deletes channel.
- **Reducers:** `channelInserted`, `channelUpdated`, `channelDeleted`, `resetChannels`, `setActiveChannel`
- **Selectors:** `selectChannels` (denormalized list), `selectActiveChannelId`, `selectActiveChannel` — all use `createSelector` for memoization.

#### `directSlice` (`state.direct`)
- **State:** `{ directChannel, loading, error }`
- **Reducers:** `newDirect`, `setValue` — Sets the current DM partner's profile info.

#### `messageSlice` (`state.messages`)
- **State:** `{ items[] }`
- **Reducers:** `setMessages`, `addMessage`, `removeMessage`, `clearMessages`
- **Note:** Messages are fetched via Supabase real-time subscriptions in UI components, not via thunks.

#### `workspaceMembersSlice` (`state.workspaceMembers`)
- **State:** `{ byWorkspaceId: { [id]: { members[], loading, error } } }`
- **Thunks:**
  - `fetchWorkspaceMembers(workspaceId)` — Joins `workspace_members` → `user_profiles` (full_name, avatar_url, email). Caches by workspaceId.
  - `addWorkspaceMember({ userId, workspaceId, role })` — Inserts into `workspace_members`.
  - `fetchUserWorkspace(userId)` — Fetches all workspaces a user belongs to via `workspace_members` → `workspaces` join.
- **Selectors:** `selectWorkspaceMembers(id)`, `selectLoading(id)`, `selectError(id)`

#### `channelMembersSlice` (`state.channelMembers`)
- **State:** `{ byChannelId: { [id]: { data[], status } }, byUserId: { [id]: { data[], status } } }`
- **Thunks:**
  - `fetchChannelMembersByChannel(channelId)` — Cached; joins `channel_members` → `user_profiles`.
  - `fetchChannelMembersbyUser(userId)` — Cached; joins `channel_members` → `channels`.
  - `addChannelMembersonSignUp({ channelId, userId })` — Single member insertion.
  - `addChannelMembers({ channelId, userIds })` — Bulk member insertion.
- **Selectors:** `selectChannelMembers(channelId)`, `selectChannelMembershipsForUser(userId)`, `selectChannelsByUser(userId, workspace_id)` — use `createSelector`.

#### `announcementsSlice` (`state.announcements`)
- **State:** `{ list[], loading }`
- **Thunks:** `fetchAnnouncements({ from, to, workspace_id })` (paginated), `createAnnouncementDB`, `updateAnnouncementDB`, `deleteAnnouncementDB`
- **Supabase Table:** `announcements`

#### `lecturesLinksSlice` (`state.lectureLinks`)
- **State:** `{ list[], loading }`
- **Thunks:** `fetchLecturesLink({ from, to, workspace_id })` (paginated), `createLecturesLink`, `updateLecturesLink`, `deleteLecturesLink`
- **Supabase Table:** `lectures`

#### `chapterSlice` (`state.chapters`)
- **State:** `{ chaptersByWorkspace: { [workspaceId]: Chapter[] }, loading }`
- **Thunks:** `fetchChapters(workspaceId)` (cached), `createChapterDB`, `deleteChapterDB` (cascade deletes videos first), `updateChapterDB`
- **Supabase Table:** `chapters_videos_presentations`

#### `videoSlice` (`state.videos`)
- **State:** `{ videosByChapter: { [chapterId]: Video[] }, loading }`
- **Thunks:** `fetchVideos(chapter_id)` (cached), `createVideoDB` (with PPT file upload to Supabase Storage), `updateVideoDB`, `deleteVideoDB`
- **Supabase Table:** `videos`

#### `markCompleteSlice` (`state.markComplete`)
- **State:** `{ completedVideos: videoId[] }`
- **Thunks:** `fetchMarkasComplete(userId)`, `markVideoComplete({ userId, videoId })`
- **Supabase Table:** `user_video_progress`

#### `pinSlice` (`state.pinnedMessages`)
- **State:** `{ items[], loading, error }`
- **Thunks:** `fetchPinnedMessages({ channelId, token })`, `togglePinMessage({ channelId, messageId, userId, token })`
- **Supabase Table:** `pinned_messages` (joins → `messages`, `profiles`)

#### `notificationSlice` (`state.notifications`)
- **State:** `{ items[], page, pageSize, hasMore, loading }`
- **Thunks:** `fetchNotifications({ userId, workspaceId, page, pageSize })` — Queries `notifications` table joining `workspaces` and `profiles`. Filters by `workspaceId` OR `userId`.
- **Reducers:** `prependNotification`, `markAllAsRead`, `resetNotifications`
- **Selectors:** `selectUnreadNotifications(state, lastSeen)`
- **Supabase Table:** `notifications`

#### `adminSlice` (`state.admins`)
- **State:** `{ list[], status, error }`
- **Thunks:** `fetchAdmins()` — Fetches profiles where `role = "admin"`. Cached.
- **Supabase Table:** `profiles`

#### `replySlice` (`state.reply`)
- **State:** `{ open: boolean, message: object|null }`
- **Reducers:** `openReplyDrawer(message)`, `closeReplyDrawer()`

#### `searchSlice` (`state.search`)
- **State:** `{ query: string }`
- **Reducers:** `setQuery(text)` — Used for message search in topbar.

#### `toastSlice` (`state.toast`)
- **State:** `Array<{ id, message, type, duration }>`
- **Reducers:** `addToast({ message, type?, duration? })`, `removeToast(id)`

#### `fileSlice` (`state.file`)
- **State:** `{ files[] }`
- **Reducers:** `addValue(file)`, `removeValue(index)`, `clearValue()`
- **Usage:** Tracks file attachments in the message editor.

#### `lastSeenSlice`
- Empty file (0 bytes). Not yet implemented.

---

## 7. Supabase Database Schema (Inferred from Code)

The following tables are referenced in the codebase:

| Table | Key Columns (inferred) | Used By |
|---|---|---|
| `workspaces` | `id`, `workspace_name`, `avatar_url`, `description` | workspaceSlice |
| `workspace_members` | `user_id`, `workspace_id` | workspaceMembersSlice |
| `channels` | `id`, `channel_name`, `description`, `visibility` (`"public"`/`"private"`), `workspace_id` | channelsSlice |
| `channel_members` | `id`, `channel_id`, `user_id` | channelMembersSlice |
| `messages` | `id`, `content`, `sender_id`, `created_at`, `channel_id`/`token` | messageSlice |
| `pinned_messages` | `id`, `message_id`, `channel_id`, `token`, `pinned_by`, `pinned_at` | pinSlice |
| `announcements` | `id`, `workspace_id`, `created_at`, *(other fields)* | announcementsSlice |
| `lectures` | `id`, `workspace_id`, `lecture_date`, *(other fields)* | lecturesLinksSlice |
| `chapters_videos_presentations` | `id`, `workspace_Id`, `created_at`, *(other fields)* | chapterSlice |
| `videos` | `id`, `name`, `description`, `video_link`, `chapter_id`, `presentation_link` | videoSlice |
| `user_video_progress` | `user_id`, `video_id` | markCompleteSlice |
| `notifications` | `id`, `description`, `created_at`, `type`, `workspaceId`, `channelId`, `userId`, `token` | notificationSlice |
| `profiles` | `id`, `full_name`, `avatar_url`, `email`, `role` | adminSlice, joins |
| `user_profiles` | `full_name`, `avatar_url`, `email` | workspace/channel member joins |
| `invites` | `email`, `workspace_id`, `channels`, `token`, `invited_by` | invite page (direct Supabase insert) |

### Supabase Services Used

- **Auth:** `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`, `getSession()`, `onAuthStateChange()`
- **Database:** Direct table queries via `supabase.from(...).select/insert/update/delete()`
- **Storage:** `supabase.storage.from("media").upload()` / `.getPublicUrl()` — Used for workspace avatars, presentation files
- **Edge Functions:** `createWorkspace` edge function called via `fetch()` with session bearer token
- **Realtime:** Message subscriptions (handled in UI components, not in slices)

---

## 8. Component Architecture

### UI Component Library (`src/components/ui/`)

All built on Radix UI primitives + class-variance-authority (CVA) + `cn()` utility:

| Component | Base | File |
|---|---|---|
| `Button` | CVA variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `success`, `info` | `button.jsx` |
| `Dialog` | Radix Dialog (Root, Trigger, Portal, Overlay, Content, Header, Footer, Title, Description) | `dialog.jsx` |
| `Input` | Styled HTML input | `input.jsx` |
| `Textarea` | Styled HTML textarea | `textarea.jsx` |
| `Label` | Radix Label | `label.jsx` |
| `Avatar` | Radix Avatar (Image + Fallback) | `avatar.jsx` |
| `Badge` | CVA variants: `default`, `secondary`, `destructive`, `outline` | `badge.jsx` |
| `Card` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter | `card.jsx` |
| `DropdownMenu` | Full Radix DropdownMenu component tree | `dropdown-menu.jsx` |
| `Separator` | Radix Separator | `separator.jsx` |
| `Sheet` | Radix Dialog-based side panel | `sheet.jsx` |
| `Sidebar` | Large 19KB component: SidebarProvider, SidebarTrigger, collapsible groups, menus | `sidebar.jsx` |
| `Skeleton` | Loading skeleton placeholder | `skeleton.jsx` |
| `Tooltip` | Radix Tooltip | `tooltip.jsx` |
| `Alert` | Alert + AlertTitle + AlertDescription | `alert.jsx` |
| `UserFallback` | Avatar fallback for users | `userFallback.jsx` |
| `WorkspaceFallback` | Avatar fallback for workspaces | `workspaceFallback.jsx` |

### Dialog Components (`src/components/Dialogs/`)

| Dialog | Files | Purpose |
|---|---|---|
| `ChannelsDialog` | 8 files | Browse/manage channels list |
| `add-channel-dialog` | 5 files | Create new channel (name, description, visibility, member selection) |
| `add-workspace-dialog` | 5 files | Create new workspace (name, description, avatar upload) |
| `invite-dialog` | 3 files | Quick invite dialog (superseded by full Invite page) |

### TipTap Editor (`src/components/Editor/`)

- **`index.jsx`** — Main editor component with toolbar, TipTap `useEditor` setup
- **`TextEditor.jsx`** — Wrapper component
- **`common.js`** — Shared editor utilities
- **`config/`** — Editor configuration
- **`components/`** — 8 editor sub-components (toolbar buttons, mention list, etc.)
- **`editor.css` / `styles.scss`** — Editor-specific styles

### Toast System

- **`ToastContainer`** (`src/components/toast/ToastContainer.jsx`) — Renders from `state.toast` array
- **`toastSlice`** — `addToast({ message, type, duration })`, `removeToast(id)`

---

## 9. Page Components Detail

### Login (`/`)
- Formik form with email + password fields
- Validates via `loginSchema` (Yup)
- Dispatches `loginUser()` thunk
- Redirects to `/dashboard/:userId` on success
- Shows loading spinner, error messages
- "Forgot password?" link

### Signup (`/invite/verify`)
- Invite-only registration flow
- Reads `?token=` from URL search params
- Verifies invite token against `invites` table
- Multi-step form: name → email/avatar → password
- Converts avatar file to base64 for preview
- Dispatches `signupUser()`, then auto-adds user to workspace channels
- Uses `signupSlice` for cross-step state persistence

### Dashboard (`/dashboard/:adminId`)
- Workspace selection grid
- Search filter for workspaces
- "Create New Workspace" button (admin-only via `useIsAdmin()`)
- Shows user avatar in top-right
- Footer with links to Terms, Privacy, Support
- Each workspace card navigates to `/workspace/:id`

### Chat / WorkSpaceInd (`/workspace/:workspace_id/group/:groupId` or `/individual/:token`)
- **Messages** component: displays message feed with infinite scroll
- **Editor** component: TipTap rich-text editor with toolbar
- Group chats use `groupId` (channel ID), DMs use `token`
- Real-time message subscriptions via Supabase

### Announcements (`/workspace/:workspace_id/announcements`)
- Paginated announcement cards
- CRUD operations (admin can create/edit/delete)
- Uses `announcementsSlice`
- Infinite scroll pagination

### Lectures Link (`/workspace/:workspace_id/lecturesLink`)
- Paginated lecture link management
- CRUD operations for lecture resources
- Uses `lecturesLinksSlice`

### Videos & Presentations (`/workspace/:workspace_id/videospresentations`)
- Chapter-based video organization
- Chapters contain videos with Vimeo links
- PPT/presentation file uploads to Supabase Storage
- Progress tracking via `markCompleteSlice`
- Uses `chapterSlice` + `videoSlice`

### Admin User List (`/seeAllUsers`)
- Paginated user table (30 per page)
- Shows avatar, name, email, role selector
- Admin can change user roles via `updateUserRole()`
- Protected by `OnlyAdmin` route guard

### Invite Users (`/workspace/:workspace_id/invite`)
- Textarea for comma/newline-separated email input
- CSV file upload for bulk email import
- Searchable private channel list with checkboxes
- Validates emails, sends invitations via Supabase
- Creates invite records, sends email notifications
- Admin-only (checked via `useIsAdmin()`)

### Calendar (`/workspace/:workspace_id/calendar`)
- Economic calendar view for the workspace

### Market Insight (`/workspace/:workspace_id/market`)
- Market insight / learning content page

### Error Page
- Custom error boundary page for routing errors

### Terms
- Privacy policy / terms page using content from `constants/terms.js`

---

## 10. Layout System

### SidebarLayout (`src/layout/SidebarLayout.jsx`)
```
SidebarProvider
├── Sidebar (border, full height)
│   └── SidebarContent
│       └── SidebarMenu (sidebar/ directory with 17 sub-components)
└── SidebarInset
    └── {children}   ← Topbar + page content
```

The sidebar contains:
- Workspace switcher
- Channel list (public and private)
- Direct message list
- Navigation links to features (Announcements, Lectures, Videos, Calendar, Market)
- Admin links (Users list, Chat viewer)
- Invite link
- Collapsible groups

### Topbar (`src/layout/topbar/index.jsx`)
- Displays channel name + visibility icon (Lock/Users)
- For DMs: shows user avatar + name + email
- Center: Search input with debounced dispatch to `searchSlice`
- Right: Notifications bell, Members panel, Profile dropdown
- Mobile responsive: sidebar trigger button on small screens

### TopbarTwo (`src/layout/TopbarTwo/index.jsx`)
- Simple topbar for channel feature pages
- Displays page name + description

---

## 11. Authentication Flow

```
1. User visits /
2. Login form → dispatch(loginUser({ email, password }))
3. Supabase returns session → stored in authSlice
4. supabase.auth.onAuthStateChange dispatches setSession on every change
5. AppInitializer dispatches sessionDetection() on mount
6. PrivateRoute checks state.auth.session before rendering protected content
7. Redirect to /dashboard/:userId on successful login
```

### Invite-based Signup Flow
```
1. Admin creates invite via InviteUsersPage
   → Inserts record into `invites` table with email, workspace_id, channels[], token
2. User receives invite link: /invite/verify?token=<UUID>
3. SignUp page verifies token against `invites` table
4. User fills multi-step form (name, email, avatar, password)
5. dispatch(signupUser()) → supabase.auth.signUp()
6. Auto-adds user to workspace + specified channels
7. Redirect to login
```

---

## 12. Styling Architecture

### CSS Custom Properties (Design Tokens)

Defined in `src/styles/tailwind.css` and `src/styles/_variables.scss`:

- `--background`, `--foreground` — Base page colors
- `--card`, `--card-foreground` — Card component colors
- `--primary`, `--primary-foreground` — Primary accent colors
- `--secondary`, `--secondary-foreground` — Secondary colors
- `--muted`, `--muted-foreground` — Muted text/backgrounds
- `--accent`, `--accent-foreground` — Accent highlights
- `--destructive`, `--destructive-foreground` — Error/danger colors
- `--border`, `--input`, `--ring` — Form element tokens
- `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc. — Sidebar-specific tokens
- `--chart-1` through `--chart-5` — Chart palette

### Theme System
- **Dark mode** is the default theme
- `AppInitializer` reads `localStorage.getItem("theme")` on mount
- Toggles `dark` class on `document.documentElement`
- Tailwind classes reference CSS custom properties: `bg-(--background)`, `text-(--foreground)`, etc.

---

## 13. Vimeo Integration

### API Service (`src/services/vimeo/vimeo.js`)
- Uses Axios to call `https://api.vimeo.com/videos/:videoId`
- Authenticated via `Bearer ${VITE_VIMEO_ACCESS_TOKEN}`
- `fetchPrivateVideos(videoId)` — Returns video data object

### Components
- **`vimeoPlayer.jsx`** — Standard Vimeo embed player
- **`privateVimeoPlayer.jsx`** — Player for private Vimeo videos (uses API-fetched embed data)

---

## 14. Form Validation (Yup Schemas)

Defined in `src/validation/authSchema.js`:

| Schema | Fields | Rules |
|---|---|---|
| `loginSchema` | `email`, `password` | Email format, password min 6 chars |
| `fullNameSchema` | `fullName` | Min 3 chars, required |
| `contactSchema` | `email`, `avatarFile` | Email format required, avatar nullable |
| `passwordSchema` | `password` | Min 6 chars, required |
| `channelInfoSchema` | `name`, `description` | Name required |
| `workspaceInfoSchema` | `name`, `description` | Name required |
| `inviteUsersSchema` | `users[]` | Array of emails or usernames (alphanumeric 3+ chars) |

---

## 15. Vite Configuration

```js
// vite.config.js
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }  // @ → src/
  },
  server: {
    hmr: { overlay: false }  // Disable HMR error overlay
  },
  plugins: [tailwindcss(), react()]
});
```

- **Path alias:** `@` maps to `./src` (used throughout the codebase)
- **Tailwind CSS 4:** Uses the Vite plugin (not PostCSS)
- **HMR overlay:** Disabled to prevent error overlays during development

---

## 16. Key Conventions and Patterns

### State Management Patterns
1. **Normalized state** for channels: `{ byId: {}, allIds: [] }` with memoized `createSelector`.
2. **Nested caching** for workspace members, channel members, chapters, and videos: state indexed by parent ID.
3. **Thunk-level cache checks:** Many thunks check if data exists before making API calls.
4. **Optimistic UI:** Thunks return data, and `extraReducers` update state on fulfillment.

### Caching Strategy
Several thunks implement manual caching by checking existing state before fetching:
- `fetchChannels` — checks `state.channels.byId` for matching workspace
- `fetchWorkspaceMembers` — checks `state.workspaceMembers.byWorkspaceId`
- `fetchChannelMembersByChannel` — checks `byChannelId[id].status === "succeeded"`
- `fetchChannelMembersbyUser` — checks `byUserId[id].status === "succeeded"`
- `fetchChapters` — checks `chaptersByWorkspace[workspaceId]`
- `fetchVideos` — checks `videosByChapter[chapter_id]`
- `fetchAdmins` — checks `state.admins.list.length > 0`
- `fetchWorkspaceById` — checks `currentWorkspace.id`

### Naming Conventions
- **Slice files:** `featureSlice.js` or `featureNameSlice.js`
- **Components:** PascalCase directories, `index.jsx` as entry
- **CSS:** Component-specific CSS files alongside JSX
- **Utility functions:** camelCase

### File Organization
- Each feature has its own directory under `pages/`, each with `index.jsx` + optional component subdirectory
- Redux features mirror the domain model: one slice per entity type
- Layout components are separate from page components
- UI primitives in `components/ui/` are generic and reusable

---

## 17. Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Run ESLint across project |
| `email` | `email dev --dir src/components/emails` | React Email dev server (if email templates exist) |

---

## 18. Important Implementation Notes

1. **Admin detection** uses TWO methods:
   - `OnlyAdmin` route guard: hardcoded `email === "admin@gmail.com"`
   - `useIsAdmin()` hook: checks `user_metadata.user_role === "admin"`

2. **Direct messages (DMs)** use a `token` identifier instead of a `channelId`. The `token` is typically the other user's ID or a composite key.

3. **Real-time messaging** is handled in component-level Supabase subscriptions (not in Redux slices). The `messageSlice` only stores the current message list.

4. **File uploads** go to Supabase Storage bucket named `"media"` with paths like:
   - Workspace avatars: `workspaces/{adminId}-{timestamp}.{ext}`
   - Presentations: `presentionPpt/{uuid}.{ext}`

5. **Multi-step signup:** Uses `signupSlice` to persist form data across steps, not URL params.

6. **Pagination** is implemented via `range(from, to)` on Supabase queries. The UI uses infinite scroll hooks.

7. **Search** uses a debounced text input (500ms) in the topbar that dispatches to `searchSlice`. Filtering happens client-side in message components.

8. **Sidebar** is built on shadcn/ui's full sidebar system with collapsible groups, resizable width, and mobile trigger.

9. **Workspace creation** calls a Supabase Edge Function, not a direct database insert. This is the only feature using edge functions.

10. **CSS uses Tailwind CSS 4 syntax** with parenthesized custom properties: `bg-(--background)` instead of Tailwind 3's `bg-[var(--background)]`.
