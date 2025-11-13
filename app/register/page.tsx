"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import registerBg from "../../assests/hero-dish.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Subscription = {
  id: string;
  name: string;
};

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must be a number"),
  companyName: Yup.string().required("Company name is required"),
  cnic: Yup.string(),
  address: Yup.string(),
  shopLocation: Yup.string().required("Shop Location is required"),
  subscription: Yup.object().nullable().required("Please select a subscription"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    // Fetch subscriptions from backend
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get("/api/superadmin/subscription/get");
        setSubscriptions(res.data.filter((sub: any) => !sub.is_deleted));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load subscriptions");
      }
    };
    fetchSubscriptions();
  }, []);

  const formik = useFormik<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
    cnic: string;
    address: string;
    shopLocation: string;
    subscription: Subscription | null;
  }>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      companyName: "",
      cnic: "",
      address: "",
      shopLocation: "",
      subscription: null,
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      // Toast validation errors manually
      if (!values.subscription) {
        toast.error("Please select a subscription");
        setSubmitting(false);
        return;
      }

      try {
        const payload = {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          phone_number: values.phoneNumber,
          company_name: values.companyName,
          cnic: values.cnic,
          address: values.address,
          city: values.shopLocation,
          role: "owner",
          subscription: values.subscription?.name,
        };

        await axios.post("/api/superadmin/user/create", payload);

        toast.success("Account created successfully!");
        router.push("/login");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Registration failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={registerBg.src}
          alt="Background"
          className="w-full h-full object-cover opacity-40 animate-zoom-slow"
        />
        <div className="absolute inset-0 from-background/80 via-background/60 to-background bg-gradient-to-br"></div>
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-2xl p-6 bg-card text-card-foreground rounded-xl shadow-2xl animate-fade-up">
        <h2 className="text-3xl font-bold text-center text-gradient mb-6">
          Create Account
        </h2>

        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* First Name */}
          <div>
            <Label>First Name</Label>
            <Input
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-input text-foreground px-3 py-2"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-red-500 text-sm">{formik.errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label>Last Name</Label>
            <Input
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-input text-foreground px-3 py-2"
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-red-500 text-sm">{formik.errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-input text-foreground px-3 py-2"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-input text-foreground px-3 py-2"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-input text-foreground px-3 py-2"
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <p className="text-red-500 text-sm">{formik.errors.phoneNumber}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <Label>Company Name</Label>
            <Input
              name="companyName"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-input text-foreground px-3 py-2"
            />
            {formik.touched.companyName && formik.errors.companyName && (
              <p className="text-red-500 text-sm">{formik.errors.companyName}</p>
            )}
          </div>

          {/* CNIC */}
          <div>
            <Label>CNIC</Label>
            <Input
              name="cnic"
              value={formik.values.cnic}
              onChange={formik.handleChange}
              className="bg-input text-foreground px-3 py-2"
            />
          </div>

          {/* Address */}
          <div>
            <Label>Address</Label>
            <Input
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              className="bg-input text-foreground px-3 py-2"
            />
          </div>

          {/* Shop Location */}
          <div>
            <Label>Shop Location</Label>
            <Input
              name="shopLocation"
              value={formik.values.shopLocation}
              onChange={formik.handleChange}
              className="bg-input text-foreground px-3 py-2"
            />
            {formik.touched.shopLocation && formik.errors.shopLocation && (
              <p className="text-red-500 text-sm">{formik.errors.shopLocation}</p>
            )}
          </div>

          {/* Subscription (Shadcn Dropdown) */}
          <div className="col-span-2">
            <Label>Subscription</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} className="w-full text-left">
                  {formik.values.subscription?.name || "Select Subscription"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="">
                {subscriptions.map((sub) => (
                  <DropdownMenuItem 
                    key={sub.id}
                    onClick={() => formik.setFieldValue("subscription", sub)}
                  >
                    {sub.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {formik.touched.subscription && formik.errors.subscription && (
              <p className="text-red-500 text-sm">{formik.errors.subscription}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="col-span-2 mt-4">
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-linear-to-r from-green-500 to-green-700 text-white font-semibold py-2 rounded-md shadow-glow hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex justify-center items-center"
            >
              {formik.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Registering...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>

          {/* Link to login */}
          <div className="col-span-2 text-center mt-2 text-sm">
            Already have an account?{" "}
            <span
              className="text-primary font-semibold cursor-pointer hover:underline"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
