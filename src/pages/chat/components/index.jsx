import React, { useState } from "react";
import ReplyDrawer from "./ReplyDrawer";
import MessageList from "./MessageList";
import useMessages from "@/hooks/messages-hook/useMessages.js";
import "./message.css";
import { useSelector, shallowEqual } from "react-redux";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AddUserInChannel from "./invite-channel-dialog";
import { useIsAdmin } from "@/constants/constants";
const Messages = () => {
  const isAdmin = useIsAdmin();
  const {
    messages,
    currentUserId,
    pickerOpenFor,
    loadOlder,
    setPickerOpenFor,
    containerRef,
    hasMore,
    deleteMessage,
    forwardMsg,
    editMessage
  } = useMessages();

  const { groupId } = useParams();
  const channel = useSelector(
    (state) => state.channels.byId[groupId],
    shallowEqual
  );

  const [openDialog, setOpenDialog] = useState(false);

  const {
    channel_name = "channel",
    description = "description",
    visibility,
  } = channel || {};

  return (
    <section ref={containerRef} className="messages-container">
      <ReplyDrawer />

      {channel && (
        <>
          <div className="flex flex-col gap-0 items-center">
            <span className="bg-(--standard) text-(--standard-foreground) font-bold w-16.5 text-2xl rounded-md h-16.5 flex items-center justify-center mb-2">
              #
            </span>
            <h1 className=" text-2xl text-(--primary-foreground) font-black ">
              {channel_name}
            </h1>
            <p className="text-(--primary-foreground)">{description}</p>
            {visibility === "private" && isAdmin && (
              <Button
                variant={"outline"}
                className="text-(--primary-foreground) cursor-pointer border"
                onClick={() => setOpenDialog(true)}
              >
                add user
              </Button>
            )}
          </div>
        </>
      )}

      <AddUserInChannel
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        hasMore={hasMore}
        loadOlder={loadOlder}
        pickerOpenFor={pickerOpenFor}
        setPickerOpenFor={setPickerOpenFor}
        onDelete={deleteMessage}
        forwardMsg={forwardMsg}
        editMessage={editMessage}
      />
    </section>
  );
};

export default Messages;
