import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Percent, FileText, Users, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCompanySettingsSchema, type CompanySettings, type InsertCompanySettings } from "@shared/schema";

const settingsNavigation = [
  { id: "company", label: "Company Details", icon: Building },
  { id: "tax", label: "Tax Settings", icon: Percent },
  { id: "invoice", label: "Invoice Settings", icon: FileText },
  { id: "users", label: "User Management", icon: Users },
  { id: "backup", label: "Backup & Security", icon: Database },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("company");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<CompanySettings>({
    queryKey: ["/api/settings/company"],
  });

  const form = useForm<InsertCompanySettings>({
    resolver: zodResolver(insertCompanySettingsSchema),
    defaultValues: settings || {
      companyName: "",
      registrationNumber: "",
      address: "",
      phone: "",
      email: "",
      vatNumber: "",
      panNumber: "",
      vatRate: "13.00",
      taxYear: "2080-81",
      autoVatCalculation: true,
      includeVatInPrice: false,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCompanySettings) => {
      const response = await apiRequest("PUT", "/api/settings/company", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/company"] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Reset form when settings data is loaded
  if (settings && !form.formState.isDirty) {
    form.reset(settings);
  }

  const onSubmit = (data: InsertCompanySettings) => {
    updateMutation.mutate(data);
  };

  const renderCompanySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Reg. No." {...field} data-testid="input-registration-number" />
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
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full business address" {...field} data-testid="input-address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+977-1-xxxxxxx" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="company@email.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Registration No.</FormLabel>
                    <FormControl>
                      <Input placeholder="VAT Number" {...field} data-testid="input-vat-number" />
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
                      <Input placeholder="PAN Number" {...field} data-testid="input-pan-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-company">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderTaxSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>VAT & Tax Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vatRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default VAT Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="13.00" {...field} data-testid="input-vat-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tax-year">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2080-81">2080-81 (Current)</SelectItem>
                        <SelectItem value="2081-82">2081-82</SelectItem>
                        <SelectItem value="2079-80">2079-80</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="autoVatCalculation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-auto-vat"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable Automatic VAT Calculation</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Automatically calculate VAT on sales and purchases
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="includeVatInPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-include-vat"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Include VAT in Product Prices</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Product prices include VAT (VAT-inclusive pricing)
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-tax">
                {updateMutation.isPending ? "Saving..." : "Save Tax Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderPlaceholderSection = (title: string, description: string) => (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "company":
        return renderCompanySettings();
      case "tax":
        return renderTaxSettings();
      case "invoice":
        return renderPlaceholderSection("Invoice Settings", "Configure invoice templates, numbering, and preferences");
      case "users":
        return renderPlaceholderSection("User Management", "Manage user accounts, roles, and permissions");
      case "backup":
        return renderPlaceholderSection("Backup & Security", "Configure data backup and security settings");
      default:
        return renderCompanySettings();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-muted rounded"></div>
            <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="settings-content">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Configure your accounting software preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {settingsNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    data-testid={`nav-${item.id}`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2" data-testid="settings-panel">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}
