"use client";

import React, { useEffect, useState, useId } from "react";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Tag, TrendingUp } from "lucide-react";
import ChatModal from "@/components/ChatModal";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  is_available: boolean;
  category_id: string;
  images?: string[];
  restaurant_name?: string;
}

const ProductsSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;
  const [chatProduct, setChatProduct] = useState<Product | null>(null);

  // Fetch active categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/landingpage/getcategories");
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  };
  

  // Fetch products
  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/landingpage/fetchproducts"); // GET request
      if (res.data.success) {
        const availableProducts = res.data.products.filter(
          (p: Product) => p.is_available
        );
        setProducts(availableProducts);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="py-12 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header with promotional banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-sale via-red-500 to-pink-500 text-white px-6 py-2 rounded-full mb-4 animate-pulse">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold text-bl text-sm">
              HOT DEALS - LIMITED TIME
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-3 text-gradient">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover amazing deals on quality products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Categories */}
          <aside className="w-full lg:w-64 shrink-0">
            <Card className="p-6 sticky top-24 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Categories</h3>
              </div>

              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium ${
                      selectedCategory === ""
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-secondary"
                    }`}
                  >
                    All Products
                    <span className="float-right text-sm opacity-70">
                      ({products.length})
                    </span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {cat.name}
                      <span className="float-right text-sm opacity-70">
                        (
                        {
                          products.filter((p) => p.category_id === cat.id)
                            .length
                        }
                        )
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {paginatedProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-sm">Try selecting a different category</p>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                  {paginatedProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            No Image
                          </div>
                        )}

                        {/* Sale Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-accent text-sale-foreground font-bold shadow-lg">
                            -20%
                          </Badge>
                        </div>

                        {/* Stock Badge */}
                        {product.stock < 10 && (
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="destructive"
                              className="font-semibold"
                            >
                              Only {product.stock} left!
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Restaurant Name */}
                        {product.restaurant_name && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {product.restaurant_name}
                          </p>
                        )}

                        {/* Product Name */}
                        <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-10">
                          {product.name}
                        </h3>

                        {/* Rating (static for demo) */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < 4
                                  ? "fill-warning text-warning"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            (4.0)
                          </span>
                        </div>

                        {/* Price & Button */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground line-through">
                              ${(product.price * 1.2).toFixed(2)}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 shadow-md"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setChatProduct(product)}
                            >
                              💬 Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {chatProduct && (
  <ChatModal
    isOpen={!!chatProduct}
    onClose={() => setChatProduct(null)}
    product={chatProduct}
  />
)}

    </section>
    
  );
};

export default ProductsSection;
