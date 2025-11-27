"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useGetAuthUserQuery } from "@/state/api";
import { login, logout } from "@/utils/actions";
import toast, { Toaster } from "react-hot-toast";
import { useMatrixStore } from "@/store/matrixStore";
import { initializeMatrixClient } from "@/lib/matrixUtils";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const supabase = createClient();
  const { data: authData, refetch, isLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setMatrixCredentials = useMatrixStore(
    (state) => state.setMatrixCredentials
  );

  console.log("authData in LoginForm:", authData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function getUserDetails() {
    const { data, error } = await supabase.from("user").select("*").single();

    if (error) {
      console.error("Error fetching user details:", error);
      return;
    }
    // setName(data.firstName || "User");
    // setAvatarUrl(
    //   data.avatarUrl
    //     ? `${data.avatarUrl}`
    //     : null
    // );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("email", formData.email);
      form.append("password", formData.password);

      const { data, error } = await login(form);
      // setSession(data);
      // setName(data.session?.user?.user_metadata?.name || "User");

      if (error) {
        setError(error.message || "Login failed");
        return;
      }

      toast.success("Login Successful!");
      // await getUserDetails();

      // Refetch auth user to get Matrix credentials
      const { data: authUserData } = await refetch();

      // Initialize Matrix if credentials are available (only on client side)
      if (typeof window !== "undefined" && authUserData?.matrix) {
        try {
          setMatrixCredentials({
            matrixUserId: authUserData.matrix.matrixUserId,
            matrixAccessToken: authUserData.matrix.matrixAccessToken,
            matrixHomeserver: authUserData.matrix.matrixHomeserver,
          });

          // Wait a bit for Matrix SDK to load, then initialize
          setTimeout(() => {
            try {
              initializeMatrixClient(
                authUserData.matrix.matrixUserId,
                authUserData.matrix.matrixAccessToken,
                authUserData.matrix.matrixHomeserver
              );
              console.log("Matrix client initialized successfully");
            } catch (matrixInitError) {
              console.error(
                "Failed to initialize Matrix client:",
                matrixInitError
              );
            }
          }, 500);
        } catch (matrixError) {
          console.error("Failed to set Matrix credentials:", matrixError);
          // Don't block login if Matrix fails
        }
      }

      setFormData({ email: "", password: "" });
      // closeModal();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (authData?.user && authData?.user.role === "ADMIN") {
      console.log("User already logged in, redirecting...");
      // Redirect to dashboard or another page
     router.push("/dashboard");
    }else{
      console.log("No authenticated admin user found.");
      toast.error("unuthorized access, logging out...");
      logout();
    }
  }, [authData, isLoading, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  onChange={handleChange}
                  value={formData.email}
                  disabled={loading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  onChange={handleChange}
                  value={formData.password}
                  disabled={loading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner /> Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
