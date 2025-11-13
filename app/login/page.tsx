"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import loginBg from "../../assests/hero-dish.jpg";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Login successful!");
          router.push("/dashboard");
        }
      } catch {
        toast.error("Login failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBg.src}
          alt="Elegant background"
          className="w-full h-full object-cover opacity-40 animate-zoom-slow"
        />
        <div className="absolute inset-0 bg-linear-to-br from-background/80 via-background/60 to-background"></div>
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-lg p-8 md:p-12 shadow-2xl rounded-xl animate-fade-up">
        <CardHeader>
          <CardTitle className="text-center text-3xl md:text-4xl font-bold text-gradient mb-6">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {["email", "password"].map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{field.toUpperCase()}</Label>
                <Input
                  id={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={`Enter your ${field}`}
                  {...formik.getFieldProps(field)}
                  className="bg-input text-foreground focus:ring-2 focus:ring-green-400"
                />
                {formik.touched && formik.errors && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors[field as keyof typeof formik.values]}
                  </p>
                )}
                {/* Forgot Password Link */}
                {field === "password" && (
                  <div className="text-right mt-1">
                    <a
                      href="/forgot-password"
                      className="text-green-500 hover:underline text-sm"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-linear-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-lg shadow-glow hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex justify-center items-center"
            >
              {formik.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>

            {/* Create Account Link */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="text-green-500 hover:underline font-medium"
              >
                Create account
              </a>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-sm text-muted-foreground z-10">
        © 2025 MealSync. All rights reserved.
      </div>
    </section>
  );
}
