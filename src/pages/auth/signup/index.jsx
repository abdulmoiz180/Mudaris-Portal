import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/services/supabaseClient.js";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  fullNameSchema,
  contactSchema,
  passwordSchema,
} from "@/validation/authSchema";
import { updateField } from "@/redux/features/auth/signupSlice.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToast } from "@/redux/features/toast/toastSlice";
import bgImg from "@/assets/images/Logo.png";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Redux state
  const { fullName } = useSelector((state) => state.signupForm);

  // Invite data
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  // Get ?token=...
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  /* -----------------------------
        VERIFY INVITE
  ----------------------------- */
  useEffect(() => {
    async function verifyInvite() {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) return setError("Invalid invitation link");
      if (data.used)
        return setError("This invitation link has already been used");
      if (new Date(data.expires_at) < new Date())
        return setError("This invitation link has expired");

      setInvite(data);
    }

    if (token) verifyInvite();
    else setError("No invitation token provided");
  }, [token]);

  /* -----------------------------
      CONVERT FILE → BASE64
  ----------------------------- */
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  /* -----------------------------
      FINAL SUBMIT
  ----------------------------- */
  const handleSubmitAll = async (values) => {
    try {
      const avatarBase64 = file ? await toBase64(file) : null;

      const { data, error } = await supabase.functions.invoke("signup-user", {
        body: {
          fullName: values.fullName,
          email: invite.email,
          password: values.password,
          token,
          workspaceId: invite.workspace_id,
          avatarBase64,
          allowedChannelsFromInvite: invite.allowedChannels,
        },
      });

      if (error) {
        dispatch(
          addToast({ message: "Signup failed. Try again.", type: "error" })
        );
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: invite.email,
        password: values.password,
      });

      if (loginError) {
        dispatch(addToast({ message: "Login failed.", type: "error" }));
        return;
      }

      navigate(data.redirect);
    } catch (err) {
      console.error(err);
    }
  };

  /* -----------------------------
      COMBINED VALIDATION SCHEMA
  ----------------------------- */
  const combinedValidation = fullNameSchema
    .concat(contactSchema)
    .concat(passwordSchema);

  /* -----------------------------
      UI RENDER
  ----------------------------- */

  if (error) {
    return <p className="text-red-500 text-center mt-6">{error}</p>;
  }

  return (
    <div className="h-screen bg-(--background) flex items-center justify-center p-6 text-(--foreground)">
      <main className="w-full max-w-md p-8 rounded-xl border border-(--border) bg-(--card) backdrop-blur-xl">
        <div className="flex items-center justify-center w-full">
          <img src={bgImg} alt="logo" className="h-20 w-20 object-cover" />
        </div>

        <h1 className="text-center text-2xl font-bold bg-linear-to-br from-(--primary) to-(--primary-foreground) bg-clip-text text-transparent">
          Welcome to Mudaris Academy
        </h1>
        <h2 className="text-center text-xl mt-2 font-semibold">
          Create Your Account
        </h2>

        <Formik
          initialValues={{
            fullName,
            email: invite?.email || "",
            avatarFile: null,
            password: "",
          }}
          validationSchema={combinedValidation}
          onSubmit={handleSubmitAll}
        >
          {({ setFieldValue, touched, errors }) => (
            <Form className="space-y-6 mt-8">
              {/* Full Name */}
              <div>
                <Field
                  name="fullName"
                  type="text"
                  placeholder="full name"
                  className="w-full border p-3 text-(--primary-foreground) bg-(--input) border-(--border) rounded focus:outline-none focus:ring-2 focus:ring-purple transition border-b-2 backdrop-blur-sm"
                />
                <ErrorMessage
                  name="fullName"
                  className="text-red-500 text-sm"
                  component="div"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <Field
                    name="email"
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`w-full border p-3 text-(--primary-foreground) bg-(--input) border-(--border) rounded focus:outline-none focus:ring-2 focus:ring-purple transition border-b-2 backdrop-blur-sm ${
                      touched.email && errors.email
                        ? "border-(--destructive)"
                        : ""
                    }`}
                    placeholder="Email"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  className="text-red-500 text-sm"
                  component="div"
                />
              </div>
              {/* Avatar */}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  className={"h-10 text-(--foreground)"}
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setFieldValue("avatarFile", e.target.files[0]);
                  }}
                />
              </div>
              {/* Password */}
              <div className="mb-6">
                <div className="relative flex justify-end items-center">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={` border p-3 w-full  text-(--primary-foreground) bg-(--input) border-(--border) rounded focus:outline-none focus:ring-2 focus:ring-purple transition border-b-2 backdrop-blur-sm ${
                      touched.password && errors.password
                        ? "border-(--destructive)"
                        : ""
                    }`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="text-white absolute right-3"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-(--destructive) text-xs mt-1"
                />
              </div>
              {/* Submit */}
              <Button
                type="submit"
                className={"w-full h-[45px]"}
                variant="success"
              >
                Create Account
              </Button>
              <div className="text-center text-xs">
                <Link
                  to="/"
                  className="
                text-center text-sm hover:underline cursor-pointer w-full
                text-(--chart-4)
                "
                >
                  {" "}
                  Already have account
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
};

export default Signup;
