import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  FileText,
  Wallet,
  Percent,
  Plus,
  Receipt,
  UserPlus,
  FileBarChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar
} from "lucide-react";
import { Currency } from "@/components/ui/currency";

interface DashboardStats {
  totalRevenue: number;
  outstandingAmount: number;
  monthlyExpenses: number;
  vatCollected: number;
  overdueCount: number;
  lowStockProducts: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: stats?.totalRevenue || 0,
      icon: TrendingUp,
      trend: { value: "+12.5%", isPositive: true, text: "from last month" },
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Outstanding Invoices",
      value: stats?.outstandingAmount || 0,
      icon: FileText,
      trend: { value: `${stats?.overdueCount || 0}`, isPositive: false, text: "overdue invoices" },
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Monthly Expenses",
      value: stats?.monthlyExpenses || 0,
      icon: Wallet,
      trend: { value: "Same", isPositive: null, text: "as last month" },
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "VAT Collected",
      value: stats?.vatCollected || 0,
      icon: Percent,
      trend: { value: "Due: 15th", isPositive: null, text: "of month" },
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  const quickActions = [
    {
      title: "New Invoice",
      icon: Plus,
      color: "bg-primary text-primary-foreground hover:bg-primary/90",
      href: "/sales"
    },
    {
      title: "Add Expense",
      icon: Receipt,
      color: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      href: "/expenses"
    },
    {
      title: "Add Customer",
      icon: UserPlus,
      color: "border border-border text-foreground hover:bg-muted",
      href: "/customers"
    },
    {
      title: "VAT Report",
      icon: FileBarChart,
      color: "border border-border text-foreground hover:bg-muted",
      href: "/reports"
    }
  ];

  return (
    <div className="p-6" data-testid="dashboard-content">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend.isPositive === true ? ArrowUp : 
                           stat.trend.isPositive === false ? ArrowDown : 
                           stat.trend.value === "Due: 15th" ? Calendar : Minus;
          
          return (
            <Card key={stat.title} data-testid={`card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">
                      <Currency amount={stat.value} />
                    </p>
                    <p className={`text-xs flex items-center mt-1 ${
                      stat.trend.isPositive === true ? 'text-accent' : 
                      stat.trend.isPositive === false ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      <TrendIcon className="w-3 h-3 mr-1" />
                      {stat.trend.value} {stat.trend.text}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2" data-testid="card-recent-transactions">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet. Start by creating your first invoice!</p>
                <Button variant="outline" className="mt-4" data-testid="button-create-first-invoice">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  className={`w-full py-3 px-4 font-medium transition-colors ${action.color}`}
                  data-testid={`button-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => window.location.href = action.href}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.title}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
