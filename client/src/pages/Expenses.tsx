import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Edit, Trash2, Receipt, Upload, Filter } from "lucide-react";
import { Currency } from "@/components/ui/currency";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema, type Expense, type InsertExpense } from "@shared/schema";
import { z } from "zod";

const expenseFormSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, "Amount is required"),
  expenseDate: z.string(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

const expenseCategories = [
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "travel", label: "Travel" },
  { value: "marketing", label: "Marketing" },
  { value: "professional_services", label: "Professional Services" },
  { value: "equipment", label: "Equipment" },
  { value: "insurance", label: "Insurance" },
  { value: "meals", label: "Meals & Entertainment" },
  { value: "other", label: "Other" },
];

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingExpense;

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      category: "other",
      expenseDate: new Date().toISOString().split('T')[0],
      receiptPath: "",
      isVatApplicable: false,
      vatAmount: "0",
    },
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editingExpense) {
      form.reset({
        title: editingExpense.title,
        description: editingExpense.description || "",
        amount: editingExpense.amount.toString(),
        category: editingExpense.category || "other",
        expenseDate: new Date(editingExpense.expenseDate).toISOString().split('T')[0],
        receiptPath: editingExpense.receiptPath || "",
        isVatApplicable: parseFloat(editingExpense.vatAmount || "0") > 0,
        vatAmount: editingExpense.vatAmount || "0",
      });
      setIsDialogOpen(true);
    }
  }, [editingExpense, form]);

  const expenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const expenseData: InsertExpense = {
        ...data,
        amount: parseFloat(data.amount),
        expenseDate: new Date(data.expenseDate),
        vatAmount: data.isVatApplicable ? (parseFloat(data.amount) * 0.13).toString() : "0",
      };
      
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/expenses/${editingExpense!.id}` : "/api/expenses";
      
      const response = await apiRequest(method, url, expenseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ 
        title: "Success", 
        description: `Expense ${isEditing ? 'updated' : 'recorded'} successfully` 
      });
      setIsDialogOpen(false);
      setEditingExpense(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Success", description: "Expense deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const totalVAT = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.vatAmount || "0"), 0);

  const onSubmit = (data: ExpenseFormData) => {
    expenseMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const getCategoryLabel = (category: string) => {
    return expenseCategories.find(cat => cat.value === category)?.label || category;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="expenses-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expense Tracking</h2>
          <p className="text-muted-foreground">Record and categorize business expenses with receipt uploads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0" data-testid="button-add-expense">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-950 border shadow-lg backdrop-blur-sm" data-testid="dialog-add-expense">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter expense title" {...field} data-testid="input-expense-title" />
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
                        <Textarea placeholder="Additional details about the expense" {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (NPR) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expenseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expense Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-expense-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
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
                  name="isVatApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-vat-applicable"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>VAT Applicable (13%)</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Check if this expense is subject to VAT
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingExpense(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={expenseMutation.isPending} data-testid="button-save-expense">
                    {expenseMutation.isPending 
                      ? (isEditing ? "Updating..." : "Saving...") 
                      : (isEditing ? "Update Expense" : "Save Expense")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expense Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-bold text-destructive">
              <Currency amount={totalExpenses} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">VAT Amount</p>
            <p className="text-xl font-bold text-primary">
              <Currency amount={totalVAT} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Number of Expenses</p>
            <p className="text-xl font-bold text-foreground">
              {filteredExpenses.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card data-testid="card-expenses">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Expense Records</CardTitle>
            <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No expenses found</p>
              <p className="text-sm">Record your first expense to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Expense</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">VAT</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} data-testid={`row-expense-${expense.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{expense.title}</p>
                            <p className="text-sm text-muted-foreground">{expense.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {getCategoryLabel(expense.category)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        <Currency amount={expense.amount} />
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {expense.isVatApplicable ? (
                          <Currency amount={expense.vatAmount || "0"} />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(expense)}
                            data-testid={`button-edit-${expense.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(expense.id)}
                            data-testid={`button-delete-${expense.id}`}
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
