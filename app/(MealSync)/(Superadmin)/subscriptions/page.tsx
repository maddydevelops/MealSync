"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import {
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type Subscription = {
  id: string;
  name: string;
  price: number;
  duration: number;
  itemsAllowed: number;
  status: "active" | "inactive";
};

const SubscriptionPage = () => {
  const [open, setOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    itemsAllowed: "",
  });

  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get("/api/superadmin/subscription/get");
      setSubscriptions(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch subscriptions.");
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Create or Update subscription
  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.duration ||
      !formData.itemsAllowed
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        // Update
        await axios.post("/api/superadmin/subscription/update", {
          id: editingId,
          ...formData,
          price: Number(formData.price),
          duration: Number(formData.duration),
          itemsAllowed: Number(formData.itemsAllowed),
        });
        toast.success("Subscription updated successfully!");
      } else {
        // Create
        await axios.post("/api/superadmin/subscription/create", {
          ...formData,
          price: Number(formData.price),
          duration: Number(formData.duration),
          itemsAllowed: Number(formData.itemsAllowed),
        });
        toast.success("Subscription created successfully!");
      }
      setFormData({ name: "", price: "", duration: "", itemsAllowed: "" });
      setEditingId(null);
      setOpen(false);
      fetchSubscriptions();
    } catch (error) {
      console.error(error);
      toast.error(editingId ? "Error updating subscription." : "Error creating subscription.");
    } finally {
      setLoading(false);
    }
  };

  // Edit subscription
  const handleEdit = (sub: Subscription) => {
    setFormData({
      name: sub.name,
      price: sub.price.toString(),
      duration: sub.duration.toString(),
      itemsAllowed: sub.itemsAllowed.toString(),
    });
    setEditingId(sub.id);
    setOpen(true);
  };

  // Soft delete subscription
  const handleDelete = async (id: string) => {
    try {
      await axios.post("/api/superadmin/subscription/delete", { id });
      toast.success("Subscription deleted successfully.");
      fetchSubscriptions();
    } catch {
      toast.error("Failed to delete subscription.");
    }
  };

  // Update subscription status
  const handleStatus = async (id: string, status: "active" | "inactive") => {
    try {
      await axios.post("/api/superadmin/subscription/update", { id, status });
      toast.success(`Subscription marked as ${status}.`);
      fetchSubscriptions();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // DataTable Columns
  const columns: ColumnDef<Subscription>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "price", header: "Price ($)" },
    { accessorKey: "duration", header: "Duration (Days)" },
    { accessorKey: "itemsAllowed", header: "Items Allowed" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.status === "active"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>

          {row.original.status === "inactive" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatus(row.original.id, "active")}
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatus(row.original.id, "inactive")}
            >
              <XCircle className="w-4 h-4 text-yellow-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-background text-foreground min-h-screen animate-fade-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gradient">
          Subscriptions
        </h1>

        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setEditingId(null); }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-primary text-black hover:bg-primary/90">
              <PlusCircle className="w-5 h-5" />
              {editingId ? "Edit Subscription" : "Create Subscription"}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[480px] border border-border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Subscription" : "Create Subscription"}</DialogTitle>
              <DialogDescription>
                Fill out the form below to {editingId ? "update" : "create"} a subscription plan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Subscription Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Gold Plan"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="29.99"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (Days)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="itemsAllowed">Items Allowed</Label>
                <Input
                  id="itemsAllowed"
                  name="itemsAllowed"
                  type="number"
                  placeholder="10"
                  value={formData.itemsAllowed}
                  onChange={handleChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="bg-primary text-black hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Subscription" : "Create Subscription")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Table */}
      <div className="border rounded-lg shadow-sm bg-card text-card-foreground">
        <DataTable columns={columns} data={subscriptions} />
      </div>
    </div>
  );
};

export default SubscriptionPage;
