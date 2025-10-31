"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { signIn } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
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
          router.push("/dashboard"); // redirect after login
        }
      } catch (err) {
        toast.error("Login failed");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md p-6 shadow-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {["email", "password"].map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{field.toUpperCase()}</Label>
                <Input
                  id={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={`Enter your ${field}`}
                  {...formik.getFieldProps(field)}
                />
                {formik.touched && formik.errors && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors[field as keyof typeof formik.values]}
                  </p>
                )}
              </div>
            ))}
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-purple-600 to-indigo-500 text-white font-semibold py-2 rounded-md shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
