import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Edit, Trash2, Users, Building } from "lucide-react";
import { Currency } from "@/components/ui/currency";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCustomerSchema, type Customer, type InsertCustomer } from "@shared/schema";
import { z } from "zod";

const customerFormSchema = insertCustomerSchema.extend({
  creditLimit: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingCustomer;

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      vatNumber: "",
      panNumber: "",
      creditLimit: "0",
      paymentTerms: "",
      isActive: true,
    },
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editingCustomer) {
      form.reset({
        name: editingCustomer.name,
        contactPerson: editingCustomer.contactPerson || "",
        email: editingCustomer.email || "",
        phone: editingCustomer.phone || "",
        address: editingCustomer.address || "",
        vatNumber: editingCustomer.vatNumber || "",
        panNumber: editingCustomer.panNumber || "",
        creditLimit: editingCustomer.creditLimit || "0",
        paymentTerms: editingCustomer.paymentTerms || "",
        isActive: editingCustomer.isActive,
      });
      setIsDialogOpen(true);
    }
  }, [editingCustomer, form]);

  const customerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const customerData: InsertCustomer = {
        ...data,
        creditLimit: data.creditLimit || "0",
      };
      
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/customers/${editingCustomer!.id}` : "/api/customers";
      
      const response = await apiRequest(method, url, customerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ 
        title: "Success", 
        description: `Customer ${isEditing ? 'updated' : 'created'} successfully` 
      });
      setIsDialogOpen(false);
      setEditingCustomer(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const onSubmit = (data: CustomerFormData) => {
    customerMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
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
    <div className="p-6" data-testid="customers-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Management</h2>
          <p className="text-muted-foreground">Manage customer information and billing details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0" data-testid="button-add-customer">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm" data-testid="dialog-add-customer">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} data-testid="input-customer-name" />
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
                          <Input type="email" placeholder="customer@email.com" {...field} data-testid="input-email" />
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
                        <Input placeholder="Customer address" {...field} data-testid="input-address" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Limit (NPR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-credit-limit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCustomer(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={customerMutation.isPending} data-testid="button-save-customer">
                    {customerMutation.isPending 
                      ? (isEditing ? "Updating..." : "Saving...") 
                      : (isEditing ? "Update Customer" : "Save Customer")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customers Table */}
      <Card data-testid="card-customers">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Customer Directory</CardTitle>
            <div className="mt-2 sm:mt-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
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
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No customers found</p>
              <p className="text-sm">Add your first customer to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Credit Limit</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Payment Terms</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} data-testid={`row-customer-${customer.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.contactPerson}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-foreground">{customer.email}</p>
                          <p className="text-muted-foreground">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <Currency amount={customer.creditLimit || 0} />
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {customer.paymentTerms || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={customer.isActive ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-800"}>
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(customer)}
                            data-testid={`button-edit-${customer.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(customer.id)}
                            data-testid={`button-delete-${customer.id}`}
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
