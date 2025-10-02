import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  Users, 
  Truck, 
  Receipt, 
  FileText, 
  UserCheck, 
  Settings,
  Calculator,
  Tags
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Purchases", href: "/purchases", icon: ShoppingBag },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Staff", href: "/staff", icon: UserCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "sidebar-transition w-64 bg-card border-r border-border flex-shrink-0 md:relative absolute z-30 h-full",
        !isOpen && "sidebar-hidden md:translate-x-0"
      )}
      data-testid="sidebar"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">NepalBooks</h1>
            <p className="text-xs text-muted-foreground">Accounting Pro</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <div className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
