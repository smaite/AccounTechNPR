import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import type { Category } from "@shared/schema";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!editingCategory;

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description || "",
      });
      setOpen(true);
    }
  }, [editingCategory, form]);

  const categoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const url = isEditing ? `/api/categories/${editingCategory!.id}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} category`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setOpen(false);
      setEditingCategory(null);
      form.reset();
      toast({
        title: "Success",
        description: `Category ${isEditing ? "updated" : "created"} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDelete = (category: Category) => {
    const productsInCategory = products.filter((p: any) => p.categoryId === category.id);
    
    if (productsInCategory.length > 0) {
      toast({
        title: "Cannot delete category",
        description: `This category has ${productsInCategory.length} product(s) assigned to it. Please reassign or delete those products first.`,
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleEditComplete = () => {
    setEditingCategory(null);
    setOpen(false);
  };

  const onSubmit = (data: CategoryFormData) => {
    categoryMutation.mutate(data);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter((product: any) => product.categoryId === categoryId).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories for better organization
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Electronics, Clothing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of this category..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingCategory(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={categoryMutation.isPending}
                  >
                    {categoryMutation.isPending 
                      ? (isEditing ? "Updating..." : "Creating...") 
                      : (isEditing ? "Update Category" : "Create Category")
                    }
                  </Button>
                </div>

                {categoryMutation.error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                    {categoryMutation.error.message}
                  </div>
                )}
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            All Categories ({filteredCategories.length})
          </CardTitle>
          <CardDescription>
            Manage your product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No categories found</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Create your first category to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => {
                  const productCount = getCategoryProductCount(category.id);
                  
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={productCount > 0 ? "default" : "secondary"}>
                          {productCount} product{productCount !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            className="text-destructive hover:text-destructive"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
