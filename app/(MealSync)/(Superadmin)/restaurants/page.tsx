"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UserPlus, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import debounce from "lodash.debounce";
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

type User = {
  id: string;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Restaurant = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  owner: User;
};

type SortConfig = {
  key: keyof Restaurant;
  direction: "asc" | "desc";
};

export default function RestaurantsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] =
    useState<Restaurant | null>(null);

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

  const fetchRestaurants = async () => {
    try {
      const res = await axios.post("/api/superadmin/restuarants/fetch", {});
      if (res.data && Array.isArray(res.data)) setRestaurants(res.data);
    } catch {
      toast.error("Failed to fetch restaurants");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      address: "",
      city: "",
      country: "",
      owner_id: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Restaurant name is required"),
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      country: Yup.string().required("Country is required"),
      owner_id: Yup.string().required("Assign a user"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await axios.post(
          "/api/superadmin/restuarants/create",
          values
        );
        toast.success("Restaurant created successfully!");
        setRestaurants([...restaurants, res.data]);
        resetForm();
        setOpen(false);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to create restaurant"
        );
      }
    },
  });

  const deleteRestaurant = (restaurant: Restaurant) => {
    setDeletingRestaurant(restaurant);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRestaurant) return;
    try {
      await axios.post("/api/superadmin/restuarants/delete", {
        id: deletingRestaurant.id,
      });
      toast.success("Restaurant deleted successfully!");
      setRestaurants(restaurants.filter((r) => r.id !== deletingRestaurant.id));
      setDeletingRestaurant(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete restaurant");
    }
  };

  const handleSort = (key: keyof Restaurant) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aKey = a[sortConfig.key];
        const bKey = b[sortConfig.key];
        if (typeof aKey === "string" && typeof bKey === "string") {
          return sortConfig.direction === "asc"
            ? aKey.localeCompare(bKey)
            : bKey.localeCompare(aKey);
        }
        return 0;
      });
    }

    return filtered;
  }, [restaurants, searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredRestaurants.length / rowsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }, 300),
    []
  );

  return (
    <section className="p-6 space-y-6 bg-background text-foreground min-h-screen">
      <Card className="bg-card text-card-foreground shadow-sm border-border">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gradient">
            Restaurants Management
          </h2>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search Restaurants..."
              className="w-full md:w-64"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:opacity-90 transition-all">
                  Add Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-card text-card-foreground border-border shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-primary">
                    Add New Restaurant
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={formik.handleSubmit}
                  className="grid grid-cols-1 gap-4 py-2"
                >
                  <div>
                    <Label>Restaurant Name</Label>
                    <Input
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.address && formik.errors.address && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.city && formik.errors.city && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="bg-input text-foreground"
                    />
                    {formik.touched.country && formik.errors.country && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.country}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Assign to User</Label>
                    <select
                      name="owner_id"
                      value={formik.values.owner_id}
                      onChange={formik.handleChange}
                      className="w-full p-2 bg-input border border-border text-foreground rounded"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                    {formik.touched.owner_id && formik.errors.owner_id && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.owner_id}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-primary text-primary-foreground hover:opacity-90"
                    >
                      Create Restaurant
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {paginatedRestaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">
                No Restaurants Found.
              </p>
              <Button onClick={() => setOpen(true)} className="mt-2">
                Add Restaurant
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["name", "address", "city", "country", "owner"].map(
                      (col) => (
                        <TableHead
                          key={col}
                          className="cursor-pointer"
                          onClick={() => handleSort(col as keyof Restaurant)}
                        >
                          <div className="flex items-center gap-1">
                            {col.charAt(0).toUpperCase() + col.slice(1)}
                            {sortConfig?.key === col &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              ))}
                          </div>
                        </TableHead>
                      )
                    )}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRestaurants.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.address}</TableCell>
                      <TableCell>{r.city}</TableCell>
                      <TableCell>{r.country}</TableCell>
                      <TableCell>
                        {r.owner?.first_name} {r.owner?.last_name}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => toast("Edit feature coming soon")}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteRestaurant(r)}
                            >
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

      {/* Delete Dialog */}
      {deletingRestaurant && (
        <AlertDialog
          open={!!deletingRestaurant}
          onOpenChange={(open) => !open && setDeletingRestaurant(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting this restaurant will
                remove all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingRestaurant(null)}>
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
