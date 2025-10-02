import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, TrendingUp, DollarSign, FileBarChart, Calculator } from "lucide-react";
import { Currency } from "@/components/ui/currency";
import type { Sale, Expense, Purchase } from "@shared/schema";

interface ReportData {
  sales: Sale[];
  expenses: Expense[];
  purchases: Purchase[];
}

export default function Reports() {
  const [reportType, setReportType] = useState("profit-loss");
  const [reportPeriod, setReportPeriod] = useState("current-month");

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const calculateProfitLoss = () => {
    const totalRevenue = sales
      .filter(sale => sale.status === "paid")
      .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);

    const totalExpenses = expenses
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    const totalPurchases = purchases
      .reduce((sum, purchase) => sum + parseFloat(purchase.totalAmount), 0);

    const grossProfit = totalRevenue - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      totalPurchases,
      grossProfit,
      netProfit,
    };
  };

  const calculateVATReport = () => {
    const vatCollected = sales
      .filter(sale => sale.status === "paid")
      .reduce((sum, sale) => sum + parseFloat(sale.vatAmount), 0);

    const vatPaid = purchases
      .reduce((sum, purchase) => sum + parseFloat(purchase.vatAmount), 0);

    const vatOnExpenses = expenses
      .filter(expense => expense.isVatApplicable)
      .reduce((sum, expense) => sum + parseFloat(expense.vatAmount || "0"), 0);

    const netVATPayable = vatCollected - vatPaid - vatOnExpenses;

    return {
      vatCollected,
      vatPaid,
      vatOnExpenses,
      netVATPayable,
    };
  };

  const profitLossData = calculateProfitLoss();
  const vatData = calculateVATReport();

  const reportTypes = [
    { value: "profit-loss", label: "Profit & Loss Statement" },
    { value: "balance-sheet", label: "Balance Sheet" },
    { value: "cash-flow", label: "Cash Flow Statement" },
    { value: "vat-report", label: "VAT Report" },
    { value: "sales-summary", label: "Sales Summary" },
    { value: "expense-summary", label: "Expense Summary" },
  ];

  const reportPeriods = [
    { value: "current-month", label: "Current Month" },
    { value: "last-month", label: "Last Month" },
    { value: "current-quarter", label: "Current Quarter" },
    { value: "current-year", label: "Current Year" },
    { value: "last-year", label: "Last Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const renderProfitLossReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Sales Revenue</span>
              <span className="font-medium">
                <Currency amount={profitLossData.totalRevenue} />
              </span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Revenue</span>
              <span>
                <Currency amount={profitLossData.totalRevenue} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost of Goods Sold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Purchases</span>
              <span className="font-medium">
                <Currency amount={profitLossData.totalPurchases} />
              </span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total COGS</span>
              <span>
                <Currency amount={profitLossData.totalPurchases} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gross Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-lg font-bold">
            <span>Gross Profit</span>
            <span className={profitLossData.grossProfit >= 0 ? "text-accent" : "text-destructive"}>
              <Currency amount={profitLossData.grossProfit} />
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Expenses</span>
              <span className="font-medium">
                <Currency amount={profitLossData.totalExpenses} />
              </span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Operating Expenses</span>
              <span>
                <Currency amount={profitLossData.totalExpenses} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Net Profit/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-xl font-bold">
            <span>Net Profit</span>
            <span className={profitLossData.netProfit >= 0 ? "text-accent" : "text-destructive"}>
              <Currency amount={profitLossData.netProfit} />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVATReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>VAT Collected (Output VAT)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-lg font-medium">
            <span>VAT on Sales</span>
            <span className="text-accent">
              <Currency amount={vatData.vatCollected} />
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>VAT Paid (Input VAT)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>VAT on Purchases</span>
              <span>
                <Currency amount={vatData.vatPaid} />
              </span>
            </div>
            <div className="flex justify-between">
              <span>VAT on Expenses</span>
              <span>
                <Currency amount={vatData.vatOnExpenses} />
              </span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total VAT Paid</span>
              <span>
                <Currency amount={vatData.vatPaid + vatData.vatOnExpenses} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Net VAT Payable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-xl font-bold">
            <span>Amount Due to IRD</span>
            <span className={vatData.netVATPayable >= 0 ? "text-destructive" : "text-accent"}>
              <Currency amount={Math.abs(vatData.netVATPayable)} />
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {vatData.netVATPayable >= 0 
              ? "Amount to be paid to Inland Revenue Department"
              : "Amount to be claimed as refund from IRD"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case "profit-loss":
        return renderProfitLossReport();
      case "vat-report":
        return renderVATReport();
      case "balance-sheet":
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Balance Sheet</h3>
              <p className="text-muted-foreground">Balance sheet report coming soon</p>
            </CardContent>
          </Card>
        );
      case "cash-flow":
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Cash Flow Statement</h3>
              <p className="text-muted-foreground">Cash flow report coming soon</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Report in Development</h3>
              <p className="text-muted-foreground">This report type is being developed</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="p-6" data-testid="reports-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Reports</h2>
          <p className="text-muted-foreground">Generate profit/loss, balance sheet, cash flow, and VAT reports</p>
        </div>
        <Button className="mt-4 sm:mt-0" data-testid="button-export-report">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Report Period</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger data-testid="select-report-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" data-testid="button-generate-report">
                <FileBarChart className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setReportType("profit-loss")}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-accent mb-2 mx-auto" />
            <p className="font-medium text-foreground">P&L Statement</p>
            <p className="text-sm text-muted-foreground">Profit & Loss</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setReportType("vat-report")}>
          <CardContent className="p-4 text-center">
            <Calculator className="w-8 h-8 text-primary mb-2 mx-auto" />
            <p className="font-medium text-foreground">VAT Report</p>
            <p className="text-sm text-muted-foreground">Tax Summary</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setReportType("balance-sheet")}>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-secondary mb-2 mx-auto" />
            <p className="font-medium text-foreground">Balance Sheet</p>
            <p className="text-sm text-muted-foreground">Assets & Liabilities</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setReportType("cash-flow")}>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-destructive mb-2 mx-auto" />
            <p className="font-medium text-foreground">Cash Flow</p>
            <p className="text-sm text-muted-foreground">Money Movement</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <div data-testid="report-content">
        {renderReportContent()}
      </div>
    </div>
  );
}
