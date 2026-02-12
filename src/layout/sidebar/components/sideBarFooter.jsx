import { SidebarFooter } from "@/components/ui/sidebar";
import React from "react";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/constants/constants.js";
import { useNavigate, useParams } from "react-router-dom";

const SideBarFooter = ({ handleLogout }) => {
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const { workspace_id } = useParams();

  return (
    <SidebarFooter className="mt-auto pb-2">
      {isAdmin && (
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate(`/workspace/${workspace_id}/invite`)}
        >
          Invite new Users
        </Button>
      )}
      <Button variant={"destructive"} onClick={handleLogout}>
        Sign Out
      </Button>
    </SidebarFooter>
  );
};

export default React.memo(SideBarFooter);
