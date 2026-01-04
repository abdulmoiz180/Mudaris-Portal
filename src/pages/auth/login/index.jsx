import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema } from "@/validation/authSchema";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/features/auth/authSlice";
import bgImg from "@/assets/images/GrowthIcon.png";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, session, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (!session) return;
    navigate(`/dashboard/${session.user.id}`);
  }, [session]);

  return (
    <section className="w-full h-screen bg-(--background) flex items-center justify-center">
      <main className="max-w-2xl w-fit min-w-2xs p-7 rounded bg-(--card) flex items-center justify-center border border-(--border)">
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={loginSchema}
          onSubmit={(values, { setSubmitting }) => {
            dispatch(loginUser(values));
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form
              className="flex flex-col items-center  gap-2"
              aria-label="Login form"
            >
              <img src={bgImg} alt="logo" className="w-12.5 h-12.5 " />
              <h2 className="text-3xl text-center font-bold text-(--foreground) dm-sans">
                Mudaris Academy{" "}
              </h2>
              <p className="text-(--primary-foreground)">
                Enter your account details
              </p>
              <div className="w-full">
                <div className="mb-5">
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`w-full border p-3 text-(--primary-foreground) bg-(--input) border-(--border) rounded focus:outline-none focus:ring-2 focus:ring-purple transition border-b-2 backdrop-blur-sm ${touched.email && errors.email
                      ? "border-(--destructive)"
                      : ""
                      }`}
                    placeholder="Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-(--destructive) text-xs mt-1"
                  />
                </div>

                <div className="mb-6">
                  <div className="relative flex justify-end items-center">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={` border p-3 w-full  text-(--primary-foreground) bg-(--input) border-(--border) rounded focus:outline-none focus:ring-2 focus:ring-purple transition border-b-2 backdrop-blur-sm ${touched.password && errors.password
                        ? "border-(--destructive)"
                        : ""
                        }`}
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="text-(--chart-4) absolute right-3"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {error && (
                    <p
                      role="alert"
                      className="w-full text-center text-sm text-(--destructive) mb-2"
                    >
                      Email or password is incorrect!
                    </p>
                  )}

                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-(--destructive) text-xs mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                variant={"success"}
                className={"w-full h-11.5"}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
              <div className="text-(--foreground) text-center text-xs">
                

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500  font-bold underline"
                >
                  Forgot password?
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </main>
    </section>
  );
};

export default Login;
