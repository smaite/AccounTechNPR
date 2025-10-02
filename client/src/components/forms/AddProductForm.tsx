import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2 } from "lucide-react";
import type { Category, InsertProduct, Product } from "@shared/schema";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  unitPrice: z.string().min(1, "Unit price is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be a valid positive number"),
  costPrice: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Must be a valid number"),
  stockQuantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Must be a valid number").default("0"),
  minStockLevel: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Must be a valid number").default("5"),
  unit: z.string().default("pcs"),
  vatApplicable: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface AddProductFormProps {
  children?: React.ReactNode;
  editProduct?: Product | null;
  onEditComplete?: () => void;
}

export default function AddProductForm({ children, editProduct, onEditComplete }: AddProductFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!editProduct;

  // Open modal when editProduct is provided
  useEffect(() => {
    if (editProduct) {
      setOpen(true);
    }
  }, [editProduct]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      categoryId: "none",
      description: "",
      unitPrice: "",
      costPrice: "",
      stockQuantity: "0",
      minStockLevel: "5",
      unit: "pcs",
      vatApplicable: true,
      isActive: true,
    },
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editProduct) {
      form.reset({
        name: editProduct.name,
        sku: editProduct.sku,
        categoryId: editProduct.categoryId || "none",
        description: editProduct.description || "",
        unitPrice: editProduct.unitPrice,
        costPrice: editProduct.costPrice || "",
        stockQuantity: editProduct.stockQuantity.toString(),
        minStockLevel: editProduct.minStockLevel?.toString() || "5",
        unit: editProduct.unit,
        vatApplicable: editProduct.vatApplicable,
        isActive: editProduct.isActive,
      });
    }
  }, [editProduct, form]);

  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData: InsertProduct = {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId === "none" ? null : data.categoryId || null,
        description: data.description || null,
        unitPrice: data.unitPrice,
        costPrice: data.costPrice || null,
        stockQuantity: parseInt(data.stockQuantity),
        minStockLevel: parseInt(data.minStockLevel),
        unit: data.unit,
        vatApplicable: data.vatApplicable,
        isActive: data.isActive,
      };

      const url = isEditing ? `/api/products/${editProduct!.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'add'} product`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      setOpen(false);
      if (isEditing && onEditComplete) {
        onEditComplete();
      }
    },
    onError: (error) => {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    productMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update product information' : 'Create a new product for your inventory'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter unique SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder="Enter product description" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price (NPR) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (NPR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock Level</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="5" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="gm">Grams</SelectItem>
                        <SelectItem value="ltr">Liters</SelectItem>
                        <SelectItem value="mtr">Meters</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-6">
              <FormField
                control={form.control}
                name="vatApplicable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>VAT Applicable</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  if (isEditing && onEditComplete) {
                    onEditComplete();
                  }
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={productMutation.isPending}
                className="flex-1"
              >
                {productMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </Button>
            </div>

            {productMutation.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {productMutation.error.message}
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
