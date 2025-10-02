import { Menu, IndianRupee, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles = {
  "/": { title: "Dashboard", subtitle: "Overview of your business" },
  "/sales": { title: "Sales Management", subtitle: "Manage invoices and sales transactions" },
  "/purchases": { title: "Purchase Management", subtitle: "Handle purchase orders and bills" },
  "/products": { title: "Product Catalog", subtitle: "Manage your inventory and pricing" },
  "/categories": { title: "Category Management", subtitle: "Organize products with custom categories" },
  "/customers": { title: "Customer Management", subtitle: "Manage customer information and billing" },
  "/suppliers": { title: "Supplier Management", subtitle: "Track supplier information and payment terms" },
  "/expenses": { title: "Expense Tracking", subtitle: "Record and categorize business expenses" },
  "/reports": { title: "Financial Reports", subtitle: "Generate profit/loss, balance sheet, and VAT reports" },
  "/staff": { title: "Staff Management", subtitle: "Manage staff roles and permissions" },
  "/settings": { title: "Settings", subtitle: "Configure your accounting software preferences" },
};

export function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const pageInfo = pageTitles[location as keyof typeof pageTitles] || pageTitles["/"];

  return (
    <header 
      className="bg-card border-b border-border px-4 py-3 flex items-center justify-between"
      data-testid="header"
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2"
          onClick={onMenuClick}
          data-testid="button-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="ml-4 md:ml-0">
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-page-title">
            {pageInfo.title}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-muted rounded-lg px-3 py-2" data-testid="currency-indicator">
          <IndianRupee className="w-4 h-4 text-muted-foreground mr-2" />
          <span className="text-sm font-medium">NPR</span>
        </div>
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      </div>
    </header>
  );
}
