import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Staff table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("staff"), // admin, staff, accountant
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Company settings
export const companySettings = sqliteTable("company_settings", {
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
  includeVatInPrice: integer("include_vat_in_price", { mode: "boolean" }).notNull().default(false),
});

// Categories
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Suppliers
export const suppliers = sqliteTable("suppliers", {
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Customers
export const customers = sqliteTable("customers", {
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Products
export const products = sqliteTable("products", {
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Sales/Invoices
export const sales = sqliteTable("sales", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: text("customer_id").references(() => customers.id).notNull(),
  saleDate: integer("sale_date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  dueDate: integer("due_date", { mode: "timestamp" }),
  subtotal: text("subtotal").notNull(),
  vatAmount: text("vat_amount").notNull().default("0"),
  totalAmount: text("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Sale Items
export const saleItems = sqliteTable("sale_items", {
  id: text("id").primaryKey(),
  saleId: text("sale_id").references(() => sales.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  totalPrice: text("total_price").notNull(),
  vatRate: text("vat_rate").notNull().default("13.00"),
  vatAmount: text("vat_amount").notNull().default("0"),
});

// Purchases
export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(),
  billNumber: text("bill_number").notNull().unique(),
  supplierId: text("supplier_id").references(() => suppliers.id).notNull(),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  dueDate: integer("due_date", { mode: "timestamp" }),
  subtotal: text("subtotal").notNull(),
  vatAmount: text("vat_amount").notNull().default("0"),
  totalAmount: text("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Purchase Items
export const purchaseItems = sqliteTable("purchase_items", {
  id: text("id").primaryKey(),
  purchaseId: text("purchase_id").references(() => purchases.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  totalPrice: text("total_price").notNull(),
  vatRate: text("vat_rate").notNull().default("13.00"),
  vatAmount: text("vat_amount").notNull().default("0"),
});

// Expenses
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  amount: text("amount").notNull(),
  category: text("category").notNull(), // rent, utilities, office_supplies, travel, etc.
  expenseDate: integer("expense_date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  receiptPath: text("receipt_path"),
  isVatApplicable: integer("is_vat_applicable", { mode: "boolean" }).notNull().default(false),
  vatAmount: text("vat_amount").default("0"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({
  id: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
