import React, { useCallback, useMemo, useState } from "react";
import AddChannelDialog from "@/components/Dialogs/add-channel-dialog";
import { SidebarContent } from "@/components/ui/sidebar";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "@/redux/features/auth/authSlice.js";
import SideBarHeader from "./components/sideBarHeader";
import SideBarChannels from "./components/sidbeBarChannels/index.jsx";
import SideBarApps from "./components/sideBarApps";
import SideBarFooter from "./components/sideBarFooter";
import './sidebar.css'


const Sidebar = () => {
  const dispatch = useDispatch();
  const [addChannelOpen, setAddChannelOpen] = useState(false);
  const { workspace_id } = useParams();

  const userId = useSelector((state) => state.auth.session?.user?.id);

  // Stable callbacks
  const stableSetAddChannelOpen = useCallback((open) => {
    setAddChannelOpen(open);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logOut());
  }, [dispatch]);

  // Memoize ALL props
  const sideBarChannelsProps = useMemo(() => ({
    setAddChannelOpen: stableSetAddChannelOpen,
    userId,
    workspace_id
  }), [stableSetAddChannelOpen, userId, workspace_id]);

  const sideBarAppsProps = useMemo(() => ({
    workspace_id,
    userId
  }), [workspace_id, userId]);

  const sideBarFooterProps = useMemo(() => ({
    handleLogout
  }), [handleLogout]);

  const sideBarHeaderProps = useMemo(() => ({
    userId
  }), [userId]);

  return (
    <>
      <AddChannelDialog
        open={addChannelOpen}
        onOpenChange={stableSetAddChannelOpen}
        usedIn={"createChannel"}
      />
      <SidebarContent className="sideBar h-full bg-(--sidebar) text-(--foreground) border-2 border-(--sidebar-border) px-2 py-4 flex flex-col gap-4">
        <SideBarHeader {...sideBarHeaderProps} />
        <div className="flex flex-col gap-2 border-y-2 w-full border-(--sidebar-border)">
          <SideBarChannels {...sideBarChannelsProps} />
          <SideBarApps {...sideBarAppsProps} />
        </div>
        <SideBarFooter {...sideBarFooterProps} />
      </SidebarContent>
    </>
  );
};

export default React.memo(Sidebar);