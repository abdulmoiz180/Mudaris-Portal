import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input";

const stripHtml = (html = "") =>
  String(html).replace(/<[^>]*>?/gm, "");

const EditMessageDialog = ({
  open,
  onOpenChange,
  initialValue,
  onConfirmEdit,
}) => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setValue(stripHtml(initialValue.content ?? ""));
  }, [initialValue, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-(--background) text-(--foreground) border border-(--border) rounded-md">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
          <DialogDescription>
            Update your message below. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Edit your message..."
        />

        <DialogFooter className="flex justify-end gap-1">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            disabled={!value.trim()}
            onClick={() => {
              onConfirmEdit( {...initialValue,content:value.trim()});
              onOpenChange(false);
            }}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { EditMessageDialog };
