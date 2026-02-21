import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "@/services/supabaseClient";
import { addToast } from "@/redux/features/toast/toastSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Link2,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";

const INVITE_BASE_URL = "https://mymudarisacademy.com/invite/verify?token=";

const EXPIRATION_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "15 days", value: 15 },
  { label: "30 days", value: 30 },
];

/**
 * PublicInviteLink – generates / displays / revokes a public workspace invite link.
 *
 * @param {{ workspaceId: string }} props
 */
const PublicInviteLink = ({ workspaceId }) => {
  const dispatch = useDispatch();

  // ── Local state ──────────────────────────────────────────────
  const [link, setLink] = useState(null);
  const [token, setToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expirationDays, setExpirationDays] = useState(15);

  // ── Derived ──────────────────────────────────────────────────
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  // ── Fetch existing public link on mount ──────────────────────
  const fetchExistingLink = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("invite_type", "public")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching public invite:", error);
        return;
      }

      if (data) {
        setToken(data.token);
        setLink(`${INVITE_BASE_URL}${data.token}`);
        setExpiresAt(data.expires_at);
      }
    } catch (err) {
      console.error("Unexpected error fetching public invite:", err);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchExistingLink();
  }, [fetchExistingLink]);

  // ── Generate link ────────────────────────────────────────────
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newToken = crypto.randomUUID();
      const newExpiresAt = new Date(
        Date.now() + expirationDays * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { error } = await supabase.from("invitations").insert([
        {
          workspace_id: workspaceId,
          token: newToken,
          invite_type: "public",
          expires_at: newExpiresAt,
          email: null,
        },
      ]);

      if (error) {
        dispatch(
          addToast({
            message: "Failed to generate invite link.",
            type: "destructive",
            duration: 3000,
          }),
        );
        console.error("Insert error:", error);
        setLoading(false);
        return;
      }

      const generatedLink = `${INVITE_BASE_URL}${newToken}`;
      setToken(newToken);
      setLink(generatedLink);
      setExpiresAt(newExpiresAt);

      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard may not be available – still show the link
      }

      dispatch(
        addToast({
          message: "Public invite link generated & copied!",
          type: "success",
          duration: 3000,
        }),
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      dispatch(
        addToast({
          message: "Unexpected error generating link.",
          type: "destructive",
          duration: 3000,
        }),
      );
    }
    setLoading(false);
  };

  // ── Copy to clipboard ───────────────────────────────────────
  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      dispatch(
        addToast({
          message: "Link copied to clipboard!",
          type: "success",
          duration: 2000,
        }),
      );
    } catch {
      dispatch(
        addToast({
          message: "Failed to copy link.",
          type: "destructive",
          duration: 3000,
        }),
      );
    }
  };

  // ── Revoke link ─────────────────────────────────────────────
  const handleRevoke = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("token", token);

      if (error) {
        dispatch(
          addToast({
            message: "Failed to revoke invite link.",
            type: "destructive",
            duration: 3000,
          }),
        );
        console.error("Delete error:", error);
        setLoading(false);
        return;
      }

      setLink(null);
      setToken(null);
      setExpiresAt(null);

      dispatch(
        addToast({
          message: "Public invite link revoked.",
          type: "success",
          duration: 3000,
        }),
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      dispatch(
        addToast({
          message: "Unexpected error revoking link.",
          type: "destructive",
          duration: 3000,
        }),
      );
    }
    setLoading(false);
  };

  // ── Format date helper ──────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <Card className="border border-(--border) shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-(--muted-foreground)" />
          <CardTitle className="text-base">Public Invite Link</CardTitle>
        </div>
        <CardDescription>
          Generate a shareable link that anyone can use to join this workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Active link display ─────────────────────────────── */}
        {link ? (
          <div className="space-y-3">
            {/* Link input + copy */}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={link}
                className={cn(
                  "flex-1 font-mono text-xs",
                  isExpired && "opacity-50",
                )}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    disabled={isExpired}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? "Copied!" : "Copy link"}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Expiration info */}
            <div className="flex items-center justify-between text-xs">
              <div
                className={cn(
                  "flex items-center gap-1.5",
                  isExpired
                    ? "text-red-500"
                    : "text-(--muted-foreground)",
                )}
              >
                {isExpired ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                <span>
                  {isExpired ? "Expired" : "Expires"} {formatDate(expiresAt)}
                </span>
              </div>

              {/* Revoke button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRevoke}
                    disabled={loading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-7 px-2 gap-1"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Revoke
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete this public link</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ) : (
          /* ── Generate controls ────────────────────────────── */
          <div className="space-y-3">
            {/* Expiration selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-(--muted-foreground) whitespace-nowrap">
                Link expires in
              </label>
              <select
                value={expirationDays}
                onChange={(e) => setExpirationDays(Number(e.target.value))}
                className="h-9 rounded-md border border-(--border) bg-(--background) px-3 text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--ring)"
              >
                {EXPIRATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate button */}
            <Button
              variant="default"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Generate Public Link
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicInviteLink;
