import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface CurrencyProps {
  amount: number | string;
  className?: string;
  showIcon?: boolean;
}

export function Currency({ amount, className = "", showIcon = false }: CurrencyProps) {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  return (
    <span className={className} data-testid="currency-amount">
      {showIcon && <IndianRupee className="w-4 h-4 inline mr-1" />}
      {formatCurrency(numericAmount)}
    </span>
  );
}
