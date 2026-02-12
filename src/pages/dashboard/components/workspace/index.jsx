import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/services/supabaseClient.js";
import WorkspaceCard from "./workspaceCard.jsx";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";

const Workspace = ({ searchQuery = "", onCreateClick, isAdmin }) => {
  const [workspacesWithDetails, setWorkspacesWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.auth.user.id);

  useEffect(() => {
    fetchingDetails();
  }, []);

  const fetchingDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke(
      "fetchingWorkspaces",
      {
        body: {
          userId,
          name: "Functions",
        },
      }
    );
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setWorkspacesWithDetails(data);
    setLoading(false);
  };

  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspacesWithDetails;
    return workspacesWithDetails.filter((item) =>
      item.workspace.workspaces.workspace_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, workspacesWithDetails]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl border-2 border-(--border) bg-(--card) animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map((item) => (
            <WorkspaceCard
              key={item.workspace.id}
              workspace={item.workspace.workspaces}
              members={item.members}
              count={item.count}
              firstChannelId={item.firstChannelId}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-(--muted-foreground)">
            <p className="text-lg">No workspaces found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {/* Create Workspace Card - Admin Only */}
        {isAdmin && (
          <button
            onClick={onCreateClick}
            className="h-48 rounded-xl border-2 border-dashed border-(--border) bg-transparent hover:bg-(--accent)/50 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full border-2 border-(--muted-foreground) flex items-center justify-center group-hover:border-(--primary-foreground)">
              <Plus className="w-5 h-5 text-(--muted-foreground) group-hover:text-(--primary-foreground)" />
            </div>
            <div className="text-center">
              <p className="font-medium text-(--foreground)">Create Workspace</p>
              <p className="text-sm text-(--muted-foreground)">
                Start a new organization or classroom
              </p>
            </div>
          </button>
        )}
      </div>
    </section>
  );
};

export default React.memo(Workspace);
