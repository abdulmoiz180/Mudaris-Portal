import React, { useState, useRef } from "react";
import InviteWorkspaceUsers from "./steps/InviteWorkspaceUsers.jsx";
import WorkspaceInfo from "./steps/WorkspaceInfo.jsx";
import AddavatarInWS from "./steps/addAvatar.jsx";
import WorkspaceStepIndicator from "./steps/WorkspaceStepIndicator.jsx";
import { Button } from "@/components/ui/button";
import { workspaceInfoSchema } from "@/validation/authSchema.js";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDispatch } from "react-redux";
import { createWorkspace } from "@/redux/features/workspace/workspaceSlice.js";
import { supabase } from "@/services/supabaseClient.js";
import { addToast } from "@/redux/features/toast/toastSlice.js";
const initialState = {
  name: "",
  description: "",
  avatarFile: "",
  users: [],
};
const AddWorkspaceDialog = ({ open, onClose }) => {
  const dialogRef = useRef();

  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [workspaceData, setWorkspaceData] = useState(initialState);
  const steps = ["Workspace Info", "Add Avatar", "Invite Users"];
  const resetWorkspaceState = (setWorkspaceData, setStep) => {
    setWorkspaceData(initialState);
    setStep(0);
  };
  const { adminId } = useParams();
  const getValidationSchema = () => {
    if (step === 0) return workspaceInfoSchema;
    if (step === 1) return;
    if (step === 2) return inviteUsersSchema;
    return null;
  };
  const validateStep = async () => {
    const schema = getValidationSchema();
    const currentData = workspaceData;

    if (schema) {
      try {
        await schema.validate(currentData, { abortEarly: false });
        setErrors({});
        return true;
      } catch (err) {
        const errObj = {};
        err.inner.forEach((e) => {
          errObj[e.path] = e.message;
        });
        setErrors(errObj);
        return false;
      }
    }
    setErrors({});
    return true;
  };
  const handleNext = async () => {
    if (await validateStep()) {
      setStep((s) => s + 1);
    }
  };
  // const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);
  const handleClose = () => {
    resetWorkspaceState(setWorkspaceData, setStep);
    onClose();
  };
  const handleSubmit = async () => {
    const { name, description, avatarFile } = workspaceData;

    try {
      // 1️⃣ Create the workspace and get the result
      await dispatch(
        createWorkspace({
          name,
          description,
          avatarFile,
          adminId,
        }),
      ).unwrap();

      // 3️⃣ Reset form & close
      setTimeout(() => resetWorkspaceState(setWorkspaceData, setStep), 300);
      handleClose();
    } catch (err) {
      console.error("Failed to create workspace:", err);
    }
  };

  const sendEmail = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error(error);
        dispatch(
          addToast({
            message: "You must be logged in to invite users.",
            type: "destructive",
            duration: 3000,
          }),
        );
        return;
      }

      // Use state directly instead of undefined formData
      const { name, description, avatarFile, users } = workspaceData;

      // 1. Create the workspace first
      const workspace = await dispatch(
        createWorkspace({
          name,
          description,
          avatarFile,
          adminId,
        }),
      ).unwrap();

      // // 2. Now send the invitations with the new workspace_id
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            workspace_id: workspace.id,
            emails: users,
            workspaceName: workspace?.workspace_name || "Workspace",
          }),
        },
      );

      const result = await res.json();
      console.log("invite response ->", result);

      if (!res.ok) {
        console.error("❌ Failed:", result);
        dispatch(
          addToast({
            message: "Server error: " + JSON.stringify(result),
            type: "destructive",
            duration: 3000,
          }),
        );
        return;
      }

      const failed = result.results.filter((r) => r.error);
      if (failed.length > 0) {
        dispatch(
          addToast({
            message:
              "Some invitations failed:\n" +
              failed.map((f) => `${f.email}: ${f.error}`).join("\n"),
            type: "destructive",
            duration: 3000,
          }),
        );
        console.error(
          "Some invitations failed:\n" +
            failed.map((f) => `${f.email}: ${f.error}`).join("\n"),
        );
      } else {
        dispatch(
          addToast({
            message: "All invitations sent successfully!",
            type: "success",
            duration: 3000,
          }),
        );
      }

      setTimeout(() => resetWorkspaceState(setWorkspaceData, setStep), 300);
      dispatch(
        addToast({
          message: "Workspace created successfully!!!",
          type: "success",
          duration: 3000,
        }),
      );
      handleClose();
    } catch (err) {
      console.error("⚠️ Unexpected error:", err);
      console.error(err);
      alert("Unexpected error while sending invitations.");
      dispatch(
        addToast({
          message: "Unexpected error while sending invitations.",
          type: "destructive",
          duration: 3000,
        }),
      );
    }
  };

  const renderStep = () => {
    if (step === 0)
      return (
        <WorkspaceInfo
          state={workspaceData}
          handleNext={handleNext}
          setState={setWorkspaceData}
          errors={errors}
        />
      );
    if (step === 1)
      return (
        <AddavatarInWS state={workspaceData} setState={setWorkspaceData} />
      );
    if (step === 2)
      return (
        <InviteWorkspaceUsers
          state={workspaceData}
          setState={setWorkspaceData}
          onSkip={handleSubmit}
          errors={errors}
        />
      );
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      initialFocus={dialogRef}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Workspace</DialogTitle>
          <DialogDescription>
            Enter the details and your workspace will be ready
          </DialogDescription>
        </DialogHeader>
        <WorkspaceStepIndicator step={step} steps={steps} />
        {renderStep()}

        <div className="flex justify-between mt-6">
          {step > 0 && (
            <Button variant={"destructive"} onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 2 && (
            <Button variant={"success"} onClick={handleNext}>
              Next
            </Button>
          )}
          {step === 2 && (
            <Button
              variant={"success"}
              disabled={step === 2 && workspaceData.users.length === 0}
              onClick={sendEmail}
            >
              Finish
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkspaceDialog;
