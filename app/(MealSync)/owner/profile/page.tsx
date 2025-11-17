"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

const [form, setForm] = useState({
  first_name: session?.user?.first_name || "",
  last_name: session?.user?.last_name || "",
  email: session?.user?.email || "",
  phoneNumber: session?.user?.phoneNumber || "",
  company_name: session?.user?.company_name || "",
  address: session?.user?.address || "",
  cnic: session?.user?.cnic || "",
  shopLocation: session?.user?.shopLocation || "",
});

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Please login to view profile</p>;

  const handleUpdate = async () => {
    try {
      // Replace with your API endpoint to update user profile
      await axios.put("/api/user/update", form);
      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <section className="p-6 bg-background min-h-screen flex justify-center items-start">
      <Card className="w-full max-w-md shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gradient">User Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p><strong>Name:</strong> {session.user.first_name} {session.user.last_name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Phone:</strong> {session.user.phoneNumber || "-"}</p>
          <p><strong>Company:</strong> {session.user.company_name || "-"}</p>
          <p><strong>Address:</strong> {session.user.address || "-"}</p>
          <p><strong>CNIC:</strong> {session.user.cnic || "-"}</p>
          <p><strong>City/Shop Location:</strong> {session.user.shopLocation || "-"}</p>
          <p><strong>Role:</strong> {session.user.role}</p>
        </CardContent>

        <CardFooter>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground w-full">
                Update Profile
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-card border border-border max-w-md">
              <DialogHeader>
                <DialogTitle>Update Profile</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-3 py-2">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CNIC</Label>
                  <Input
                    value={form.cnic}
                    onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Shop Location</Label>
                  <Input
                    value={form.shopLocation}
                    onChange={(e) => setForm({ ...form, shopLocation: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleUpdate} className="bg-primary text-primary-foreground w-full">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </section>
  );
}
