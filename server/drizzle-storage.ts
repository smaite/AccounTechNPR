import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from './database';
import * as schema from '@shared/schema';
import type { IStorage } from './storage';
import type {
  User, InsertUser,
  CompanySettings, InsertCompanySettings,
  Category, InsertCategory,
  Supplier, InsertSupplier,
  Customer, InsertCustomer,
  Product, InsertProduct,
  Sale, InsertSale,
  SaleItem, InsertSaleItem,
  Purchase, InsertPurchase,
  PurchaseItem, InsertPurchaseItem,
  Expense, InsertExpense
} from '@shared/schema';

export class DrizzleStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return users[0];
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
      role: insertUser.role ?? 'staff',
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    
    await db.insert(schema.users).values(user);
    return user;
  }

  async updateUser(id: string, update: Partial<InsertUser>): Promise<User | undefined> {
    await db.update(schema.users).set(update).where(eq(schema.users.id, id));
    return this.getUser(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id));
    return result.changes > 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  // Company Settings
  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const settings = await db.select().from(schema.companySettings).limit(1);
    return settings[0];
  }

  async updateCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    const existing = await this.getCompanySettings();
    
    if (existing) {
      await db.update(schema.companySettings).set(settings).where(eq(schema.companySettings.id, existing.id));
      return (await this.getCompanySettings())!;
    } else {
      const id = randomUUID();
      const newSettings = { id, ...settings };
      await db.insert(schema.companySettings).values(newSettings);
      return newSettings;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(schema.categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const categories = await db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
    return categories[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description ?? null,
      createdAt: new Date(),
    };
    
    await db.insert(schema.categories).values(category);
    return category;
  }

  async updateCategory(id: string, update: Partial<InsertCategory>): Promise<Category | undefined> {
    await db.update(schema.categories).set(update).where(eq(schema.categories.id, id));
    return this.getCategory(id);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(schema.categories).where(eq(schema.categories.id, id));
    return result.changes > 0;
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(schema.suppliers);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const suppliers = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id)).limit(1);
    return suppliers[0];
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
      isActive: insertSupplier.isActive ?? true,
      createdAt: new Date(),
    };
    
    await db.insert(schema.suppliers).values(supplier);
    return supplier;
  }

  async updateSupplier(id: string, update: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    await db.update(schema.suppliers).set(update).where(eq(schema.suppliers.id, id));
    return this.getSupplier(id);
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(schema.suppliers).where(eq(schema.suppliers.id, id));
    return result.changes > 0;
  }

  async updateSupplierBalance(id: string, amount: number): Promise<boolean> {
    const supplier = await this.getSupplier(id);
    if (!supplier) return false;
    
    const currentBalance = parseFloat(supplier.outstandingBalance || "0");
    const newBalance = Math.max(0, currentBalance + amount);
    
    await db.update(schema.suppliers)
      .set({ outstandingBalance: newBalance.toString() })
      .where(eq(schema.suppliers.id, id));
    
    return true;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(schema.customers);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
    return customers[0];
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
      paymentTerms: insertCustomer.paymentTerms ?? null,
      isActive: insertCustomer.isActive ?? true,
      createdAt: new Date(),
    };
    
    await db.insert(schema.customers).values(customer);
    return customer;
  }

  async updateCustomer(id: string, update: Partial<InsertCustomer>): Promise<Customer | undefined> {
    await db.update(schema.customers).set(update).where(eq(schema.customers.id, id));
    return this.getCustomer(id);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(schema.customers).where(eq(schema.customers.id, id));
    return result.changes > 0;
  }

  async updateCustomerBalance(id: string, amount: number): Promise<boolean> {
    const customer = await this.getCustomer(id);
    if (!customer) return false;
    
    const currentBalance = parseFloat(customer.outstandingBalance || "0");
    const newBalance = Math.max(0, currentBalance + amount);
    
    await db.update(schema.customers)
      .set({ outstandingBalance: newBalance.toString() })
      .where(eq(schema.customers.id, id));
    
    return true;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(schema.products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const products = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    return products[0];
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const products = await db.select().from(schema.products).where(eq(schema.products.sku, sku)).limit(1);
    return products[0];
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
      unit: insertProduct.unit ?? 'pcs',
      vatApplicable: insertProduct.vatApplicable ?? true,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
    };
    
    await db.insert(schema.products).values(product);
    return product;
  }

  async updateProduct(id: string, update: Partial<InsertProduct>): Promise<Product | undefined> {
    await db.update(schema.products).set(update).where(eq(schema.products.id, id));
    return this.getProduct(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(schema.products).where(eq(schema.products.id, id));
    return result.changes > 0;
  }

  async updateProductStock(id: string, quantityChange: number): Promise<boolean> {
    const product = await this.getProduct(id);
    if (!product) return false;
    
    const newQuantity = Math.max(0, product.stockQuantity + quantityChange);
    await db.update(schema.products)
      .set({ stockQuantity: newQuantity })
      .where(eq(schema.products.id, id));
    
    return true;
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return await db.select().from(schema.sales);
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const sales = await db.select().from(schema.sales).where(eq(schema.sales.id, id)).limit(1);
    return sales[0];
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
      vatAmount: insertSale.vatAmount ?? '0',
      totalAmount: insertSale.totalAmount,
      status: insertSale.status ?? 'pending',
      notes: insertSale.notes ?? null,
      createdAt: new Date(),
    };
    
    await db.insert(schema.sales).values(sale);
    return sale;
  }

  async updateSale(id: string, update: Partial<InsertSale>): Promise<Sale | undefined> {
    await db.update(schema.sales).set(update).where(eq(schema.sales.id, id));
    return this.getSale(id);
  }

  async deleteSale(id: string): Promise<boolean> {
    // Delete sale items first
    await db.delete(schema.saleItems).where(eq(schema.saleItems.saleId, id));
    
    const result = await db.delete(schema.sales).where(eq(schema.sales.id, id));
    return result.changes > 0;
  }

  async getSalesByCustomer(customerId: string): Promise<Sale[]> {
    return await db.select().from(schema.sales).where(eq(schema.sales.customerId, customerId));
  }

  // Sale Items
  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return await db.select().from(schema.saleItems).where(eq(schema.saleItems.saleId, saleId));
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
      vatRate: insertSaleItem.vatRate ?? '0',
      vatAmount: insertSaleItem.vatAmount ?? '0',
    };
    
    await db.insert(schema.saleItems).values(saleItem);
    return saleItem;
  }

  async deleteSaleItems(saleId: string): Promise<boolean> {
    const result = await db.delete(schema.saleItems).where(eq(schema.saleItems.saleId, saleId));
    return result.changes > 0;
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return await db.select().from(schema.purchases);
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const purchases = await db.select().from(schema.purchases).where(eq(schema.purchases.id, id)).limit(1);
    return purchases[0];
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
      vatAmount: insertPurchase.vatAmount ?? '0',
      totalAmount: insertPurchase.totalAmount,
      status: insertPurchase.status ?? 'pending',
      notes: insertPurchase.notes ?? null,
      createdAt: new Date(),
    };
    
    await db.insert(schema.purchases).values(purchase);
    return purchase;
  }

  async updatePurchase(id: string, update: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    await db.update(schema.purchases).set(update).where(eq(schema.purchases.id, id));
    return this.getPurchase(id);
  }

  async deletePurchase(id: string): Promise<boolean> {
    // Delete purchase items first
    await db.delete(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, id));
    
    const result = await db.delete(schema.purchases).where(eq(schema.purchases.id, id));
    return result.changes > 0;
  }

  // Purchase Items
  async getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
    return await db.select().from(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, purchaseId));
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
      vatRate: insertPurchaseItem.vatRate ?? '0',
      vatAmount: insertPurchaseItem.vatAmount ?? '0',
    };
    
    await db.insert(schema.purchaseItems).values(purchaseItem);
    return purchaseItem;
  }

  async deletePurchaseItems(purchaseId: string): Promise<boolean> {
    const result = await db.delete(schema.purchaseItems).where(eq(schema.purchaseItems.purchaseId, purchaseId));
    return result.changes > 0;
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(schema.expenses);
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const expenses = await db.select().from(schema.expenses).where(eq(schema.expenses.id, id)).limit(1);
    return expenses[0];
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
    
    await db.insert(schema.expenses).values(expense);
    return expense;
  }

  async updateExpense(id: string, update: Partial<InsertExpense>): Promise<Expense | undefined> {
    await db.update(schema.expenses).set(update).where(eq(schema.expenses.id, id));
    return this.getExpense(id);
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    return result.changes > 0;
  }
}
