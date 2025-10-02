import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { Currency } from "@/components/ui/currency";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AddSaleForm from "@/components/forms/AddSaleForm";
import type { Sale } from "@shared/schema";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-accent/10 text-accent",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-destructive/10 text-destructive",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
  };

  const handleEditComplete = () => {
    setEditingSale(null);
  };

  const handleDelete = (sale: Sale) => {
    toast({ 
      title: "Delete Invoice", 
      description: `Delete functionality for invoice "${sale.invoiceNumber}" coming soon!`
    });
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
    <div className="p-6" data-testid="sales-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales Management</h2>
          <p className="text-muted-foreground">Manage invoices and sales transactions</p>
        </div>
        <AddSaleForm 
          editSale={editingSale}
          onEditComplete={handleEditComplete}
        />
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today's Sales</p>
            <p className="text-xl font-bold text-accent">
              <Currency amount={stats?.totalRevenue || 0} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Invoices</p>
            <p className="text-xl font-bold text-destructive">
              {sales.filter(s => s.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">VAT Amount</p>
            <p className="text-xl font-bold text-primary">
              <Currency amount={stats?.vatCollected || 0} />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card data-testid="card-invoices">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Recent Invoices</CardTitle>
            <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No invoices found</p>
              <p className="text-sm">Create your first invoice to get started</p>
              <AddSaleForm
                editSale={editingSale}
                onEditComplete={handleEditComplete}
              >
                <Button variant="outline" className="mt-4" data-testid="button-create-first-invoice">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </AddSaleForm>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Invoice #</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">VAT</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} data-testid={`row-invoice-${sale.id}`}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        Customer #{sale.customerId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <Currency amount={sale.totalAmount} />
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <Currency amount={sale.vatAmount} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusBadge(sale.status)}>
                          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" data-testid={`button-view-${sale.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(sale)}
                            data-testid={`button-edit-${sale.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(sale)}
                            data-testid={`button-delete-${sale.id}`}
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
