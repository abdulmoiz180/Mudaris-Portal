import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import {
  addMessage,
  setMessages,
} from "@/redux/features/messages/messageSlice";
const PAGE_SIZE = 30;

export default function useMessages() {
  const dispatch = useDispatch();

  const { groupId, user_id, token } = useParams();
  const messages = useSelector((state) => state.messages.items, shallowEqual);

  const { avatar_url: imageUrl, fullName } = useSelector(
    (s) => s.auth.user?.user_metadata,
    shallowEqual
  );
  const currentUserId = useSelector((s) => s.auth.user?.id, shallowEqual);
  const query = useSelector((state) => state.search.query, shallowEqual);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pickerOpenFor, setPickerOpenFor] = useState(null);
  const containerRef = useRef(null);
  console.log(hasMore, "use messages has more");
  const profilesCache = useRef(new Map());
  // keep a ref to latest messages so callbacks/subscriptions can access up-to-date data
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const filtered = React.useMemo(
    () =>
      query
        ? messages.filter((msg) =>
          msg.content?.toLowerCase().includes(query.toLowerCase())
        )
        : messages,
    [messages, query]
  );
  // 🔹 Load messages with sender profile

  const loadMessages = useCallback(
    async (pageNum) => {
      const FROM = pageNum * PAGE_SIZE;
      const TO = FROM + PAGE_SIZE - 1;
      let queryBuilder = supabase
        .from("messages")
        .select(
          `
          id,
          content,
          attachments,
          created_at,
          isForward,
          profiles (
            id,
            full_name,
            avatar_url,
            email
          ),
          replies:messages!reply_to(id),
          reactions:message_reactions (
            id,
            user_id,
            reaction_type
          )
        `
        )
        .order("created_at", { ascending: false })
        .range(FROM, TO)
        .is("reply_to", null);

      if (user_id) {
        queryBuilder = queryBuilder.eq("sender_id", user_id);
      } else if (token) {
        queryBuilder = queryBuilder.eq("token", token);
      } else {
        queryBuilder = queryBuilder.eq("channel_id", groupId);
      }

      const { data, error } = await queryBuilder;
      if (error) return [];
      const messagesWithReplyCount = data.map((msg) => ({
        ...msg,
        replyCount: msg.replies ? msg.replies.length : 0,
        reactions: msg.reactions || [],
      }));
      return messagesWithReplyCount.reverse();
    },
    [groupId, user_id, token]
  );

  // initial load
  useEffect(() => {
    (async () => {
      const firstBatch = await loadMessages(0);
      dispatch(setMessages(firstBatch));

      if (firstBatch.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setPage(1);
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100);
    })();
  }, [groupId, user_id, dispatch, token]);

  // load older
  const loadingRef = useRef(false);
  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    loadingRef.current = true;
    const container = containerRef.current;
    const oldScrollHeight = container.scrollHeight;
    const olderBatch = await loadMessages(page);
    if (olderBatch.length < PAGE_SIZE) {
      setHasMore(false);
    }
    // use latest messages from ref to avoid stale closure and unnecessary deps
    dispatch(setMessages([...olderBatch, ...messagesRef.current]));
    setPage((p) => p + 1);
    setTimeout(() => {
      container.scrollTop = container.scrollHeight - oldScrollHeight;
    }, 50);
    loadingRef.current = false;
  }, [page, hasMore]);
  //hey i removed the extra code for reactions if you want you can check repo 
  const userRef = useRef({
    id: currentUserId,
    fullName,
    imageUrl,
  });
  useEffect(() => {
    userRef.current = {
      id: currentUserId,
      fullName,
      imageUrl,
    };
  }, [currentUserId, fullName, imageUrl])
  const handleInsertRef = useRef(null)
  useEffect(() => {
    handleInsertRef.current = async (payload) => {
      const newMsg = payload.new;
      let profile = null;
      const { id, fullName, imageUrl } = userRef.current;

      if (newMsg.sender_id === id) {
        profile = {
          full_name: fullName,
          avatar_url: imageUrl,
        };
      }
      else {
        // ✅ check cache first
        if (profilesCache.current.has(newMsg.sender_id)) {
          profile = profilesCache.current.get(newMsg.sender_id);
        } else {
          const { data: p, error } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          if (!error && p) {
            profile = p;
            profilesCache.current.set(newMsg.sender_id, p);
          } else {
            profile = { full_name: "Unknown", avatar_url: null };
          }
        }
      }
      if (!newMsg.reply_to) {
        dispatch(
          addMessage({
            ...newMsg,
            profiles: profile,
            reactions: [],
          })
        );
      }

      // auto-scroll if user is near bottom
      const container = containerRef.current;
      if (container) {
        const isAtBottom =
          container.scrollHeight - container.scrollTop <=
          container.clientHeight + 50;
        if (isAtBottom) {
          setTimeout(() => {
            container.scrollTop = container.scrollHeight;
          }, 50);
        }
      }
    };
  }, [dispatch])
  const handleDeleteRef = useRef(null)
  useEffect(() => {
    handleDeleteRef.current = async (payload) => {
      const deletedId = payload.old?.id;
      if (!deletedId) return;
      // remove from local state
      dispatch(
        setMessages(messagesRef.current.filter((m) => m.id !== deletedId))
      );
    };
  }, [dispatch])
  useEffect(() => {
    if (!groupId) return
    const channel = supabase.channel(`messages:${groupId}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: groupId ? `channel_id=eq.${groupId}` : undefined,
        },
        (payload) => handleInsertRef.current(payload)
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: groupId ? `channel_id=eq.${groupId}` : undefined,
        },
        (payload) => handleDeleteRef.current(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const forwardMsg = useCallback(
    async (groups, message) => {
      for (const e of groups) {
        const { error } = await supabase.from("messages").insert({
          channel_id: e.id,
          content: message.content,
          attachments: message.attachments,
          isForward: true,
          sender_id: currentUserId,
        });

        if (error) console.error("Insert error:", error);
      }
    },
    [dispatch]
  );
  const editMessage = useCallback(
    async (message) => {
      const { id, content } = message;
      const previousMessages = messagesRef.current;

      const updatedMessages = previousMessages.map((m) =>
        m.id === id
          ? { ...m, content }
          : m
      );

      dispatch(setMessages(updatedMessages));

      // 2️⃣ Update DB (SAFE)
      const { error } = await supabase
        .from("messages")
        .update({ content })
        .eq("id", id);

      if (error) {
        console.error("Update error:", error);

        // 3️⃣ Rollback on failure
        dispatch(setMessages(previousMessages));
      }
    },
    [dispatch]
  );


  // delete a message (optimistic)
  const deleteMessage = useCallback(
    async (messageId) => {
      const previous = messagesRef.current;
      // optimistic remove
      dispatch(setMessages(previous.filter((m) => m.id !== messageId)));
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);
      if (error) {
        console.error("Failed to delete message", error);
        // revert
        dispatch(setMessages(previous));
      }
    },
    [dispatch]
  );

  return {
    messages: filtered,
    setMessages,
    loadOlder,
    hasMore,
    pickerOpenFor,
    setPickerOpenFor,
    containerRef,
    currentUserId,
    deleteMessage,
    forwardMsg,
    editMessage
  };
}
