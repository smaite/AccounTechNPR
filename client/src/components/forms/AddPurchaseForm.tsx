import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
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
import { Plus, Loader2, Trash2, Calculator, PackagePlus } from "lucide-react";
import type { Supplier, Product, Purchase } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddProductForm from "./AddProductForm";

const purchaseFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.string().min(1, "Unit price is required"),
  })).min(1, "At least one item is required"),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

interface AddPurchaseFormProps {
  children?: React.ReactNode;
  editPurchase?: Purchase | null;
  onEditComplete?: () => void;
}

export default function AddPurchaseForm({ children, editPurchase, onEditComplete }: AddPurchaseFormProps) {
  const [open, setOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!editPurchase;

  // Open modal when editPurchase is provided
  useEffect(() => {
    if (editPurchase) {
      setOpen(true);
    }
  }, [editPurchase]);

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplierId: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: "" }],
    },
  });

  // Fetch purchase items when editing
  const { data: purchaseItems = [] } = useQuery({
    queryKey: ["/api/purchases", editPurchase?.id, "items"],
    queryFn: () => fetch(`/api/purchases/${editPurchase?.id}/items`).then(res => res.json()),
    enabled: !!editPurchase?.id,
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editPurchase && purchaseItems.length > 0) {
      form.reset({
        supplierId: editPurchase.supplierId,
        purchaseDate: new Date(editPurchase.purchaseDate).toISOString().split("T")[0],
        notes: editPurchase.notes || "",
        items: purchaseItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      setOpen(true);
    } else if (editPurchase && purchaseItems.length === 0) {
      // Fallback if no items found
      form.reset({
        supplierId: editPurchase.supplierId,
        purchaseDate: new Date(editPurchase.purchaseDate).toISOString().split("T")[0],
        notes: editPurchase.notes || "",
        items: [{ productId: "", quantity: 1, unitPrice: "" }],
      });
      setOpen(true);
    }
  }, [editPurchase, purchaseItems, form]);

  const purchaseMutation = useMutation({
    mutationFn: async (data: PurchaseFormData) => {
      // Calculate totals
      const items = data.items.map(item => {
        const unitPrice = parseFloat(item.unitPrice);
        const totalPrice = item.quantity * unitPrice;
        const vatRate = 13.00; // 13% VAT
        const vatAmount = (totalPrice * vatRate) / 100;
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice.toString(),
          totalPrice: totalPrice.toString(),
          vatRate: vatRate.toString(),
          vatAmount: vatAmount.toString(),
        };
      });

      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
      const totalVat = items.reduce((sum, item) => sum + parseFloat(item.vatAmount), 0);
      const totalAmount = subtotal + totalVat;
      
      // Generate bill number
      const billNumber = `PO-${Date.now()}`;

      const purchaseData = {
        billNumber,
        supplierId: data.supplierId,
        purchaseDate: new Date(data.purchaseDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal: subtotal.toString(),
        vatAmount: totalVat.toString(),
        totalAmount: totalAmount.toString(),
        status: "pending",
        notes: data.notes || null,
        items,
      };

      const url = isEditing ? `/api/purchases/${editPurchase!.id}` : "/api/purchases";
      const method = isEditing ? "PUT" : "POST";

      const response = await apiRequest(method, url, purchaseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      toast({
        title: "Success",
        description: `Purchase order ${isEditing ? 'updated' : 'created'} successfully`,
      });
      form.reset();
      setOpen(false);
      if (isEditing && onEditComplete) {
        onEditComplete();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseFormData) => {
    purchaseMutation.mutate(data);
  };

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, { productId: "", quantity: 1, unitPrice: "" }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    const items = form.watch("items");
    return items.reduce((total, item) => {
      return total + (item.quantity * parseFloat(item.unitPrice || "0"));
    }, 0).toFixed(2);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Purchase Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Purchase Order' : 'Create New Purchase Order'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
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
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes for this purchase order..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purchase Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Purchase Items</h3>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {form.watch("items").map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Product
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAddProduct(true)}
                              className="h-6 px-2 text-xs"
                            >
                              <PackagePlus className="w-3 h-3 mr-1" />
                              Add New
                            </Button>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.unitPrice}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    {form.watch("items").length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span className="font-medium">Total: ${calculateTotal()}</span>
                </div>
              </div>
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
                disabled={purchaseMutation.isPending}
                className="flex-1"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Purchase' : 'Create Purchase Order'}
                  </>
                )}
              </Button>
            </div>

            {purchaseMutation.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {purchaseMutation.error.message}
              </div>
            )}
          </form>
        </Form>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductForm onEditComplete={() => {
          setShowAddProduct(false);
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          toast({
            title: "Success",
            description: "Product added successfully! You can now select it.",
          });
        }}>
          <div />
        </AddProductForm>
      )}
    </>
  );
}