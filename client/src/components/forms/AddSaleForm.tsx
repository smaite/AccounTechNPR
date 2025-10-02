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
import { Plus, Loader2, Trash2, Calculator } from "lucide-react";
import type { Customer, Product, Sale } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const saleFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  saleDate: z.string().min(1, "Sale date is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.string().min(1, "Unit price is required"),
  })).min(1, "At least one item is required"),
});

type SaleFormData = z.infer<typeof saleFormSchema>;

interface AddSaleFormProps {
  children?: React.ReactNode;
  editSale?: Sale | null;
  onEditComplete?: () => void;
}

export default function AddSaleForm({ children, editSale, onEditComplete }: AddSaleFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!editSale;

  // Open modal when editSale is provided
  useEffect(() => {
    if (editSale) {
      setOpen(true);
    }
  }, [editSale]);

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: "",
      saleDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: "" }],
    },
  });

  // Fetch sale items when editing
  const { data: saleItems = [] } = useQuery({
    queryKey: ["/api/sales", editSale?.id, "items"],
    queryFn: () => fetch(`/api/sales/${editSale?.id}/items`).then(res => res.json()),
    enabled: !!editSale?.id,
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editSale && saleItems.length > 0) {
      form.reset({
        customerId: editSale.customerId,
        saleDate: new Date(editSale.saleDate).toISOString().split("T")[0],
        notes: editSale.notes || "",
        items: saleItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      setOpen(true);
    } else if (editSale && saleItems.length === 0) {
      // Fallback if no items found
      form.reset({
        customerId: editSale.customerId,
        saleDate: new Date(editSale.saleDate).toISOString().split("T")[0],
        notes: editSale.notes || "",
        items: [{ productId: "", quantity: 1, unitPrice: "" }],
      });
      setOpen(true);
    }
  }, [editSale, saleItems, form]);

  const saleMutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
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
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      const saleData = {
        invoiceNumber,
        customerId: data.customerId,
        saleDate: new Date(data.saleDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal: subtotal.toString(),
        vatAmount: totalVat.toString(),
        totalAmount: totalAmount.toString(),
        status: "pending",
        notes: data.notes || null,
        items,
      };

      const url = isEditing ? `/api/sales/${editSale!.id}` : "/api/sales";
      const method = isEditing ? "PUT" : "POST";

      const response = await apiRequest(method, url, saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: `Sale ${isEditing ? 'updated' : 'created'} successfully`,
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

  const onSubmit = (data: SaleFormData) => {
    saleMutation.mutate(data);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Sale' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
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
                name="saleDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Date *</FormLabel>
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
                      placeholder="Additional notes for this sale..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sale Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Sale Items</h3>
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
                          <FormLabel>Product</FormLabel>
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
                disabled={saleMutation.isPending}
                className="flex-1"
              >
                {saleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Sale' : 'Create Invoice'}
                  </>
                )}
              </Button>
            </div>

            {saleMutation.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {saleMutation.error.message}
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}