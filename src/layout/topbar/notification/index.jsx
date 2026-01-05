import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchNotifications,
  prependNotification,
} from "@/redux/features/notifications/notificationSlice";

export function Notifications() {
  const [unread, setUnread] = useState(0);

  const { workspace_id } = useParams();
  const userId = useSelector((state) => state.auth.user.id);
  const lastSeen = useSelector(
    (state) => state.auth.user?.user_metadata?.last_notification_seen
  );
  const { items } = useSelector((state) => state.notifications);

  const dispatch = useDispatch();
  useEffect(() => {
    if (!userId || !workspace_id) return;

    dispatch(
      fetchNotifications({
        userId,
        workspaceId: workspace_id,
        page: 0,
      })
    );
  }, [userId, workspace_id, dispatch]);

  const channelRef = useRef(null);
  const navigate = useNavigate()
  // --- Setup realtime subscription
  const setupRealtime = useCallback(async () => {
    if (!userId) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const filter = `userId=eq.${userId},workspaceId=eq.${workspace_id}`;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter },
        (payload) => {
          dispatch(prependNotification(payload.new));
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [userId, workspace_id, dispatch]);

  // --- Recalculate unread when items or lastSeen change
  useEffect(() => {
    if (!items.length) {
      setUnread(0);
      return;
    }

    const count = lastSeen
      ? items.filter(
        (n) => new Date(n.created_at) > new Date(lastSeen)
      ).length
      : items.length;

    setUnread(count);
  }, [items, lastSeen]);

  useEffect(() => {
    setupRealtime();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [setupRealtime]);

  // --- Mark notifications as seen
  const handleOpenChange = async (open) => {
    if (!open) return;

    await supabase.auth.updateUser({
      data: { last_notification_seen: new Date().toISOString() },
    });

    setUnread(0);
  };
  const handleNavigation = (u) => {

    if (u.type === 'directMessage') {
      if (u.token) {
        navigate(`/workspace/${workspace_id}/individual/${u.token}`)
        // handleFunction(u.profiles)
      }
    } else if (u.type === 'announcement') {
      navigate(`/workspace/${workspace_id}/announcements`)
    } else if (u.type === 'chapterDb') {
      navigate(`/workspace/${workspace_id}/videospresentations`)
    } else if (u.type === 'lecturesLink') {
      navigate(`/workspace/${workspace_id}/lecturesLink`)
    } else if (u.type === 'reply' || u.type === 'mentioned') {
      navigate(`/workspace/${workspace_id}/group/${u.channelId}`)
    }
  }
  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative ">
        <Bell className="h-6 w-6  text-(--primary-foreground)" />
        {unread > 0 && (
          <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-(--foreground)">
            {unread}
          </Badge>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72 text-(--primary-foreground) bg-(--card) border-(--border)">
        {items.length === 0 && (
          <DropdownMenuItem>No notifications</DropdownMenuItem>
        )}

        {items.map((m) => (
          <DropdownMenuItem
            onClick={() => handleNavigation(m)
            }
            key={m.id}>
            {m.description}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
