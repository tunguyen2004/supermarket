/**
 * Main Routes Index - Tach routes theo module
 * @module routes/index
 */

const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const staffRoutes = require("./staffRoutes");
const profileRoutes = require("./profileRoutes");
const productRoutes = require("./productRoutes");
const collectionRoutes = require("./collectionRoutes");
const catalogRoutes = require("./catalogRoutes");
const inventoryRoutes = require("./inventoryRoutes");
const orderRoutes = require("./orderRoutes");
const customerRoutes = require("./customerRoutes");
const customerGroupRoutes = require("./customerGroupRoutes");
const supplierRoutes = require("./supplierRoutes");
const discountRoutes = require("./discountRoutes");
const cashbookRoutes = require("./cashbookRoutes");
const shipmentRoutes = require("./shipmentRoutes");
const reportRoutes = require("./reportRoutes");
const posRoutes = require("./posRoutes");
const bankAccountRoutes = require("./bankAccountRoutes");
const checkoutRoutes = require("./checkoutRoutes");
const chatbotRoutes = require("./chatbotRoutes");

// Import services for routes not yet modularized
const dashboardService = require("../services/dashboardService");
const inventoryService = require("../services/inventoryService");
const productService = require("../services/productService");
const { verifyToken } = require("../middleware/auth");
const { validateQuery } = require("../middleware/validate");
const { dashboardQuerySchema } = require("../validators/commonValidator");

// Auth routes: /api/auth/*
router.use("/auth", authRoutes);

// Staff routes: /api/staff/*
router.use("/staff", staffRoutes);

// Profile routes: /api/users/*
router.use("/users", profileRoutes);

// Product routes: /api/products/*
router.use("/products", productRoutes);

// Collection routes: /api/collections/*
router.use("/collections", collectionRoutes);

// Catalog routes: /api/catalogs/*
router.use("/catalogs", catalogRoutes);

// Inventory routes: /api/inventories/*
router.use("/inventories", inventoryRoutes);

// Order routes: /api/orders/*
router.use("/orders", orderRoutes);

// Customer routes: /api/customers/*
router.use("/customers", customerRoutes);

// Customer Group routes: /api/customer-groups/*
router.use("/customer-groups", customerGroupRoutes);

// Supplier routes: /api/suppliers/*
router.use("/suppliers", supplierRoutes);

// Discount routes: /api/discounts/*
router.use("/discounts", discountRoutes);

// Cashbook/Transaction routes: /api/transactions/*
router.use("/transactions", cashbookRoutes);

// Shipment routes: /api/shipments/*
router.use("/shipments", shipmentRoutes);

// Report routes: /api/reports/*
router.use("/reports", reportRoutes);

// POS routes: /api/pos/*
router.use("/pos", posRoutes);

// Bank Account routes: /api/bank-accounts/*
router.use("/bank-accounts", bankAccountRoutes);

// Checkout routes: /api/checkouts/*
router.use("/checkouts", checkoutRoutes);

// Chatbot routes: /api/chatbot/*
router.use("/chatbot", chatbotRoutes);

// Brands & Units
router.get("/brands", verifyToken, productService.getBrands);
router.get("/units", verifyToken, productService.getUnits);

// Stores & Transaction Types
router.get("/stores", verifyToken, inventoryService.getStores);
router.get(
  "/transaction-types",
  verifyToken,
  inventoryService.getTransactionTypes,
);

// Cashbook Types & Payment Methods
const cashbookService = require("../services/cashbookService");
router.get("/cashbook-types", verifyToken, cashbookService.getCashbookTypes);
router.get("/payment-methods", verifyToken, cashbookService.getPaymentMethods);

// Inventory Lookup routes
router.get(
  "/inventory/lookup/search",
  verifyToken,
  inventoryService.searchProductsForLookup,
);
router.get(
  "/inventory/lookup/:productId",
  verifyToken,
  inventoryService.getProductInventoryDetail,
);

// Dashboard routes
router.get("/dashboard/overview", verifyToken, dashboardService.getOverview);
router.get(
  "/dashboard/stats",
  verifyToken,
  validateQuery(dashboardQuerySchema),
  dashboardService.getStats,
);
router.get(
  "/dashboard/revenue-chart",
  verifyToken,
  validateQuery(dashboardQuerySchema),
  dashboardService.getRevenueChart,
);
router.get(
  "/dashboard/top-products",
  verifyToken,
  validateQuery(dashboardQuerySchema),
  dashboardService.getTopProducts,
);
router.get(
  "/dashboard/sales-channels",
  verifyToken,
  validateQuery(dashboardQuerySchema),
  dashboardService.getSalesChannels,
);
router.get(
  "/dashboard/top-customers",
  verifyToken,
  validateQuery(dashboardQuerySchema),
  dashboardService.getTopCustomers,
);
router.get(
  "/dashboard/low-stock",
  verifyToken,
  validateQuery(dashboardQuerySchema),
  dashboardService.getLowStock,
);

module.exports = router;
