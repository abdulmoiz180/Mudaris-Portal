import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchWorkspaceById } from "@/redux/features/workspace/workspaceSlice";
import { fetchChannels } from "@/redux/features/channels/channelsSlice.js";
import { fetchWorkspaceMembers, selectWorkspaceMembers } from "@/redux/features/workspaceMembers/WorkspaceMembersSlice";
import { addToast } from "@/redux/features/toast/toastSlice";
import { supabase } from "@/services/supabaseClient";
import { ArrowLeft, Mail, Upload, Hash, Search } from "lucide-react";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseEmails(text) {
  return text
    .split(/[,;\n]+/)
    .map((e) => e.trim())
    .filter(Boolean);
}

const InviteUsersPage = () => {
  const { workspace_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [emailText, setEmailText] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvEmails, setCsvEmails] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [channelSearch, setChannelSearch] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const channelCall = useRef(false);
  const workspaceCall = useRef(false);
  const fileInputRef = useRef(null);

  // Redux state
  const { currentWorkspace, loading } = useSelector((state) => state.workSpaces);
  const channelState = useSelector((state) => state.channels);
  const isChannelsLoaded = channelState.allIds.length > 0;
  const currentUserEmail = useSelector((state) => state.auth.user?.email);
  const workspaceMembers = useSelector(selectWorkspaceMembers(workspace_id));

  // Fetch workspace info
  useEffect(() => {
    if (workspace_id && !workspaceCall.current) {
      dispatch(fetchWorkspaceById(workspace_id));
      workspaceCall.current = true;
    }
  }, [workspace_id, dispatch]);

  // Fetch channels
  useEffect(() => {
    if (workspace_id && !isChannelsLoaded && !channelCall.current) {
      dispatch(fetchChannels(workspace_id));
      channelCall.current = true;
    }
  }, [workspace_id, dispatch, isChannelsLoaded]);

  // Fetch workspace members
  useEffect(() => {
    if (workspace_id) {
      dispatch(fetchWorkspaceMembers(workspace_id));
    }
  }, [workspace_id, dispatch]);

  // Filter private channels
  const privateChannels = useMemo(() => {
    if (!isChannelsLoaded) return [];
    return channelState.allIds
      .map((id) => ({
        id,
        name: channelState.byId[id]?.channel_name,
        visibility: channelState.byId[id]?.visibility,
      }))
      .filter((ch) => ch.visibility === "private");
  }, [channelState, isChannelsLoaded]);

  const filteredChannels = useMemo(
    () =>
      privateChannels.filter((c) =>
        c.name?.toLowerCase().includes(channelSearch.toLowerCase())
      ),
    [privateChannels, channelSearch]
  );

  // CSV file handler
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const emails = lines
        .map((line) => line.split(",")[0]?.trim().replace(/^["']|["']$/g, ""))
        .filter((email) => isValidEmail(email));
      setCsvEmails(emails);
    };
    reader.readAsText(file);
  };

  const handleChannelToggle = (channelId) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSendInvitations = async () => {
    setError("");
    const textEmails = parseEmails(emailText);
    const allEmails = [...new Set([...textEmails, ...csvEmails])];

    if (allEmails.length === 0) {
      setError("Please enter at least one email address.");
      return;
    }

    const invalid = allEmails.filter((e) => !isValidEmail(e));
    if (invalid.length) {
      setError(`Invalid email(s): ${invalid.join(", ")}`);
      return;
    }

    if (allEmails.includes(currentUserEmail?.toLowerCase())) {
      setError("You cannot invite yourself.");
      return;
    }

    const alreadyMember = workspaceMembers.some((m) =>
      allEmails.some(
        (e) => m.user_profiles?.email?.toLowerCase() === e.toLowerCase()
      )
    );
    if (alreadyMember) {
      setError("One or more of these users are already members.");
      return;
    }

    setSending(true);
    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session) {
        dispatch(
          addToast({
            message: "You must be logged in to invite users.",
            type: "destructive",
            duration: 3000,
          })
        );
        setSending(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            workspace_id,
            emails: allEmails,
            workspaceName: currentWorkspace?.workspace_name || "Workspace",
            channels: selectedChannels,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        dispatch(
          addToast({
            message: "Server error: " + JSON.stringify(data),
            type: "destructive",
            duration: 3000,
          })
        );
        setSending(false);
        return;
      }

      const failed = data.results?.filter((r) => r.error) || [];
      if (failed.length > 0) {
        dispatch(
          addToast({
            message:
              "Some invitations failed:\n" +
              failed.map((f) => `${f.email}: ${f.error}`).join("\n"),
            type: "destructive",
            duration: 3000,
          })
        );
      } else {
        dispatch(
          addToast({
            message: "All invitations sent successfully!",
            type: "success",
            duration: 3000,
          })
        );
      }
      navigate(-1);
    } catch (err) {
      console.error("Unexpected error:", err);
      dispatch(
        addToast({
          message: "Unexpected error while sending invitations.",
          type: "destructive",
          duration: 3000,
        })
      );
    }
    setSending(false);
  };

  const workspaceName = loading
    ? "..."
    : currentWorkspace?.workspace_name || "Workspace";

  return (
    <div className="min-h-screen w-full bg-(--background) text-(--foreground)">
      {/* Header */}
      <div className="border-b border-(--border) px-6 py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-md hover:bg-(--muted) transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              Invite Users to {workspaceName}
            </h1>
            <p className="text-sm text-(--muted-foreground)">
              Send invitations to new students via email or CSV upload
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-(--card) border border-(--border) rounded-xl p-6 shadow-sm space-y-6">
          {/* Email Addresses Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-(--muted-foreground)" />
              <h2 className="text-base font-semibold">Email Addresses</h2>
            </div>
            <Textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Enter email addresses separated by commas, semicolons, or new lines"
              rows={4}
              className="resize-none w-full"
            />
            <div className="mt-2 text-xs text-(--muted-foreground) bg-(--muted) rounded-md px-3 py-2">
              <p className="font-medium mb-0.5">Example:</p>
              <p>user1@example.com</p>
              <p>user2@example.com, user3@example.com</p>
            </div>
            <p className="text-xs text-(--muted-foreground) mt-2">
              Separate multiple emails with commas, semicolons, or new lines
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-(--border)" />
            <span className="text-xs text-(--muted-foreground) font-medium uppercase">
              Or
            </span>
            <div className="flex-1 h-px bg-(--border)" />
          </div>

          {/* CSV Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-(--muted-foreground)" />
              <h2 className="text-base font-semibold">Upload CSV File</h2>
            </div>
            <div
              className="border border-(--border) rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-(--muted) transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Button variant="outline" size="sm" type="button">
                Choose file
              </Button>
              <span className="text-sm text-(--muted-foreground)">
                {csvFile ? csvFile.name : "No file chosen"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </div>
            {csvEmails.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {csvEmails.length} email(s) parsed from CSV
              </p>
            )}
            <p className="text-xs text-(--muted-foreground) mt-2">
              CSV file should contain email addresses in the first column
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-(--border)" />
            <span className="text-xs text-(--muted-foreground) font-medium uppercase">
              Add to Channels
            </span>
            <div className="flex-1 h-px bg-(--border)" />
          </div>

          {/* Channel Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-(--muted-foreground)" />
              <h2 className="text-base font-semibold">
                Select Channels (Optional)
              </h2>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted-foreground)" />
              <Input
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder="Search channels..."
                className="pl-9"
              />
            </div>

            <div className="border border-(--border) rounded-lg max-h-48 overflow-y-auto">
              {filteredChannels.length === 0 ? (
                <p className="text-sm text-(--muted-foreground) p-4 text-center">
                  No private channels found
                </p>
              ) : (
                filteredChannels.map((channel) => (
                  <label
                    key={channel.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-(--muted) cursor-pointer border-b border-(--border) last:border-b-0 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel.id)}
                      onChange={() => handleChannelToggle(channel.id)}
                      className="rounded border-(--border) w-4 h-4 accent-(--primary)"
                    />
                    <Hash className="w-4 h-4 text-(--muted-foreground)" />
                    <span className="text-sm">{channel.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSendInvitations}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Invitations"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteUsersPage;
