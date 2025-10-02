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
import AddPurchaseForm from "@/components/forms/AddPurchaseForm";
import type { Purchase } from "@shared/schema";

export default function Purchases() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
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

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
  };

  const handleEditComplete = () => {
    setEditingPurchase(null);
  };

  const handleDelete = (purchase: Purchase) => {
    toast({ 
      title: "Delete Purchase", 
      description: `Delete functionality for purchase "${purchase.billNumber}" coming soon!`
    });
  };

  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.totalAmount), 0);
  const pendingPurchases = filteredPurchases.filter(p => p.status === "pending").length;
  const totalVAT = filteredPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.vatAmount), 0);

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
    <div className="p-6" data-testid="purchases-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Purchase Management</h2>
          <p className="text-muted-foreground">Handle purchase orders, bills, and vendor payments</p>
        </div>
        <AddPurchaseForm 
          editPurchase={editingPurchase}
          onEditComplete={handleEditComplete}
        />
      </div>

      {/* Purchase Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Purchases</p>
            <p className="text-xl font-bold text-destructive">
              <Currency amount={totalPurchases} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Bills</p>
            <p className="text-xl font-bold text-yellow-600">
              {pendingPurchases}
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
      </div>

      {/* Purchases Table */}
      <Card data-testid="card-purchases">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Purchase Orders & Bills</CardTitle>
            <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search purchases..."
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
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No purchase orders found</p>
              <p className="text-sm">Create your first purchase order to get started</p>
              <AddPurchaseForm
                editPurchase={editingPurchase}
                onEditComplete={handleEditComplete}
              >
                <Button variant="outline" className="mt-4" data-testid="button-create-first-purchase">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </AddPurchaseForm>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Bill #</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Supplier</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">VAT</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} data-testid={`row-purchase-${purchase.id}`}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {purchase.billNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        Supplier #{purchase.supplierId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <Currency amount={purchase.totalAmount} />
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <Currency amount={purchase.vatAmount} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusBadge(purchase.status)}>
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" data-testid={`button-view-${purchase.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(purchase)}
                            data-testid={`button-edit-${purchase.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(purchase)}
                            data-testid={`button-delete-${purchase.id}`}
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
