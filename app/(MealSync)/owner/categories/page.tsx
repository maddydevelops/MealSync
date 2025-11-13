"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { DataTable } from "../../../../components/ui/data-table";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../../../components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

import { getSession } from "next-auth/react";

// ConfirmDialog component
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="mb-4">{description}</p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

const AddCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string>("");

  const fetchRestaurantId = async () => {
    try {
      const session = await getSession();
      if (!session?.user?.id) {
        toast.error("Unauthorized: No session found");
        return;
      }

      const res = await axios.get("/api/owner/restaurant", { withCredentials: true });
      if (res.data.success && res.data.restaurant) {
        setRestaurantId(res.data.restaurant.id);
      } else {
        toast.error("No restaurant found for this owner");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch restaurant");
    }
  };

  const fetchCategories = async () => {
    if (!restaurantId) return;
    try {
      const res = await axios.post(
        "/api/owner/categories/get",
        { restaurant_id: restaurantId },
        { withCredentials: true }
      );
      if (res.data.success) setCategories(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchRestaurantId();
  }, []);

  useEffect(() => {
    if (restaurantId) fetchCategories();
  }, [restaurantId]);

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Category name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!restaurantId) return toast.error("Restaurant ID missing");

      try {
        if (editingCategory) {
          await axios.post(
            "/api/owner/categories/update",
            { category_id: editingCategory.id, name: values.name },
            { withCredentials: true }
          );
          toast.success("Category updated");
          setEditingCategory(null);
        } else {
          await axios.post(
            "/api/owner/categories/create",
            { restaurant_id: restaurantId, name: values.name },
            { withCredentials: true }
          );
          toast.success("Category created");
          setAddDialogOpen(false);
        }
        resetForm();
        fetchCategories();
      } catch (error) {
        console.error(error);
        toast.error("Failed to save category");
      }
    },
  });

  const handleDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await axios.post(
        "/api/owner/categories/delete",
        { category_id: deleteCategoryId },
        { withCredentials: true }
      );
      toast.success("Category deleted");
      setConfirmDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  const handleToggle = async (category: Category) => {
    try {
      await axios.post(
        "/api/owner/categories/update",
        { category_id: category.id, is_active: !category.is_active },
        { withCredentials: true }
      );
      toast.success("Category status updated");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (row.original.is_active ? "Active" : "Inactive"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">⋮</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingCategory(row.original);
                formik.setFieldValue("name", row.original.name);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDeleteCategoryId(row.original.id);
                setConfirmDialogOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggle(row.original)}
            >
              {row.original.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gradient">Categories Management</h1>

      <div className="flex justify-between items-center mb-4 gap-2">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  {...formik.getFieldProps("name")}
                  placeholder="Category Name"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500">{formik.errors.name}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {editingCategory && (
          <Dialog
            open={!!editingCategory}
            onOpenChange={(open) => !open && setEditingCategory(null)}
          >
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    {...formik.getFieldProps("name")}
                    placeholder="Category Name"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500">{formik.errors.name}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Update</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable columns={columns} data={filteredCategories} />

      {/* Confirm Dialog for deletion */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialogOpen(false)}
      />
    </div>
  );
};

export default AddCategoryPage;
