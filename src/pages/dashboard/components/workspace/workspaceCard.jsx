import React from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar.jsx";
import WorkspaceFallback from "@/components/ui/workspaceFallback";
import UserFallback from "@/components/ui/userFallback";

const WorkspaceCard = ({
  workspace,
  members = [],
  membersLoading = false,
  firstChannelId = null,
  index,
  count,
}) => {
  const launchTo = firstChannelId
    ? `/workspace/${workspace.id}/group/${firstChannelId}`
    : `/workspace/${workspace.id}`;

  return (
    <Link
      to={launchTo}
      className="block h-48 rounded-xl border-2 border-(--border) bg-(--background) hover:border-(--primary-foreground)/50 hover:shadow-lg transition-all duration-200 p-5 group cursor-pointer"
    >
      {/* Workspace Icon/Avatar */}
      <div className="mb-4">
        {workspace.avatar_url ? (
          <Avatar className="w-14 h-14 rounded-xl">
            <AvatarImage
              src={workspace.avatar_url}
              alt={workspace.workspace_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-(--primary-foreground)/10 text-(--primary-foreground) text-xl font-semibold rounded-xl">
              {workspace.workspace_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <WorkspaceFallback
            name={workspace.workspace_name}
            _idx={index}
            className="w-14 h-14 rounded-xl text-xl"
          />
        )}
      </div>

      {/* Workspace Name */}
      <h3 className="text-lg font-semibold text-(--primary-foreground) mb-4 capitalize group-hover:text-(--primary-foreground)">
        {workspace.workspace_name}
      </h3>

      {/* Members Section */}
      <div className="flex items-center gap-3">
        {/* Stacked Avatars */}
        <div className="flex -space-x-2">
          {membersLoading && members.length < 3 ? (
            <div className="text-(--muted-foreground) text-xs">Loading...</div>
          ) : (
            members.slice(0, 4).map((m, idx) => (
              <div key={m.user_id} className="relative">
                {m.user_profiles?.avatar_url ? (
                  <Avatar className="w-8 h-8 border-2 border-(--background)">
                    <AvatarImage
                      src={m.user_profiles?.avatar_url}
                      alt={m.user_profiles?.full_name}
                    />
                    <AvatarFallback className="text-xs">
                      {m.user_profiles?.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UserFallback
                    name={m.user_profiles?.full_name}
                    _idx={idx}
                    cn="h-8 w-8 border-2 border-(--background) text-xs"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Member Count */}
        <p className="text-sm text-(--muted-foreground)">{count} Members</p>
      </div>
    </Link>
  );
};

export default React.memo(WorkspaceCard);
