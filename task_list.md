# API REFERENCE - SUPERMARKET MANAGEMENT SYSTEM

**Version:** 3.0  
**Total Endpoints:** 129 APIs  
**Last Updated:** 02/02/2026

---

## 1. AUTHENTICATION (4 APIs)

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/roles
```

**Models:** `dim_users`, `subdim_roles`

---

## 2. PROFILE (5 APIs)

```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/change-password
POST   /api/users/avatar
DELETE /api/users/avatar
```

**Models:** `dim_users`

---

## 3. STAFF MANAGEMENT (6 APIs)

```
GET    /api/staff
POST   /api/staff
GET    /api/staff/:id
PUT    /api/staff/:id
DELETE /api/staff/:id
PUT    /api/staff/:id/role
```

**Models:** `dim_users`, `subdim_roles`, `dim_stores`

---

## 4. PRODUCTS (10 APIs)

```
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
PATCH  /api/products/bulk-status
POST   /api/products/import
GET    /api/products/export
GET    /api/brands
GET    /api/units
```

**Models:** `dim_products`, `dim_product_variants`, `subdim_categories`, `subdim_brands`, `subdim_units`

---

## 5. COLLECTIONS (6 APIs)

```
GET    /api/collections
GET    /api/collections/tree
POST   /api/collections
GET    /api/collections/:id
PUT    /api/collections/:id
DELETE /api/collections/:id
```

**Models:** `subdim_categories`

---

## 6. DASHBOARD (7 APIs)

```
GET    /api/dashboard/overview
GET    /api/dashboard/stats
GET    /api/dashboard/revenue-chart
GET    /api/dashboard/top-products
GET    /api/dashboard/sales-channels
GET    /api/dashboard/top-customers
GET    /api/dashboard/low-stock
```

**Models:** `fact_orders`, `fact_order_items`, `dim_customers`, `fact_inventory_stocks`

---

## 7. CATALOG (5 APIs)

```
GET    /api/catalogs
GET    /api/catalogs/:id
PUT    /api/catalogs/:id
PATCH  /api/catalogs/bulk-update
GET    /api/catalogs/export
```

**Models:** `dim_product_variants`

---

## 8. INVENTORY (9 APIs)

```
GET    /api/stores
GET    /api/transaction-types
GET    /api/inventories
GET    /api/inventories/:variantId
PUT    /api/inventories/:variantId
GET    /api/inventories/:variantId/history
POST   /api/inventories/receive
POST   /api/inventories/transfer
POST   /api/inventories/return
```

**Models:** `fact_inventory_stocks`, `fact_inventory_transactions`, `subdim_transaction_types`, `dim_stores`

---

## 9. PRODUCT IMAGES (7 APIs)

```
GET    /api/products/:id/images
POST   /api/products/:id/image
DELETE /api/products/:id/image
POST   /api/products/:id/images
DELETE /api/products/:id/images/:imageId
PUT    /api/products/:id/images/:imageId/primary
PUT    /api/products/:id/images/reorder
```

**Models:** `dim_product_images`

---

## 10. ORDERS (11 APIs)

```
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
DELETE /api/orders/:id
GET    /api/orders/stats/summary
GET    /api/orders/stats/detailed
POST   /api/orders/:id/return
GET    /api/orders/:id/invoice
GET    /api/orders/returns
GET    /api/orders/returns/:id
```

**Models:** `fact_orders`, `fact_order_items`, `dim_customers`

---

## 11. CUSTOMERS (8 APIs)

```
GET    /api/customers
GET    /api/customers/search
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customer-groups
PUT    /api/customers/:id/group
```

**Models:** `dim_customers`, `subdim_customer_groups`

---

## 12. SUPPLIERS (5 APIs)

```
GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/:id
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id
```

**Models:** `dim_suppliers`

---

## 13. DISCOUNTS (8 APIs)

```
GET    /api/discounts
POST   /api/discounts
GET    /api/discounts/:id
PUT    /api/discounts/:id
DELETE /api/discounts/:id
PATCH  /api/discounts/:id/deactivate
POST   /api/discounts/validate
GET    /api/discounts/types
```

**Models:** `dim_discounts`, `subdim_discount_types`, `fact_discount_usages`

---

## 14. TRANSACTIONS (7 APIs)

```
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/summary
PATCH  /api/transactions/:id/approve
```

**Models:** `fact_cashbook_transactions`, `subdim_cashbook_types`, `subdim_payment_methods`, `fact_store_balances`

---

## 15. SHIPMENTS (8 APIs)

```
GET    /api/shipments
POST   /api/shipments
GET    /api/shipments/:id
PUT    /api/shipments/:id
DELETE /api/shipments/:id
PATCH  /api/shipments/:id/status
GET    /api/shipments/statuses
GET    /api/shipments/shippers
```

**Models:** `fact_shipments`, `fact_shipment_tracking`, `subdim_shipment_statuses`, `dim_carriers`

---

## 16. REPORTS (5 APIs)

```
GET    /api/reports/daily
GET    /api/reports/actual-revenue
GET    /api/reports/sold-products
GET    /api/reports/daily/print
GET    /api/reports/staff
```

**Models:** `fact_orders`, `fact_cashbook_transactions`, `dim_users`

---

## 17. INVENTORY LOOKUP (2 APIs)

```
GET    /api/inventory/lookup/search
GET    /api/inventory/lookup/:productId
```

**Models:** `fact_inventory_stocks`, `dim_products`, `dim_stores`

---

## 18. POS PAYMENT (10 APIs)

```
POST   /api/pos/checkout
GET    /api/pos/products/search
GET    /api/pos/products/:id/price
POST   /api/pos/orders/draft
GET    /api/pos/orders/drafts
GET    /api/pos/orders/drafts/:id
DELETE /api/pos/orders/draft/:id
GET    /api/pos/orders/:id/receipt
POST   /api/pos/discounts/validate
GET    /api/pos/payment-methods
```

**Models:** `fact_orders`, `fact_order_items`, `dim_product_variants`, `subdim_payment_methods`

---

## 19. BANK ACCOUNTS (5 APIs)

```
GET    /api/bank-accounts
POST   /api/bank-accounts
PUT    /api/bank-accounts/:id
DELETE /api/bank-accounts/:id
GET    /api/bank-accounts/:id/qr
```

**Models:** `dim_bank_accounts`

---

## 20. CHECKOUTS (4 APIs)

```
GET    /api/checkouts
GET    /api/checkouts/:id
POST   /api/checkouts/:id/send-link
POST   /api/checkouts/mass-email
```

**Models:** `fact_orders`

---

## 21. CITIES & REGIONS (2 APIs)

```
GET    /api/cities
GET    /api/regions
```

**Models:** `subdim_cities`, `subdim_regions`

---

## DATABASE TABLES SUMMARY

### Dimensions (10 tables)
- `dim_time`
- `dim_stores`
- `dim_suppliers`
- `dim_customers`
- `dim_products`
- `dim_product_variants`
- `dim_product_images`
- `dim_users`
- `dim_discounts`
- `dim_carriers`
- `dim_bank_accounts`

### Sub-Dimensions (11 tables)
- `subdim_regions`
- `subdim_cities`
- `subdim_categories`
- `subdim_brands`
- `subdim_units`
- `subdim_customer_groups`
- `subdim_store_types`
- `subdim_transaction_types`
- `subdim_roles`
- `subdim_permissions`
- `subdim_discount_types`
- `subdim_cashbook_types`
- `subdim_payment_methods`
- `subdim_shipment_statuses`

### Fact Tables (8 tables)
- `fact_inventory_stocks`
- `fact_inventory_transactions`
- `fact_orders`
- `fact_order_items`
- `fact_discount_usages`
- `fact_cashbook_transactions`
- `fact_store_balances`
- `fact_shipments`
- `fact_shipment_tracking`

### Junction Tables (1 table)
- `role_permissions`

---

**Total:** 30 tables, 129 API endpoints