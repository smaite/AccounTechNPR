import {
  type User, type InsertUser,
  type CompanySettings, type InsertCompanySettings,
  type Category, type InsertCategory,
  type Supplier, type InsertSupplier,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type SaleItem, type InsertSaleItem,
  type Purchase, type InsertPurchase,
  type PurchaseItem, type InsertPurchaseItem,
  type Expense, type InsertExpense
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getUsers(): Promise<User[]>;

  // Company Settings
  getCompanySettings(): Promise<CompanySettings | undefined>;
  updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  updateSupplierBalance(id: string, amount: number): Promise<boolean>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  updateCustomerBalance(id: string, amount: number): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductStock(id: string, quantityChange: number): Promise<boolean>;

  // Sales
  getSales(): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: string, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: string): Promise<boolean>;
  getSalesByCustomer(customerId: string): Promise<Sale[]>;

  // Sale Items
  getSaleItems(saleId: string): Promise<SaleItem[]>;
  createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;
  deleteSaleItems(saleId: string): Promise<boolean>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: string, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined>;
  deletePurchase(id: string): Promise<boolean>;

  // Purchase Items
  getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]>;
  createPurchaseItem(purchaseItem: InsertPurchaseItem): Promise<PurchaseItem>;
  deletePurchaseItems(purchaseId: string): Promise<boolean>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private companySettings: CompanySettings | undefined;
  private categories: Map<string, Category> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private customers: Map<string, Customer> = new Map();
  private products: Map<string, Product> = new Map();
  private sales: Map<string, Sale> = new Map();
  private saleItems: Map<string, SaleItem[]> = new Map();
  private purchases: Map<string, Purchase> = new Map();
  private purchaseItems: Map<string, PurchaseItem[]> = new Map();
  private expenses: Map<string, Expense> = new Map();

  constructor() {
    // Initialize with default company settings
    this.companySettings = {
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
      includeVatInPrice: false,
    };

    // Initialize with some default categories
    const defaultCategories = [
      { name: "Electronics", description: "Electronic products and accessories" },
      { name: "Clothing", description: "Clothing and apparel" },
      { name: "Home & Garden", description: "Home and garden items" },
      { name: "Books", description: "Books and educational materials" },
    ];

    defaultCategories.forEach(cat => {
      const id = randomUUID();
      this.categories.set(id, {
        id,
        name: cat.name,
        description: cat.description,
        createdAt: new Date(),
      });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? "staff",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, update: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...update };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    return this.companySettings;
  }

  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    this.companySettings = {
      id: this.companySettings?.id || randomUUID(),
      companyName: settings.companyName,
      registrationNumber: settings.registrationNumber ?? null,
      address: settings.address ?? null,
      phone: settings.phone ?? null,
      email: settings.email ?? null,
      vatNumber: settings.vatNumber ?? null,
      panNumber: settings.panNumber ?? null,
      vatRate: settings.vatRate ?? "13.00",
      taxYear: settings.taxYear ?? "2080-81",
      autoVatCalculation: settings.autoVatCalculation ?? true,
      includeVatInPrice: settings.includeVatInPrice ?? false,
    };
    return this.companySettings;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description ?? null,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, update: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updatedCategory = { ...category, ...update };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      id,
      name: insertSupplier.name,
      contactPerson: insertSupplier.contactPerson ?? null,
      email: insertSupplier.email ?? null,
      phone: insertSupplier.phone ?? null,
      address: insertSupplier.address ?? null,
      vatNumber: insertSupplier.vatNumber ?? null,
      panNumber: insertSupplier.panNumber ?? null,
      paymentTerms: insertSupplier.paymentTerms ?? null,
      outstandingBalance: "0",
      isActive: insertSupplier.isActive ?? true,
      createdAt: new Date(),
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, update: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    const updatedSupplier = { ...supplier, ...update };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  async updateSupplierBalance(id: string, amount: number): Promise<boolean> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return false;
    
    const currentBalance = parseFloat(supplier.outstandingBalance || "0");
    const newBalance = Math.max(0, currentBalance + amount);
    supplier.outstandingBalance = newBalance.toString();
    this.suppliers.set(id, supplier);
    return true;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      id,
      name: insertCustomer.name,
      contactPerson: insertCustomer.contactPerson ?? null,
      email: insertCustomer.email ?? null,
      phone: insertCustomer.phone ?? null,
      address: insertCustomer.address ?? null,
      vatNumber: insertCustomer.vatNumber ?? null,
      panNumber: insertCustomer.panNumber ?? null,
      creditLimit: insertCustomer.creditLimit ?? null,
      outstandingBalance: "0",
      paymentTerms: insertCustomer.paymentTerms ?? null,
      isActive: insertCustomer.isActive ?? true,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, update: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    const updatedCustomer = { ...customer, ...update };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  async updateCustomerBalance(id: string, amount: number): Promise<boolean> {
    const customer = this.customers.get(id);
    if (!customer) return false;
    
    const currentBalance = parseFloat(customer.outstandingBalance || "0");
    const newBalance = Math.max(0, currentBalance + amount);
    customer.outstandingBalance = newBalance.toString();
    this.customers.set(id, customer);
    return true;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.sku === sku);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
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
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, update: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updatedProduct = { ...product, ...update };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async updateProductStock(id: string, quantityChange: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;
    product.stockQuantity = Math.max(0, product.stockQuantity + quantityChange);
    this.products.set(id, product);
    return true;
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = {
      id,
      invoiceNumber: insertSale.invoiceNumber,
      customerId: insertSale.customerId,
      saleDate: insertSale.saleDate ?? new Date(),
      dueDate: insertSale.dueDate ?? null,
      subtotal: insertSale.subtotal,
      vatAmount: insertSale.vatAmount ?? "0",
      totalAmount: insertSale.totalAmount,
      status: insertSale.status ?? "pending",
      notes: insertSale.notes ?? null,
      createdAt: new Date(),
    };
    this.sales.set(id, sale);
    return sale;
  }

  async updateSale(id: string, update: Partial<InsertSale>): Promise<Sale | undefined> {
    const sale = this.sales.get(id);
    if (!sale) return undefined;
    const updatedSale = { ...sale, ...update };
    this.sales.set(id, updatedSale);
    return updatedSale;
  }

  async deleteSale(id: string): Promise<boolean> {
    this.saleItems.delete(id);
    return this.sales.delete(id);
  }

  async getSalesByCustomer(customerId: string): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(sale => sale.customerId === customerId);
  }

  // Sale Items
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return this.saleItems.get(saleId) || [];
  }

  async createSaleItem(insertSaleItem: InsertSaleItem): Promise<SaleItem> {
    const id = randomUUID();
    const saleItem: SaleItem = {
      id,
      saleId: insertSaleItem.saleId,
      productId: insertSaleItem.productId,
      quantity: insertSaleItem.quantity,
      unitPrice: insertSaleItem.unitPrice,
      totalPrice: insertSaleItem.totalPrice,
      vatRate: insertSaleItem.vatRate ?? "0",
      vatAmount: insertSaleItem.vatAmount ?? "0",
    };
    
    const items = this.saleItems.get(insertSaleItem.saleId) || [];
    items.push(saleItem);
    this.saleItems.set(insertSaleItem.saleId, items);
    
    return saleItem;
  }

  async deleteSaleItems(saleId: string): Promise<boolean> {
    return this.saleItems.delete(saleId);
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values());
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const purchase: Purchase = {
      id,
      billNumber: insertPurchase.billNumber,
      supplierId: insertPurchase.supplierId,
      purchaseDate: insertPurchase.purchaseDate ?? new Date(),
      dueDate: insertPurchase.dueDate ?? null,
      subtotal: insertPurchase.subtotal,
      vatAmount: insertPurchase.vatAmount ?? "0",
      totalAmount: insertPurchase.totalAmount,
      status: insertPurchase.status ?? "pending",
      notes: insertPurchase.notes ?? null,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async updatePurchase(id: string, update: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    const updatedPurchase = { ...purchase, ...update };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async deletePurchase(id: string): Promise<boolean> {
    this.purchaseItems.delete(id);
    return this.purchases.delete(id);
  }

  // Purchase Items
  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    return this.purchaseItems.get(purchaseId) || [];
  }

  async createPurchaseItem(insertPurchaseItem: InsertPurchaseItem): Promise<PurchaseItem> {
    const id = randomUUID();
    const purchaseItem: PurchaseItem = {
      id,
      purchaseId: insertPurchaseItem.purchaseId,
      productId: insertPurchaseItem.productId,
      quantity: insertPurchaseItem.quantity,
      unitPrice: insertPurchaseItem.unitPrice,
      totalPrice: insertPurchaseItem.totalPrice,
      vatRate: insertPurchaseItem.vatRate ?? "0",
      vatAmount: insertPurchaseItem.vatAmount ?? "0",
    };
    
    const items = this.purchaseItems.get(insertPurchaseItem.purchaseId) || [];
    items.push(purchaseItem);
    this.purchaseItems.set(insertPurchaseItem.purchaseId, items);
    
    return purchaseItem;
  }

  async deletePurchaseItems(purchaseId: string): Promise<boolean> {
    return this.purchaseItems.delete(purchaseId);
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      id,
      title: insertExpense.title,
      amount: insertExpense.amount,
      description: insertExpense.description ?? null,
      category: insertExpense.category,
      expenseDate: insertExpense.expenseDate ?? new Date(),
      receiptPath: insertExpense.receiptPath ?? null,
      isVatApplicable: insertExpense.isVatApplicable ?? false,
      vatAmount: insertExpense.vatAmount ?? null,
      createdAt: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, update: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    const updatedExpense = { ...expense, ...update };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }
}

import { DrizzleStorage } from './drizzle-storage';

export const storage = new DrizzleStorage();
