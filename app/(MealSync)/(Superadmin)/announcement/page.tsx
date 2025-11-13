"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "sonner";

type Announcement = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("/api/superadmin/announcement/get");
      setAnnouncements(res.data.filter((a: any) => !a.deleted));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch announcements");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Formik for create/edit
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: editingAnnouncement
      ? { title: editingAnnouncement.title, description: editingAnnouncement.description }
      : { title: "", description: "" },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (editingAnnouncement) {
          const res = await axios.post("/api/superadmin/announcement", {
            action: "update",
            id: editingAnnouncement.id,
            ...values,
          });
          setAnnouncements(
            announcements.map((a) => (a.id === editingAnnouncement.id ? res.data : a))
          );
          toast.success("Announcement updated successfully!");
        } else {
          const res = await axios.post("/api/superadmin/announcement", {
            action: "create",
            ...values,
          });
          setAnnouncements([res.data, ...announcements]);
          toast.success("Announcement created successfully!");
        }
        setOpenDialog(false);
        setEditingAnnouncement(null);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    },
  });

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;
    try {
      await axios.post("/api/superadmin/announcement", {
        action: "delete",
        id: deletingAnnouncement.id,
      });
      setAnnouncements(announcements.filter((a) => a.id !== deletingAnnouncement.id));
      toast.success("Announcement deleted successfully!");
      setDeletingAnnouncement(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [announcements, searchQuery]);

  return (
    <section className="p-6 bg-background min-h-screen space-y-6">
      <Card className="bg-card text-card-foreground shadow-sm border-border">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-semibold text-gradient">Announcements Management</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search announcements..."
              className="w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground flex items-center gap-1 hover:opacity-90">
                  <Plus size={16} /> Add Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-card text-card-foreground border-border shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-primary">
                    {editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 gap-4 py-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      name="title"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.title && formik.errors.title && (
                      <p className="text-red-500 text-sm">{formik.errors.title}</p>
                    )}
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.description && formik.errors.description && (
                      <p className="text-red-500 text-sm">{formik.errors.description}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-primary text-primary-foreground hover:opacity-90">
                      {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAnnouncements.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No announcements found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{a.description}</TableCell>
                      <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingAnnouncement(a);
                                setOpenDialog(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingAnnouncement(a)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {deletingAnnouncement && (
        <AlertDialog
          open={!!deletingAnnouncement}
          onOpenChange={(open) => !open && setDeletingAnnouncement(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting this announcement will mark it as deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingAnnouncement(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive border border-muted-foreground hover:bg-destructive/90"
                onClick={handleDelete}
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
