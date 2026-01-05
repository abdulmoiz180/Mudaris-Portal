import React, { useReducer } from "react";
import MessageActions from "./messageActions/MessageActions.jsx";
import MessageContent from "./MessageContent.jsx";
import { useDispatch } from "react-redux";
import { openReplyDrawer } from "@/redux/features/reply/replySlice.js";
import { DeleteDialog } from "./messageActions/components/DeleteDialog.jsx";
import {
  initialState,
  __reducer_local,
} from "./messageActions/components/reducer.js";
import { ForwardDialog } from "./messageActions/components/ForwardDialog.jsx";
import { addToast } from "@/redux/features/toast/toastSlice.js";
import VaulDrawer from "@/components/Drawer/index.jsx";
import { EditMessageDialog } from "./messageActions/components/EditDialog.jsx";

const MessageItem = ({
  message,
  pickerOpenFor,
  setPickerOpenFor,
  onDelete,
  forwardMsg,
  editMessage,
  rtl,
}) => {
  const { created_at, profiles: { id, full_name, avatar_url } = {} } =
    message || {};
  const dispatch = useDispatch();
  const [__state_local, __dispatch_local] = useReducer(
    __reducer_local,
    initialState
  );
  const handleConfirmDelete = () => {
    __dispatch_local({ type: "SHOW_DELETE_SUCCESS" });
    dispatch(
      addToast({
        message: "Message deleted successfully",
        type: "success",
        duraion: 3000,
      })
    );

    setTimeout(() => {
      onDelete?.(__state_local.selectedMessageId);
      __dispatch_local({ type: "HIDE_DELETE_SUCCESS" });
    }, 1200);
  };
  const handleOpenDeleteDialog = (messageId) => {
    __dispatch_local({ type: "OPEN_DELETE_DIALOG", payload: messageId });
  };
  const handleForwardDialog = (messageId) => {
    __dispatch_local({ type: "OPEN_FORWARD_DIALOG", payload: messageId });
  };
  const handleEditDialog = (message) => {
    __dispatch_local({ type: "OPEN_EDIT_DIALOG", payload: message });
  };
  const handleConfirmForward = (groups, messageId) => {
    if (!messageId) return;
    __dispatch_local({ type: "SHOW_FORWARD_SUCCESS" });
    window.alert("Message forwarded successfully");
    forwardMsg?.(groups, messageId);
    setTimeout(() => {
      __dispatch_local({ type: "HIDE_FORWARD_SUCCESS" });
    }, 1200);
  };
  const handleConfirmEdit = (message) => {
    console.log('edit message ', message)
    editMessage?.(message)
  }
  const handleReply = React.useCallback(() => {
    dispatch(openReplyDrawer(message));
  }, [dispatch, message]);

  const handleOpenEmoji = React.useCallback(() => {
    setPickerOpenFor(message.id);
  }, [setPickerOpenFor, message]);

  return (
    <>
      <div className="flex gap-2  items-start ">
        <DeleteDialog
          open={__state_local.showDeleteDialog}
          onOpenChange={() => __dispatch_local({ type: "CLOSE_DELETE_DIALOG" })}
          onConfirmDelete={handleConfirmDelete}
        />
        <ForwardDialog
          open={__state_local.showForwardDialog}
          onOpenChange={() =>
            __dispatch_local({ type: "CLOSE_FORWARD_DIALOG" })
          }
          onConfirmForward={(groups) =>
            handleConfirmForward(groups, __state_local.selectedMessageId)
          }
        />
        <EditMessageDialog
          open={__state_local.showEditDialog}
          onOpenChange={() =>
            __dispatch_local({ type: "CLOSE_EDIT_DIALOG" })
          }
          initialValue={message}
          onConfirmEdit={handleConfirmEdit}
        // onConfirmForward={(groups) =>
        //   handleConfirmForward(groups, __state_local.selectedMessageId)
        // }
        />
        <VaulDrawer
          avatarUrl={avatar_url}
          userId={message.profiles.id}
          fullName={full_name}
          email={message.profiles?.email}
        />

        <div className="relative message-body w-full  text-(--muted-foreground) group">
          <div
            className={`
    absolute top-1 z-10 transition-opacity duration-150

    opacity-100 visible

    sm:opacity-0 sm:invisible
    sm:group-hover:opacity-100 sm:group-hover:visible
    ${rtl ? "left-15" : "right-1"}
    `}
            dir={rtl ? "rtl" : "ltr"}
          >
            <MessageActions
              messageId={message.id}
              message={message}
              onReply={handleReply}
              onEmoji={handleOpenEmoji}
              pickerOpenFor={pickerOpenFor}
              setPickerOpenFor={setPickerOpenFor}
              userId={message.profiles.id}
              handleOpenDeleteDialog={handleOpenDeleteDialog}
              handleEditDialog={handleEditDialog}
              handleForwardDialog={handleForwardDialog}
            />
          </div>

          <div className="flex gap-2 items-center relative">
            <div className="">
              <strong className="text-(--foreground) font-normal">
                {message.profiles?.full_name || "Unknown User"}
              </strong>
              {message.isForward ? (
                <p className="italic text-xs font-extralight">
                  Message is forwaded
                </p>
              ) : (
                <p></p>
              )}
              <span className="text-xs text-(--muted-foreground)">
                <LocalTime utcString={created_at} />
              </span>
            </div>
          </div>
          <MessageContent
            attachments={message.attachments}
            content={message.content}
            id={message.id}
          />

          <div>
            {message.replyCount > 0 && (
              <button
                className="text-[13px] text-(--chart-4) mt-1 font-bold cursor-pointer"
                onClick={() => dispatch(openReplyDrawer(message))}
                title="View replies"
                type="button"
              >
                {message.replyCount}{" "}
                {message.replyCount === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageItem;
const LocalTime = ({ utcString }) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const localTime = new Date(utcString).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: userTimeZone,
  });

  return <span>{localTime.toUpperCase()}</span>;
};
