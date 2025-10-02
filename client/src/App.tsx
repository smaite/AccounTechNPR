import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import Customers from "@/pages/Customers";
import Suppliers from "@/pages/Suppliers";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import Staff from "@/pages/Staff";
import Settings from "@/pages/Settings";
import Purchases from "@/pages/Purchases";
import NotFound from "@/pages/not-found";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-background scrollbar-thin">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/sales" component={Sales} />
            <Route path="/purchases" component={Purchases} />
            <Route path="/products" component={Products} />
            <Route path="/categories" component={Categories} />
            <Route path="/customers" component={Customers} />
            <Route path="/suppliers" component={Suppliers} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/reports" component={Reports} />
            <Route path="/staff" component={Staff} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
