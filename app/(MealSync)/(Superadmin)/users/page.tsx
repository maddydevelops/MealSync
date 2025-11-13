"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpDown, Search, UserPlus, MoreHorizontal } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Subscription = {
  id: string;
  name: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  companyName?: string;
  subscription?: { id: string; name: string } | null;
  cnic?: string;
  address?: string;
  shopLocation?: string;
  phoneNumber?: string;
  status: "Active" | "Inactive";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get("/api/superadmin/subscription/get");
      setSubscriptions(res.data.filter((sub: any) => !sub.is_deleted));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscriptions");
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/superadmin/user/get");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.success("Users loaded successfully");
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchUsers();
  }, []);

  const formik = useFormik<Omit<User, "id" | "status">>({
    enableReinitialize: true,
    initialValues: editingUser
      ? {
          firstName: editingUser.firstName || "",
          lastName: editingUser.lastName || "",
          email: editingUser.email || "",
          password: "",
          companyName: editingUser.companyName || "",
          subscription: editingUser.subscription || null,
          cnic: editingUser.cnic || "",
          address: editingUser.address || "",
          shopLocation: editingUser.shopLocation || "",
          phoneNumber: editingUser.phoneNumber || "",
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          companyName: "",
          subscription: null,
          cnic: "",
          address: "",
          shopLocation: "",
          phoneNumber: "",
        },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: editingUser
        ? Yup.string()
        : Yup.string().required("Password is required"),
      companyName: Yup.string().required("Company name is required"),
      subscription: Yup.object().nullable().required("Select a subscription"),
      phoneNumber: Yup.string().required("Phone number is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (editingUser) {
          const res = await axios.put("/api/superadmin/user/update", {
            id: editingUser.id,
            ...values,
            subscription_id: values.subscription?.id,
          });
          toast.success("User updated successfully!");
          setUsers(
            users.map((u) =>
              u.id === editingUser.id
                ? {
                    ...res.data,
                    subscription: res.data.owned_subscription
                      ? {
                          id: res.data.owned_subscription.id,
                          name: res.data.owned_subscription.name,
                        }
                      : null,
                    status: res.data.is_active ? "Active" : "Inactive",
                  }
                : u
            )
          );
        } else {
          const res = await axios.post("/api/superadmin/user/create", {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            password: values.password,
            phone_number: values.phoneNumber,
            address: values.address,
            city: values.shopLocation,
            company_name: values.companyName,
            cnic: values.cnic,
            subscription_id: values.subscription?.id,
            role: "owner",
          });
          toast.success("User added successfully!");
          setUsers([
            ...users,
            {
              id: res.data.id,
              ...values,
              status: "Active",
            },
          ]);
        }
        setOpen(false);
        setEditingUser(null);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    },
  });

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await axios.delete("/api/superadmin/user/delete", {
        data: { id: deletingUser.id },
      });
      toast.success("User deleted successfully!");
      setUsers(users.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";

      // Only send what backend needs
      await axios.put("/api/superadmin/user/update", {
        id: user.id,
        is_active: newStatus === "Active",
      });

      // Update local state
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      toast.success(`User status updated to ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredUsers = users
    .filter(
      (u) =>
        u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? (a.firstName || "").localeCompare(b.firstName || "")
        : (b.firstName || "").localeCompare(a.firstName || "")
    );

  return (
    <section className="p-6 space-y-6 bg-background text-foreground animate-fade-up min-h-screen">
      <Card className="bg-card text-card-foreground shadow-sm border-border">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gradient">
            Users Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-56 bg-input border-border text-foreground"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSortAsc(!sortAsc)}
              className="border-border hover:bg-accent transition-all"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:opacity-90 transition-all">
                  {editingUser ? "Edit User" : "Add User"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-card text-card-foreground border-border shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-primary">
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={formik.handleSubmit}
                  className="grid grid-cols-2 gap-4 py-2"
                >
                  <div>
                    <Label>First Name</Label>
                    <Input
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.phoneNumber &&
                      formik.errors.phoneNumber && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.phoneNumber}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      name="companyName"
                      value={formik.values.companyName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.companyName &&
                      formik.errors.companyName && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.companyName}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label>CNIC</Label>
                    <Input
                      name="cnic"
                      value={formik.values.cnic}
                      onChange={formik.handleChange}
                      className="bg-input text-foreground"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      className="bg-input text-foreground"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Subscription</Label>
                    <select
                      name="subscription"
                      value={formik.values.subscription?.id || ""}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "subscription",
                          subscriptions.find(
                            (sub) => sub.id === e.target.value
                          ) || null
                        )
                      }
                      className="w-full p-2 bg-input border border-border text-foreground rounded"
                    >
                      <option value="">Select Subscription</option>
                      {subscriptions.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.subscription &&
                      formik.errors.subscription && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.subscription}
                        </p>
                      )}
                  </div>
                  <div className="col-span-2">
                    <Label>Shop Location</Label>
                    <Input
                      name="shopLocation"
                      value={formik.values.shopLocation}
                      onChange={formik.handleChange}
                      className="bg-input text-foreground"
                    />
                  </div>
                  <DialogFooter className="col-span-2">
                    <Button
                      type="submit"
                      className="bg-primary text-primary-foreground hover:opacity-90"
                    >
                      Save User
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border mt-2">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Company</th>
                    <th className="p-2 text-left">Subscription</th>
                    <th className="p-2 text-left">CNIC</th>
                    <th className="p-2 text-left">Phone Number</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-2">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.companyName}</td>
                      <td className="p-2">{user.subscription?.name || ""}</td>
                      <td className="p-2">{user.cnic}</td>
                      <td className="p-2">{user.phoneNumber}</td>
                      <td className="p-2">{user.status}</td>
                      <td className="p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.status === "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user);
                                setOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingUser(user)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UserPlus />
                  </EmptyMedia>
                  <EmptyTitle>No User Found</EmptyTitle>
                  <EmptyDescription>
                    Add User to your restaurant
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setOpen(true)}>Add data</Button>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </CardContent>
      </Card>
      {deletingUser && (
        <AlertDialog
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting this user will remove all
                their data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingUser(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive border border-muted-foreground hover:bg-destructive/90"
                onClick={handleConfirmDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
}
