import { createBrowserRouter, Outlet } from "react-router-dom";
import SignUp from "@/pages/auth/signup/index.jsx";
import Login from "@/pages/auth/login/index.jsx";
import Dashboard from "@/pages/dashboard/index.jsx";
import OnlyAdmin, { PrivateRoute } from "./privateRoute.jsx";
import WorkSpaceInd from "@/pages/dashboard/components/workspaceind.jsx";
import SidebarLayout from "@/layout/SidebarLayout.jsx";
import Topbar from "@/layout/topbar/index.jsx";
import ThemeLayout from "@/layout/ThemeLayout.jsx";
import UsersList from "@/pages/admin/index.jsx";
import Calendar from "@/pages/apps/calendar/index.jsx";
import Market from "@/pages/apps/market/index.jsx";
import Announcements from "@/pages/channels/announcements/index.jsx";
import LecturesLink from "@/pages/channels/lecturesLink/index.jsx";
import HandleChatsViewer from "@/pages/chatsViewer/index.jsx";
import ChatGet from "@/pages/chatsViewer/chatGet/index.jsx";
import VideosPresentations from "@/pages/channels/Videos & Presentations/index.jsx";
import TopbarTwo from "@/layout/TopbarTwo/index.jsx";
import Terms from "@/pages/terms/index.jsx";
import ForgotPassword from "@/pages/auth/forgotpassword/index.jsx";
import ResetPassword from "@/pages/auth/forgotpassword/ResetPassword.jsx";
import ErrorPage from "@/pages/errorPage/index.jsx";
import InviteUsersPage from "@/pages/invite/index.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },

  {
    path: "/invite/verify",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/privacypolicy",
    element: <Terms />,
  },
  // ✅ All themed pages wrapped
  {
    element: <ThemeLayout />, // theme applied here
    children: [
      {
        path: "/dashboard/:adminId",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "/seeAllUsers",
        element: (
          <OnlyAdmin>
            <UsersList />
          </OnlyAdmin>
        ),
      },
      {
        path: "/seePersonalChats",
        element: (
          <OnlyAdmin>
            <HandleChatsViewer />
          </OnlyAdmin>
        ),
      },

      {
        path: "/seePersonalChats/:token",
        element: (
          <OnlyAdmin>
            <ChatGet />
          </OnlyAdmin>
        ),
      },
      {
        path: "/workspace/:workspace_id/videospresentations",
        element: (
          <PrivateRoute>
            <TopBarSecond
              name="videos and presentation"
              desc="Access lecture materials and resources"
            />
          </PrivateRoute>
        ),
        children: [{ path: "", element: <VideosPresentations /> }],
      },
      {
        path: "/workspace/:workspace_id/lecturesLink",
        element: (
          <PrivateRoute>
            <TopBarSecond
              name="LecturesLink"
              desc="Access lecture materials and resources"
            />
          </PrivateRoute>
        ),
        children: [{ path: "", element: <LecturesLink /> }],
      },
      {
        path: "/workspace/:workspace_id/announcements",
        element: (
          <PrivateRoute>
            <TopBarSecond
              name="Announcements"
              desc={"Important academy announcements"}
            />
          </PrivateRoute>
        ),
        children: [{ path: "", element: <Announcements /> }],
      },
      {
        path: "/workspace/:workspace_id/calendar",
        element: (
          <PrivateRoute>
            <TopBarSecond
              name="Economic Calender"
              desc={"Economic events and market calendar"}
            />
          </PrivateRoute>
        ),
        children: [{ path: "", element: <Calendar /> }],
      },
      {
        path: "/workspace/:workspace_id/market",
        element: (
          <PrivateRoute>
            <TopBarSecond
              name="Market Insight"
              desc="Learn about market from here"
            />
          </PrivateRoute>
        ),
        children: [{ path: "", element: <Market /> }],
      },
      {
        path: "/workspace/:workspace_id/invite",
        element: (
          <PrivateRoute>
            <TopbarOnly />
          </PrivateRoute>
        ),
        children: [{ path: "", element: <InviteUsersPage /> }],
      },
      {
        path: "/workspace/:workspace_id",
        element: (
          <PrivateRoute>
            <WorkspaceLayout />
          </PrivateRoute>
        ),
        children: [
          { path: "group/:groupId", element: <WorkSpaceInd /> },
          { path: "individual/:token", element: <WorkSpaceInd /> },
        ],
      },
    ],
  },
]);

function WorkspaceLayout() {
  return (
    <SidebarLayout>
      <Topbar />
      <Outlet />
    </SidebarLayout>
  );
}
function TopbarOnly() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
function TopBarSecond({ name, desc }) {
  return (
    <SidebarLayout>
      <TopbarTwo name={name} desc={desc} />
      <Outlet />
    </SidebarLayout>
  );
}
