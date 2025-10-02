CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`registration_number` text,
	`address` text,
	`phone` text,
	`email` text,
	`vat_number` text,
	`pan_number` text,
	`vat_rate` text DEFAULT '13.00' NOT NULL,
	`tax_year` text DEFAULT '2080-81' NOT NULL,
	`auto_vat_calculation` integer DEFAULT true NOT NULL,
	`include_vat_in_price` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_person` text,
	`email` text,
	`phone` text,
	`address` text,
	`vat_number` text,
	`pan_number` text,
	`credit_limit` text DEFAULT '0',
	`payment_terms` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`amount` text NOT NULL,
	`category` text NOT NULL,
	`expense_date` integer NOT NULL,
	`receipt_path` text,
	`is_vat_applicable` integer DEFAULT false NOT NULL,
	`vat_amount` text DEFAULT '0',
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`category_id` text,
	`description` text,
	`unit_price` text NOT NULL,
	`cost_price` text,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`min_stock_level` integer DEFAULT 5,
	`unit` text DEFAULT 'pcs' NOT NULL,
	`vat_applicable` integer DEFAULT true NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `purchase_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` text NOT NULL,
	`total_price` text NOT NULL,
	`vat_rate` text DEFAULT '13.00' NOT NULL,
	`vat_amount` text DEFAULT '0' NOT NULL,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`bill_number` text NOT NULL,
	`supplier_id` text NOT NULL,
	`purchase_date` integer NOT NULL,
	`due_date` integer,
	`subtotal` text NOT NULL,
	`vat_amount` text DEFAULT '0' NOT NULL,
	`total_amount` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_bill_number_unique` ON `purchases` (`bill_number`);--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` text NOT NULL,
	`total_price` text NOT NULL,
	`vat_rate` text DEFAULT '13.00' NOT NULL,
	`vat_amount` text DEFAULT '0' NOT NULL,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_number` text NOT NULL,
	`customer_id` text NOT NULL,
	`sale_date` integer NOT NULL,
	`due_date` integer,
	`subtotal` text NOT NULL,
	`vat_amount` text DEFAULT '0' NOT NULL,
	`total_amount` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_invoice_number_unique` ON `sales` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_person` text,
	`email` text,
	`phone` text,
	`address` text,
	`vat_number` text,
	`pan_number` text,
	`payment_terms` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text,
	`phone` text,
	`role` text DEFAULT 'staff' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);