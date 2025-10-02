import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertCompanySettingsSchema,
  insertCategorySchema,
  insertSupplierSchema,
  insertCustomerSchema,
  insertProductSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertPurchaseSchema,
  insertPurchaseItemSchema,
  insertExpenseSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Company Settings
  app.get("/api/settings/company", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  app.put("/api/settings/company", async (req, res) => {
    try {
      const validatedData = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.updateCompanySettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid company settings data" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, validatedData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSupplier(id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Customer validation error:", error);
      if (error instanceof Error && 'issues' in error) {
        // Zod validation error
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(400).json({ message: "Invalid customer data" });
      }
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Product validation error:", error);
      if (error instanceof Error && 'issues' in error) {
        // Zod validation error
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(400).json({ message: "Invalid product data" });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Sales
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.get("/api/sales/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getSaleItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale items" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const { items, ...saleData } = req.body;
      
      // Convert date strings to Date objects
      if (saleData.saleDate) {
        saleData.saleDate = new Date(saleData.saleDate);
      }
      if (saleData.dueDate) {
        saleData.dueDate = new Date(saleData.dueDate);
      }
      
      const validatedSale = insertSaleSchema.parse(saleData);
      const sale = await storage.createSale(validatedSale);

      // Add sale items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertSaleItemSchema.parse({
            ...item,
            saleId: sale.id,
          });
          await storage.createSaleItem(validatedItem);
          
          // Update product stock
          await storage.updateProductStock(item.productId, -item.quantity);
        }
      }

      // Update customer outstanding balance
      await storage.updateCustomerBalance(
        validatedSale.customerId, 
        parseFloat(validatedSale.totalAmount)
      );

      res.json(sale);
    } catch (error) {
      console.error("Sale creation error:", error);
      console.error("Request body:", JSON.stringify(req.body, null, 2));
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(400).json({ 
        message: "Invalid sale data", 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error
      });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSaleSchema.partial().parse(req.body);
      const sale = await storage.updateSale(id, validatedData);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSale(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Purchases
  app.get("/api/purchases", async (req, res) => {
    try {
      const purchases = await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.get("/api/purchases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const purchase = await storage.getPurchase(id);
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase" });
    }
  });

  app.get("/api/purchases/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getPurchaseItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase items" });
    }
  });

  app.post("/api/purchases", async (req, res) => {
    try {
      const { items, ...purchaseData } = req.body;
      
      // Convert date strings to Date objects
      if (purchaseData.purchaseDate) {
        purchaseData.purchaseDate = new Date(purchaseData.purchaseDate);
      }
      if (purchaseData.dueDate) {
        purchaseData.dueDate = new Date(purchaseData.dueDate);
      }
      
      const validatedPurchase = insertPurchaseSchema.parse(purchaseData);
      const purchase = await storage.createPurchase(validatedPurchase);

      // Add purchase items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertPurchaseItemSchema.parse({
            ...item,
            purchaseId: purchase.id,
          });
          await storage.createPurchaseItem(validatedItem);
          
          // Update product stock
          await storage.updateProductStock(item.productId, item.quantity);
        }
      }

      // Update supplier outstanding balance
      await storage.updateSupplierBalance(
        validatedPurchase.supplierId, 
        parseFloat(validatedPurchase.totalAmount)
      );

      res.json(purchase);
    } catch (error) {
      console.error("Purchase creation error:", error);
      console.error("Request body:", req.body);
      res.status(400).json({ 
        message: "Invalid purchase data", 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error
      });
    }
  });

  // Expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Users/Staff
  app.get("/api/staff", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [sales, expenses, products, customers] = await Promise.all([
        storage.getSales(),
        storage.getExpenses(),
        storage.getProducts(),
        storage.getCustomers(),
      ]);

      const totalRevenue = sales
        .filter(sale => sale.status === "paid")
        .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);

      const outstandingAmount = sales
        .filter(sale => sale.status === "pending" || sale.status === "overdue")
        .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);

      const monthlyExpenses = expenses
        .filter(expense => {
          const expenseMonth = new Date(expense.expenseDate).getMonth();
          const currentMonth = new Date().getMonth();
          return expenseMonth === currentMonth;
        })
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      const vatCollected = sales
        .filter(sale => sale.status === "paid")
        .reduce((sum, sale) => sum + parseFloat(sale.vatAmount), 0);

      const overdueCount = sales.filter(sale => sale.status === "overdue").length;
      const lowStockProducts = products.filter(product => product.stockQuantity <= (product.minStockLevel || 5)).length;

      res.json({
        totalRevenue,
        outstandingAmount,
        monthlyExpenses,
        vatCollected,
        overdueCount,
        lowStockProducts,
        totalProducts: products.length,
        totalCustomers: customers.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
