import { useParams } from "react-router-dom";
import MessageItem from "./MessageItem.jsx";
import PinnedMessages from "./PinnedMessages.jsx";
import { isRTL } from "@/utils/rtl/rtl.js";
import { Button } from "@/components/ui/button.jsx";

const MessageList = ({
  messages,
  currentUserId,
  pickerOpenFor,
  setPickerOpenFor,
  onDelete,
  hasMore,
  loadOlder,
  forwardMsg,
  editMessage
}) => {
  const { groupId, token } = useParams();
  return (
    <>
      <PinnedMessages channelId={groupId} token={token} msg={messages} />
      <div className="flex item-center">
        {hasMore && (
          <Button
            onClick={loadOlder}
            variant={"success"}
            className="mx-auto mt-4  px-4 py-2"
          >
            Load chat
          </Button>
        )}

        {!hasMore && (
          <p className="text-center w-full text-gray-400 text-sm mt-4">
            No more messages
          </p>
        )}
      </div>

      {messages.map((msg) => {
        const rtl = isRTL(msg?.content);
        return (
          <div
            className={`my-2 px-3 py-2 rounded-xl  ${rtl ? "text-right" : "text-left"
              }`}
            dir={rtl ? "rtl" : "ltr"}
          >
            <MessageItem
              rtl={rtl}
              message={msg}
              currentUserId={currentUserId}
              loadOlder={loadOlder}
              pickerOpenFor={pickerOpenFor}
              setPickerOpenFor={setPickerOpenFor}
              onDelete={onDelete}
              forwardMsg={forwardMsg}
              editMessage={editMessage}
            />
          </div>
        );
      })}
    </>
  );
};

export default MessageList;
