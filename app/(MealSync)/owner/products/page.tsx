"use client";

import React, { useEffect, useState, useId } from "react";
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../../components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { CircleAlertIcon } from "lucide-react";
import { SelectNative } from "@/components/ui/select-native";
import { getSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  total_sold: number;
  is_available: boolean;
  category_id?: string | null;
}

interface Category {
  is_active: boolean;
  id: string;
  name: string;
}

const AddProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [alertAction, setAlertAction] = useState<{ type: "delete" | "toggle"; product: Product } | null>(null);

  const categoryId = useId();

  // Fetch restaurant id
  const fetchRestaurantId = async () => {
    try {
      const session = await getSession();
      if (!session?.user?.id) return toast.error("Unauthorized");

      const res = await axios.get("/api/owner/restaurant", { withCredentials: true });
      if (res.data.success && res.data.restaurant) setRestaurantId(res.data.restaurant.id);
    } catch {
      toast.error("Failed to fetch restaurant");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!restaurantId) return;
    try {
      const res = await axios.post(
        "/api/owner/categories/get",
        { restaurant_id: restaurantId },
        { withCredentials: true }
      );
      if (res.data.success) setCategories(res.data.data);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.post("/api/owner/products/fetchproducts", { restaurant_id: restaurantId });
      setProducts(res.data);
    } catch {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchRestaurantId();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
      fetchProducts();
    }
  }, [restaurantId]);

  // Formik
  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      stock: "",
      category_id: "",
      description: "",
      return_policy: "",
      images: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      price: Yup.number().required("Price is required").positive("Must be positive"),
      stock: Yup.number().required("Stock is required").min(0, "Cannot be negative"),
      category_id: Yup.string().required("Category is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          price: Number(values.price),
          stock: Number(values.stock),
          images: values.images.split(",").map((url) => url.trim()),
          restaurant_id: restaurantId,
        };

        if (editingProduct) {
          await axios.post("/api/owner/products/update", { id: editingProduct.id, ...payload });
          toast.success("Product updated successfully!");
          setEditingProduct(null);
          setIsEditDialogOpen(false);
        } else {
          await axios.post("/api/owner/products/create", payload);
          toast.success("Product added successfully!");
          setIsAddDialogOpen(false);
        }
        resetForm();
        fetchProducts();
      } catch {
        toast.error("Failed to save product");
      }
    },
  });

  // Delete product
  const handleDelete = async (product: Product) => {
    try {
      await axios.post("/api/owner/products/delete", { id: product.id });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setAlertAction(null);
    }
  };

  // Toggle active/inactive
  const handleToggle = async (product: Product) => {
    try {
      await axios.post("/api/owner/products/update", { id: product.id, is_available: !product.is_available });
      toast.success(`Product ${product.is_available ? "deactivated" : "activated"} successfully`);
      fetchProducts();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setAlertAction(null);
    }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "stock", header: "Stock" },
    { id: "total_sold", header: "Total Sold", accessorFn: (row) => row.total_sold },
    { id: "remaining", header: "Remaining", accessorFn: (row) => row.stock - row.total_sold },
    { id: "status", header: "Status", accessorFn: (row) => (row.is_available ? "Active" : "Inactive") },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">⋮</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setEditingProduct(row.original);
                formik.setValues({
                  name: row.original.name,
                  price: String(row.original.price),
                  stock: String(row.original.stock),
                  category_id: row.original.category_id || "",
                  description: "",
                  return_policy: "",
                  images: "",
                });
                setIsEditDialogOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>

            {/* Delete */}
            <DropdownMenuItem
              onClick={() => setAlertAction({ type: "delete", product: row.original })}
            >
              Delete
            </DropdownMenuItem>

            {/* Toggle Active */}
            <DropdownMenuItem
              onClick={() => setAlertAction({ type: "toggle", product: row.original })}
            >
              {row.original.is_available ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gradient">Products Management</h1>

      <div className="flex justify-between items-center mb-4 gap-2">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />

        {/* Add Product */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" {...formik.getFieldProps("name")} placeholder="Product Name" />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" {...formik.getFieldProps("price")} placeholder="Price" />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...formik.getFieldProps("stock")} placeholder="Stock" />
              </div>

              {/* Category Select */}
             {/* Category Select */}
<div>
  <Label htmlFor={categoryId}>Category</Label>
  <SelectNative
    id={categoryId}
    value={formik.values.category_id}
    onChange={(e) => formik.setFieldValue("category_id", e.target.value)}
      className="bg-primary-foreground text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <option value="">Select Category</option>
    {categories
      .filter((cat) => cat.is_active) // Only show active categories
      .map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
  </SelectNative>
  {formik.touched.category_id && formik.errors.category_id && (
    <p className="text-red-500">{formik.errors.category_id}</p>
  )}
</div>


              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...formik.getFieldProps("description")} placeholder="Description" />
              </div>
              <div>
                <Label htmlFor="return_policy">Return Policy</Label>
                <Input id="return_policy" {...formik.getFieldProps("return_policy")} placeholder="Return Policy" />
              </div>
              <div>
                <Label htmlFor="images">Images (comma separated URLs)</Label>
                <Input id="images" {...formik.getFieldProps("images")} placeholder="Image URLs" />
              </div>
              <DialogFooter>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <DataTable columns={columns} data={filteredProducts} />

      {/* AlertDialog for Delete / Toggle */}
      {alertAction && (
        <AlertDialog open={!!alertAction} onOpenChange={() => setAlertAction(null)}>
          <AlertDialogContent>
            <div className="flex gap-4 items-center mb-4">
              <CircleAlertIcon size={24} className="opacity-80" />
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {alertAction.type === "delete" ? "Delete Product" : alertAction.product.is_available ? "Deactivate Product" : "Activate Product"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {alertAction.type === "delete"
                    ? `Are you sure you want to delete "${alertAction.product.name}"? This action cannot be undone.`
                    : `Are you sure you want to ${alertAction.product.is_available ? "deactivate" : "activate"} "${alertAction.product.name}"?`}
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  alertAction.type === "delete" ? handleDelete(alertAction.product) : handleToggle(alertAction.product)
                }
              >
                {alertAction.type === "delete" ? "Delete" : alertAction.product.is_available ? "Deactivate" : "Activate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AddProductPage;
