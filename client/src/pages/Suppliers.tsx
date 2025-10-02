import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Edit, Trash2, Truck, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/components/ui/currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSupplierSchema, type Supplier, type InsertSupplier } from "@shared/schema";

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingSupplier;

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      vatNumber: "",
      panNumber: "",
      paymentTerms: "",
      isActive: true,
    },
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editingSupplier) {
      form.reset({
        name: editingSupplier.name,
        contactPerson: editingSupplier.contactPerson || "",
        email: editingSupplier.email || "",
        phone: editingSupplier.phone || "",
        address: editingSupplier.address || "",
        vatNumber: editingSupplier.vatNumber || "",
        panNumber: editingSupplier.panNumber || "",
        paymentTerms: editingSupplier.paymentTerms || "",
        isActive: editingSupplier.isActive,
      });
      setIsDialogOpen(true);
    }
  }, [editingSupplier, form]);

  const supplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/suppliers/${editingSupplier!.id}` : "/api/suppliers";
      
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ 
        title: "Success", 
        description: `Supplier ${isEditing ? 'updated' : 'created'} successfully` 
      });
      setIsDialogOpen(false);
      setEditingSupplier(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({ title: "Success", description: "Supplier deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm))
  );

  const onSubmit = (data: InsertSupplier) => {
    supplierMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="suppliers-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Supplier Management</h2>
          <p className="text-muted-foreground">Track supplier information, contact details, and payment terms</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0" data-testid="button-add-supplier">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm" data-testid="dialog-add-supplier">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter supplier name" {...field} data-testid="input-supplier-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact person name" {...field} data-testid="input-contact-person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="supplier@email.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+977-1-xxxxxxx" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Supplier address" {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Number</FormLabel>
                        <FormControl>
                          <Input placeholder="VAT registration number" {...field} data-testid="input-vat-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="panNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="PAN number" {...field} data-testid="input-pan-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Net 30 days" {...field} data-testid="input-payment-terms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingSupplier(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={supplierMutation.isPending} data-testid="button-save-supplier">
                    {supplierMutation.isPending 
                      ? (isEditing ? "Updating..." : "Saving...") 
                      : (isEditing ? "Update Supplier" : "Save Supplier")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Table */}
      <Card data-testid="card-suppliers">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Supplier Directory</CardTitle>
            <div className="mt-2 sm:mt-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No suppliers found</p>
              <p className="text-sm">Add your first supplier to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Supplier</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Outstanding Balance</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Payment Terms</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">VAT Number</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} data-testid={`row-supplier-${supplier.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-foreground">{supplier.email}</p>
                          <p className="text-muted-foreground">{supplier.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <Currency amount={supplier.outstandingBalance || "0"} />
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {supplier.paymentTerms || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {supplier.vatNumber || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={supplier.isActive ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-800"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(supplier)}
                            data-testid={`button-edit-${supplier.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(supplier.id)}
                            data-testid={`button-delete-${supplier.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
