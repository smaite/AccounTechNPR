import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Package, Shirt, Home, Book } from "lucide-react";
import { Currency } from "@/components/ui/currency";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AddProductForm from "@/components/forms/AddProductForm";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Success", description: "Product deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleEditComplete = () => {
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { label: "Out of Stock", className: "bg-destructive/10 text-destructive" };
    } else if (product.stockQuantity <= (product.minStockLevel || 5)) {
      return { label: "Low Stock", className: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "In Stock", className: "bg-accent/10 text-accent" };
  };

  const categoryIcons = {
    Electronics: Package,
    Clothing: Shirt,
    "Home & Garden": Home,
    Books: Book,
  };

  const categoryStats = categories.map(category => {
    const count = products.filter(p => p.categoryId === category.id).length;
    const Icon = categoryIcons[category.name as keyof typeof categoryIcons] || Package;
    const colors = ["text-primary", "text-accent", "text-secondary", "text-destructive"];
    const color = colors[categories.indexOf(category) % colors.length];
    
    return {
      ...category,
      count,
      icon: Icon,
      color,
    };
  });

  if (loadingProducts || loadingCategories) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="products-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Product Catalog</h2>
          <p className="text-muted-foreground">Manage your inventory and pricing</p>
        </div>
        <AddProductForm 
          editProduct={editingProduct}
          onEditComplete={handleEditComplete}
        />
      </div>

      {/* Product Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {categoryStats.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCategoryFilter(categoryFilter === category.id ? "all" : category.id)}
                  data-testid={`card-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-4 text-center">
                <Icon className={`w-8 h-8 ${category.color} mb-2 mx-auto`} />
                <p className="font-medium text-foreground">{category.name}</p>
                <p className="text-sm text-muted-foreground">{category.count} items</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products Table */}
      <Card data-testid="card-products">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Product Inventory</CardTitle>
            <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No products found</p>
              <p className="text-sm">Add your first product to get started</p>
              <AddProductForm
                editProduct={editingProduct}
                onEditComplete={handleEditComplete}
              >
                <Button variant="outline" className="mt-4" data-testid="button-add-first-product">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </AddProductForm>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Price (NPR)</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product.id} data-testid={`row-product-${product.id}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {getCategoryName(product.categoryId)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          <Currency amount={product.unitPrice} />
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {product.stockQuantity} {product.unit}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={stockStatus.className}>
                            {stockStatus.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEdit(product)}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(product.id)}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
