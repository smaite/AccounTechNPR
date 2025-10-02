var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/drizzle-storage.ts
import { eq } from "drizzle-orm";
import { randomUUID as randomUUID2 } from "crypto";

// server/database.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  companySettings: () => companySettings,
  customers: () => customers,
  expenses: () => expenses,
  insertCategorySchema: () => insertCategorySchema,
  insertCompanySettingsSchema: () => insertCompanySettingsSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertProductSchema: () => insertProductSchema,
  insertPurchaseItemSchema: () => insertPurchaseItemSchema,
  insertPurchaseSchema: () => insertPurchaseSchema,
  insertSaleItemSchema: () => insertSaleItemSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertUserSchema: () => insertUserSchema,
  products: () => products,
  purchaseItems: () => purchaseItems,
  purchases: () => purchases,
  saleItems: () => saleItems,
  sales: () => sales,
  suppliers: () => suppliers,
  users: () => users
});
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
var users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("staff"),
  // admin, staff, accountant
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var companySettings = sqliteTable("company_settings", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  registrationNumber: text("registration_number"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  vatNumber: text("vat_number"),
  panNumber: text("pan_number"),
  vatRate: text("vat_rate").notNull().default("13.00"),
  taxYear: text("tax_year").notNull().default("2080-81"),
  autoVatCalculation: integer("auto_vat_calculation", { mode: "boolean" }).notNull().default(true),
  includeVatInPrice: integer("include_vat_in_price", { mode: "boolean" }).notNull().default(false)
});
var categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  vatNumber: text("vat_number"),
  panNumber: text("pan_number"),
  paymentTerms: text("payment_terms"),
  outstandingBalance: text("outstanding_balance").notNull().default("0"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  vatNumber: text("vat_number"),
  panNumber: text("pan_number"),
  creditLimit: text("credit_limit").default("0"),
  outstandingBalance: text("outstanding_balance").notNull().default("0"),
  paymentTerms: text("payment_terms"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  categoryId: text("category_id").references(() => categories.id),
  description: text("description"),
  unitPrice: text("unit_price").notNull(),
  costPrice: text("cost_price"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  minStockLevel: integer("min_stock_level").default(5),
  unit: text("unit").notNull().default("pcs"),
  vatApplicable: integer("vat_applicable", { mode: "boolean" }).notNull().default(true),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var sales = sqliteTable("sales", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: text("customer_id").references(() => customers.id).notNull(),
  saleDate: integer("sale_date", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  dueDate: integer("due_date", { mode: "timestamp" }),
  subtotal: text("subtotal").notNull(),
  vatAmount: text("vat_amount").notNull().default("0"),
  totalAmount: text("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  // pending, paid, overdue, cancelled
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var saleItems = sqliteTable("sale_items", {
  id: text("id").primaryKey(),
  saleId: text("sale_id").references(() => sales.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  totalPrice: text("total_price").notNull(),
  vatRate: text("vat_rate").notNull().default("13.00"),
  vatAmount: text("vat_amount").notNull().default("0")
});
var purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(),
  billNumber: text("bill_number").notNull().unique(),
  supplierId: text("supplier_id").references(() => suppliers.id).notNull(),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  dueDate: integer("due_date", { mode: "timestamp" }),
  subtotal: text("subtotal").notNull(),
  vatAmount: text("vat_amount").notNull().default("0"),
  totalAmount: text("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  // pending, paid, overdue, cancelled
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var purchaseItems = sqliteTable("purchase_items", {
  id: text("id").primaryKey(),
  purchaseId: text("purchase_id").references(() => purchases.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  totalPrice: text("total_price").notNull(),
  vatRate: text("vat_rate").notNull().default("13.00"),
  vatAmount: text("vat_amount").notNull().default("0")
});
var expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  amount: text("amount").notNull(),
  category: text("category").notNull(),
  // rent, utilities, office_supplies, travel, etc.
  expenseDate: integer("expense_date", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  receiptPath: text("receipt_path"),
  isVatApplicable: integer("is_vat_applicable", { mode: "boolean" }).notNull().default(false),
  vatAmount: text("vat_amount").default("0"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});
var insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true
});
var insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true
});
var insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true
});
var insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({
  id: true
});
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
});

// server/database.ts
import { randomUUID } from "crypto";
var sqlite = new Database("./database.db");
sqlite.pragma("journal_mode = WAL");
var db = drizzle(sqlite, { schema: schema_exports });
async function initializeDatabase() {
  try {
    try {
      migrate(db, { migrationsFolder: "./migrations" });
    } catch (error) {
      console.log("No migrations to run or migration error:", error);
    }
    try {
      sqlite.exec(`
        ALTER TABLE customers ADD COLUMN outstanding_balance TEXT NOT NULL DEFAULT '0';
      `);
      console.log("Added outstanding_balance column to customers table");
    } catch (error) {
    }
    try {
      sqlite.exec(`
        ALTER TABLE suppliers ADD COLUMN outstanding_balance TEXT NOT NULL DEFAULT '0';
      `);
      console.log("Added outstanding_balance column to suppliers table");
    } catch (error) {
    }
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length === 0) {
      console.log("Seeding database with default data...");
      await db.insert(companySettings).values({
        id: randomUUID(),
        companyName: "Your Company Name",
        registrationNumber: "",
        address: "",
        phone: "",
        email: "",
        vatNumber: "",
        panNumber: "",
        vatRate: "13.00",
        taxYear: "2080-81",
        autoVatCalculation: true,
        includeVatInPrice: false
      });
      const defaultCategories = [
        { name: "Electronics", description: "Electronic products and accessories" },
        { name: "Clothing", description: "Clothing and apparel" },
        { name: "Home & Garden", description: "Home and garden items" },
        { name: "Books", description: "Books and educational materials" }
      ];
      for (const category of defaultCategories) {
        await db.insert(categories).values({
          id: randomUUID(),
          name: category.name,
          description: category.description,
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      console.log("Database seeded successfully!");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// server/drizzle-storage.ts
var DrizzleStorage = class {
  // Users
  async getUser(id) {
    const users2 = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return users2[0];
  }
  async getUserByUsername(username) {
    const users2 = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return users2[0];
  }
  async createUser(insertUser) {
    const id = randomUUID2();
    const user = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? "staff",
      isActive: insertUser.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(users).values(user);
    return user;
  }
  async updateUser(id, update) {
    await db.update(users).set(update).where(eq(users.id, id));
    return this.getUser(id);
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.changes > 0;
  }
  async getUsers() {
    return await db.select().from(users);
  }
  // Company Settings
  async getCompanySettings() {
    const settings = await db.select().from(companySettings).limit(1);
    return settings[0];
  }
  async updateCompanySettings(settings) {
    const existing = await this.getCompanySettings();
    if (existing) {
      await db.update(companySettings).set(settings).where(eq(companySettings.id, existing.id));
      return await this.getCompanySettings();
    } else {
      const id = randomUUID2();
      const newSettings = { id, ...settings };
      await db.insert(companySettings).values(newSettings);
      return newSettings;
    }
  }
  // Categories
  async getCategories() {
    return await db.select().from(categories);
  }
  async getCategory(id) {
    const categories2 = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return categories2[0];
  }
  async createCategory(insertCategory) {
    const id = randomUUID2();
    const category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(categories).values(category);
    return category;
  }
  async updateCategory(id, update) {
    await db.update(categories).set(update).where(eq(categories.id, id));
    return this.getCategory(id);
  }
  async deleteCategory(id) {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.changes > 0;
  }
  // Suppliers
  async getSuppliers() {
    return await db.select().from(suppliers);
  }
  async getSupplier(id) {
    const suppliers2 = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return suppliers2[0];
  }
  async createSupplier(insertSupplier) {
    const id = randomUUID2();
    const supplier = {
      id,
      name: insertSupplier.name,
      contactPerson: insertSupplier.contactPerson ?? null,
      email: insertSupplier.email ?? null,
      phone: insertSupplier.phone ?? null,
      address: insertSupplier.address ?? null,
      vatNumber: insertSupplier.vatNumber ?? null,
      panNumber: insertSupplier.panNumber ?? null,
      paymentTerms: insertSupplier.paymentTerms ?? null,
      isActive: insertSupplier.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(suppliers).values(supplier);
    return supplier;
  }
  async updateSupplier(id, update) {
    await db.update(suppliers).set(update).where(eq(suppliers.id, id));
    return this.getSupplier(id);
  }
  async deleteSupplier(id) {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return result.changes > 0;
  }
  async updateSupplierBalance(id, amount) {
    const supplier = await this.getSupplier(id);
    if (!supplier) return false;
    const currentBalance = parseFloat(supplier.outstandingBalance || "0");
    const newBalance = Math.max(0, currentBalance + amount);
    await db.update(suppliers).set({ outstandingBalance: newBalance.toString() }).where(eq(suppliers.id, id));
    return true;
  }
  // Customers
  async getCustomers() {
    return await db.select().from(customers);
  }
  async getCustomer(id) {
    const customers2 = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return customers2[0];
  }
  async createCustomer(insertCustomer) {
    const id = randomUUID2();
    const customer = {
      id,
      name: insertCustomer.name,
      contactPerson: insertCustomer.contactPerson ?? null,
      email: insertCustomer.email ?? null,
      phone: insertCustomer.phone ?? null,
      address: insertCustomer.address ?? null,
      vatNumber: insertCustomer.vatNumber ?? null,
      panNumber: insertCustomer.panNumber ?? null,
      creditLimit: insertCustomer.creditLimit ?? null,
      paymentTerms: insertCustomer.paymentTerms ?? null,
      isActive: insertCustomer.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(customers).values(customer);
    return customer;
  }
  async updateCustomer(id, update) {
    await db.update(customers).set(update).where(eq(customers.id, id));
    return this.getCustomer(id);
  }
  async deleteCustomer(id) {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.changes > 0;
  }
  async updateCustomerBalance(id, amount) {
    const customer = await this.getCustomer(id);
    if (!customer) return false;
    const currentBalance = parseFloat(customer.outstandingBalance || "0");
    const newBalance = Math.max(0, currentBalance + amount);
    await db.update(customers).set({ outstandingBalance: newBalance.toString() }).where(eq(customers.id, id));
    return true;
  }
  // Products
  async getProducts() {
    return await db.select().from(products);
  }
  async getProduct(id) {
    const products2 = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return products2[0];
  }
  async getProductBySku(sku) {
    const products2 = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    return products2[0];
  }
  async createProduct(insertProduct) {
    const id = randomUUID2();
    const product = {
      id,
      name: insertProduct.name,
      sku: insertProduct.sku,
      description: insertProduct.description ?? null,
      categoryId: insertProduct.categoryId ?? null,
      unitPrice: insertProduct.unitPrice,
      costPrice: insertProduct.costPrice ?? null,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      minStockLevel: insertProduct.minStockLevel ?? null,
      unit: insertProduct.unit ?? "pcs",
      vatApplicable: insertProduct.vatApplicable ?? true,
      isActive: insertProduct.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(products).values(product);
    return product;
  }
  async updateProduct(id, update) {
    await db.update(products).set(update).where(eq(products.id, id));
    return this.getProduct(id);
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.changes > 0;
  }
  async updateProductStock(id, quantityChange) {
    const product = await this.getProduct(id);
    if (!product) return false;
    const newQuantity = Math.max(0, product.stockQuantity + quantityChange);
    await db.update(products).set({ stockQuantity: newQuantity }).where(eq(products.id, id));
    return true;
  }
  // Sales
  async getSales() {
    return await db.select().from(sales);
  }
  async getSale(id) {
    const sales2 = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
    return sales2[0];
  }
  async createSale(insertSale) {
    const id = randomUUID2();
    const sale = {
      id,
      invoiceNumber: insertSale.invoiceNumber,
      customerId: insertSale.customerId,
      saleDate: insertSale.saleDate ?? /* @__PURE__ */ new Date(),
      dueDate: insertSale.dueDate ?? null,
      subtotal: insertSale.subtotal,
      vatAmount: insertSale.vatAmount ?? "0",
      totalAmount: insertSale.totalAmount,
      status: insertSale.status ?? "pending",
      notes: insertSale.notes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(sales).values(sale);
    return sale;
  }
  async updateSale(id, update) {
    await db.update(sales).set(update).where(eq(sales.id, id));
    return this.getSale(id);
  }
  async deleteSale(id) {
    await db.delete(saleItems).where(eq(saleItems.saleId, id));
    const result = await db.delete(sales).where(eq(sales.id, id));
    return result.changes > 0;
  }
  async getSalesByCustomer(customerId) {
    return await db.select().from(sales).where(eq(sales.customerId, customerId));
  }
  // Sale Items
  async getSaleItems(saleId) {
    return await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  }
  async createSaleItem(insertSaleItem) {
    const id = randomUUID2();
    const saleItem = {
      id,
      saleId: insertSaleItem.saleId,
      productId: insertSaleItem.productId,
      quantity: insertSaleItem.quantity,
      unitPrice: insertSaleItem.unitPrice,
      totalPrice: insertSaleItem.totalPrice,
      vatRate: insertSaleItem.vatRate ?? "0",
      vatAmount: insertSaleItem.vatAmount ?? "0"
    };
    await db.insert(saleItems).values(saleItem);
    return saleItem;
  }
  async deleteSaleItems(saleId) {
    const result = await db.delete(saleItems).where(eq(saleItems.saleId, saleId));
    return result.changes > 0;
  }
  // Purchases
  async getPurchases() {
    return await db.select().from(purchases);
  }
  async getPurchase(id) {
    const purchases2 = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
    return purchases2[0];
  }
  async createPurchase(insertPurchase) {
    const id = randomUUID2();
    const purchase = {
      id,
      billNumber: insertPurchase.billNumber,
      supplierId: insertPurchase.supplierId,
      purchaseDate: insertPurchase.purchaseDate ?? /* @__PURE__ */ new Date(),
      dueDate: insertPurchase.dueDate ?? null,
      subtotal: insertPurchase.subtotal,
      vatAmount: insertPurchase.vatAmount ?? "0",
      totalAmount: insertPurchase.totalAmount,
      status: insertPurchase.status ?? "pending",
      notes: insertPurchase.notes ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(purchases).values(purchase);
    return purchase;
  }
  async updatePurchase(id, update) {
    await db.update(purchases).set(update).where(eq(purchases.id, id));
    return this.getPurchase(id);
  }
  async deletePurchase(id) {
    await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, id));
    const result = await db.delete(purchases).where(eq(purchases.id, id));
    return result.changes > 0;
  }
  // Purchase Items
  async getPurchaseItems(purchaseId) {
    return await db.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId));
  }
  async createPurchaseItem(insertPurchaseItem) {
    const id = randomUUID2();
    const purchaseItem = {
      id,
      purchaseId: insertPurchaseItem.purchaseId,
      productId: insertPurchaseItem.productId,
      quantity: insertPurchaseItem.quantity,
      unitPrice: insertPurchaseItem.unitPrice,
      totalPrice: insertPurchaseItem.totalPrice,
      vatRate: insertPurchaseItem.vatRate ?? "0",
      vatAmount: insertPurchaseItem.vatAmount ?? "0"
    };
    await db.insert(purchaseItems).values(purchaseItem);
    return purchaseItem;
  }
  async deletePurchaseItems(purchaseId) {
    const result = await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId));
    return result.changes > 0;
  }
  // Expenses
  async getExpenses() {
    return await db.select().from(expenses);
  }
  async getExpense(id) {
    const expenses2 = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    return expenses2[0];
  }
  async createExpense(insertExpense) {
    const id = randomUUID2();
    const expense = {
      id,
      title: insertExpense.title,
      amount: insertExpense.amount,
      description: insertExpense.description ?? null,
      category: insertExpense.category,
      expenseDate: insertExpense.expenseDate ?? /* @__PURE__ */ new Date(),
      receiptPath: insertExpense.receiptPath ?? null,
      isVatApplicable: insertExpense.isVatApplicable ?? false,
      vatAmount: insertExpense.vatAmount ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(expenses).values(expense);
    return expense;
  }
  async updateExpense(id, update) {
    await db.update(expenses).set(update).where(eq(expenses.id, id));
    return this.getExpense(id);
  }
  async deleteExpense(id) {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.changes > 0;
  }
};

// server/storage.ts
var storage = new DrizzleStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/settings/company", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });
  app2.put("/api/settings/company", async (req, res) => {
    try {
      const validatedData = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.updateCompanySettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid company settings data" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });
  app2.put("/api/categories/:id", async (req, res) => {
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
  app2.delete("/api/categories/:id", async (req, res) => {
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
  app2.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers2 = await storage.getSuppliers();
      res.json(suppliers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app2.get("/api/suppliers/:id", async (req, res) => {
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
  app2.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });
  app2.put("/api/suppliers/:id", async (req, res) => {
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
  app2.delete("/api/suppliers/:id", async (req, res) => {
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
  app2.get("/api/customers", async (req, res) => {
    try {
      const customers2 = await storage.getCustomers();
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.get("/api/customers/:id", async (req, res) => {
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
  app2.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Customer validation error:", error);
      if (error instanceof Error && "issues" in error) {
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(400).json({ message: "Invalid customer data" });
      }
    }
  });
  app2.put("/api/customers/:id", async (req, res) => {
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
  app2.delete("/api/customers/:id", async (req, res) => {
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
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
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
  app2.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Product validation error:", error);
      if (error instanceof Error && "issues" in error) {
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(400).json({ message: "Invalid product data" });
      }
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
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
  app2.delete("/api/products/:id", async (req, res) => {
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
  app2.get("/api/sales", async (req, res) => {
    try {
      const sales2 = await storage.getSales();
      res.json(sales2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.get("/api/sales/:id", async (req, res) => {
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
  app2.get("/api/sales/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getSaleItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sale items" });
    }
  });
  app2.post("/api/sales", async (req, res) => {
    try {
      const { items, ...saleData } = req.body;
      if (saleData.saleDate) {
        saleData.saleDate = new Date(saleData.saleDate);
      }
      if (saleData.dueDate) {
        saleData.dueDate = new Date(saleData.dueDate);
      }
      const validatedSale = insertSaleSchema.parse(saleData);
      const sale = await storage.createSale(validatedSale);
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertSaleItemSchema.parse({
            ...item,
            saleId: sale.id
          });
          await storage.createSaleItem(validatedItem);
          await storage.updateProductStock(item.productId, -item.quantity);
        }
      }
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
  app2.put("/api/sales/:id", async (req, res) => {
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
  app2.delete("/api/sales/:id", async (req, res) => {
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
  app2.get("/api/purchases", async (req, res) => {
    try {
      const purchases2 = await storage.getPurchases();
      res.json(purchases2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });
  app2.get("/api/purchases/:id", async (req, res) => {
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
  app2.get("/api/purchases/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getPurchaseItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase items" });
    }
  });
  app2.post("/api/purchases", async (req, res) => {
    try {
      const { items, ...purchaseData } = req.body;
      if (purchaseData.purchaseDate) {
        purchaseData.purchaseDate = new Date(purchaseData.purchaseDate);
      }
      if (purchaseData.dueDate) {
        purchaseData.dueDate = new Date(purchaseData.dueDate);
      }
      const validatedPurchase = insertPurchaseSchema.parse(purchaseData);
      const purchase = await storage.createPurchase(validatedPurchase);
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertPurchaseItemSchema.parse({
            ...item,
            purchaseId: purchase.id
          });
          await storage.createPurchaseItem(validatedItem);
          await storage.updateProductStock(item.productId, item.quantity);
        }
      }
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
  app2.get("/api/expenses", async (req, res) => {
    try {
      const expenses2 = await storage.getExpenses();
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });
  app2.put("/api/expenses/:id", async (req, res) => {
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
  app2.delete("/api/expenses/:id", async (req, res) => {
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
  app2.get("/api/staff", async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });
  app2.post("/api/staff", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [sales2, expenses2, products2, customers2] = await Promise.all([
        storage.getSales(),
        storage.getExpenses(),
        storage.getProducts(),
        storage.getCustomers()
      ]);
      const totalRevenue = sales2.filter((sale) => sale.status === "paid").reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
      const outstandingAmount = sales2.filter((sale) => sale.status === "pending" || sale.status === "overdue").reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
      const monthlyExpenses = expenses2.filter((expense) => {
        const expenseMonth = new Date(expense.expenseDate).getMonth();
        const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
        return expenseMonth === currentMonth;
      }).reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const vatCollected = sales2.filter((sale) => sale.status === "paid").reduce((sum, sale) => sum + parseFloat(sale.vatAmount), 0);
      const overdueCount = sales2.filter((sale) => sale.status === "overdue").length;
      const lowStockProducts = products2.filter((product) => product.stockQuantity <= (product.minStockLevel || 5)).length;
      res.json({
        totalRevenue,
        outstandingAmount,
        monthlyExpenses,
        vatCollected,
        overdueCount,
        lowStockProducts,
        totalProducts: products2.length,
        totalCustomers: customers2.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await initializeDatabase();
  log("Database initialized successfully");
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
