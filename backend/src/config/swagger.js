/**
 * Swagger Configuration
 * API Documentation với OpenAPI 3.0
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Supermarket Management API',
      version: '1.0.0',
      description: 'API Documentation cho hệ thống quản lý siêu thị',
      contact: {
        name: 'API Support',
        email: 'support@supermarket.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using Bearer scheme',
        },
      },
      schemas: {
        // Common Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status: { type: 'string', example: 'OK' },
            message: { type: 'string' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status: { type: 'string', example: 'ERROR' },
            code: { type: 'string' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status: { type: 'string', example: 'ERROR' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Dữ liệu không hợp lệ' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status: { type: 'string', example: 'OK' },
            message: { type: 'string' },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' },
                hasMore: { type: 'boolean' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },

        // Auth Schemas
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 },
            password: { type: 'string', minLength: 1 },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            role_id: { type: 'integer' },
            token: { type: 'string' },
          },
        },

        // Staff Schemas
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            phone: { type: 'string' },
            role_id: { type: 'integer' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateStaffRequest: {
          type: 'object',
          required: ['username', 'email', 'full_name', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string', minLength: 2, maxLength: 100 },
            phone: { type: 'string', pattern: '^[0-9]{10,11}$' },
            password: { type: 'string', minLength: 6 },
            role_id: { type: 'integer', enum: [1, 2, 3], default: 2 },
          },
        },

        // Product Schemas
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            category_name: { type: 'string' },
            brand_name: { type: 'string' },
            unit_name: { type: 'string' },
            is_active: { type: 'boolean' },
            selling_price: { type: 'number' },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['code', 'name', 'category_id', 'unit_id'],
          properties: {
            code: { type: 'string', maxLength: 50 },
            name: { type: 'string', minLength: 2, maxLength: 200 },
            category_id: { type: 'integer' },
            brand_id: { type: 'integer', nullable: true },
            unit_id: { type: 'integer' },
            description: { type: 'string', maxLength: 1000 },
            is_active: { type: 'boolean', default: true },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            cost_price: { type: 'number', minimum: 0 },
            selling_price: { type: 'number', minimum: 0 },
          },
        },

        // Order Schemas
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_code: { type: 'string' },
            customer_name: { type: 'string' },
            store_name: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'cancelled'] },
            payment_status: { type: 'string', enum: ['paid', 'unpaid', 'refunded'] },
            final_amount: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['store_id', 'items', 'subtotal'],
          properties: {
            store_id: { type: 'integer' },
            customer_id: { type: 'integer', nullable: true },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['variant_id', 'quantity', 'unit_price'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity: { type: 'integer', minimum: 1 },
                  unit_price: { type: 'number', minimum: 0 },
                  discount_per_item: { type: 'number', minimum: 0, default: 0 },
                },
              },
            },
            subtotal: { type: 'number', minimum: 0 },
            discount_amount: { type: 'number', minimum: 0, default: 0 },
            tax_amount: { type: 'number', minimum: 0, default: 0 },
            shipping_fee: { type: 'number', minimum: 0, default: 0 },
            payment_method: { type: 'string', enum: ['cash', 'card', 'bank transfer'], default: 'cash' },
            shipping_address: { type: 'string' },
            customer_note: { type: 'string' },
            internal_note: { type: 'string' },
          },
        },

        // Collection Schemas
        Collection: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            parent_id: { type: 'integer', nullable: true },
            level: { type: 'integer' },
            product_count: { type: 'integer' },
          },
        },

        // Inventory Schemas
        Inventory: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            variant_id: { type: 'integer' },
            product_name: { type: 'string' },
            store_name: { type: 'string' },
            quantity: { type: 'integer' },
            stock_status: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock'] },
          },
        },

        // Customer Schemas
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', example: 'KH-202601-00001' },
            full_name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            address: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            group_id: { type: 'integer' },
            group_name: { type: 'string' },
            discount_percentage: { type: 'number' },
            total_lifetime_value: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateCustomerRequest: {
          type: 'object',
          required: ['full_name', 'phone'],
          properties: {
            full_name: { type: 'string', minLength: 2, maxLength: 200 },
            phone: { type: 'string', pattern: '^[0-9]{10,11}$' },
            email: { type: 'string', format: 'email' },
            customer_group_id: { type: 'integer' },
            city_id: { type: 'integer' },
            address: { type: 'string', maxLength: 500 },
            date_of_birth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
          },
        },
        CustomerGroup: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            discount_percentage: { type: 'number' },
            min_purchase_amount: { type: 'number' },
            customer_count: { type: 'integer' },
          },
        },

        // Supplier Schemas
        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', example: 'NCC-202601-00001' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            address: { type: 'string' },
            tax_code: { type: 'string' },
            payment_terms: { type: 'string' },
            city_name: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateSupplierRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 200 },
            phone: { type: 'string', pattern: '^[0-9]{10,11}$' },
            email: { type: 'string', format: 'email' },
            city_id: { type: 'integer' },
            address: { type: 'string', maxLength: 500 },
            tax_code: { type: 'string', maxLength: 50 },
            payment_terms: { type: 'string', maxLength: 100 },
            is_active: { type: 'boolean', default: true },
          },
        },

        // Order Return Schemas
        OrderReturnRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['variant_id', 'quantity'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity: { type: 'number', minimum: 1 },
                  reason: { type: 'string' },
                },
              },
            },
            reason: { type: 'string' },
            refund_method: { type: 'string', enum: ['cash', 'card', 'bank_transfer'], default: 'cash' },
          },
        },
        OrderInvoice: {
          type: 'object',
          properties: {
            invoice_number: { type: 'string' },
            date: { type: 'string', format: 'date' },
            store: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
                phone: { type: 'string' },
              },
            },
            customer: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
              },
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sku: { type: 'string' },
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  unit_price: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                subtotal: { type: 'number' },
                discount: { type: 'number' },
                tax: { type: 'number' },
                total: { type: 'number' },
              },
            },
          },
        },
        
        // Discount Schemas
        Discount: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', example: 'SALE10' },
            name: { type: 'string' },
            description: { type: 'string' },
            discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'] },
            discount_type_name: { type: 'string' },
            discount_value: { type: 'number' },
            max_discount_amount: { type: 'number', nullable: true },
            min_order_amount: { type: 'number' },
            max_uses_total: { type: 'integer', nullable: true },
            max_uses_per_customer: { type: 'integer', default: 1 },
            current_uses: { type: 'integer', default: 0 },
            applies_to: { type: 'string', enum: ['all', 'categories', 'products'], default: 'all' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            is_active: { type: 'boolean', default: true },
            status: { type: 'string', enum: ['active', 'expired', 'upcoming', 'inactive'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        DiscountType: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'] },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        CreateDiscountRequest: {
          type: 'object',
          required: ['code', 'name', 'discount_type', 'discount_value', 'start_date', 'end_date'],
          properties: {
            code: { type: 'string', minLength: 3, maxLength: 20, example: 'NEWYEAR25' },
            name: { type: 'string', minLength: 3, maxLength: 100 },
            description: { type: 'string', maxLength: 500 },
            discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'] },
            discount_value: { type: 'number', minimum: 0.01 },
            max_discount_amount: { type: 'number', nullable: true },
            min_order_amount: { type: 'number', default: 0 },
            max_uses_total: { type: 'integer', nullable: true },
            max_uses_per_customer: { type: 'integer', default: 1 },
            applies_to: { type: 'string', enum: ['all', 'categories', 'products'], default: 'all' },
            applicable_product_ids: { type: 'array', items: { type: 'integer' }, nullable: true },
            applicable_category_ids: { type: 'array', items: { type: 'integer' }, nullable: true },
            customer_group_ids: { type: 'array', items: { type: 'integer' }, nullable: true },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
          },
        },
        ValidateDiscountRequest: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
            order_amount: { type: 'number', nullable: true },
            customer_id: { type: 'integer', nullable: true },
            items: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        ValidateDiscountResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            valid: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                discount_id: { type: 'integer' },
                code: { type: 'string' },
                name: { type: 'string' },
                discount_type: { type: 'string' },
                discount_value: { type: 'number' },
                discount_amount: { type: 'number' },
              },
            },
            message: { type: 'string' },
          },
        },
        
        // Transaction/Cashbook Schemas
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            transaction_code: { type: 'string', example: 'PT-1704067200000' },
            date_key: { type: 'string', format: 'date' },
            store_name: { type: 'string' },
            type_code: { type: 'string', enum: ['SALES_INCOME', 'OTHER_INCOME', 'PURCHASE_EXPENSE', 'SALARY_EXPENSE', 'RENT_EXPENSE', 'UTILITY_EXPENSE', 'OTHER_EXPENSE', 'REFUND', 'DEPOSIT', 'WITHDRAWAL'] },
            type_name: { type: 'string' },
            transaction_type: { type: 'string', enum: ['thu', 'chi'] },
            payment_method_code: { type: 'string' },
            payment_method_name: { type: 'string' },
            amount: { type: 'number' },
            running_balance: { type: 'number', nullable: true },
            reference_type: { type: 'string', nullable: true },
            reference_id: { type: 'integer', nullable: true },
            description: { type: 'string' },
            recipient_name: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
            created_at: { type: 'string', format: 'date-time' },
            created_by_name: { type: 'string' },
            approved_by_name: { type: 'string', nullable: true },
            approved_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CashbookType: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            transaction_direction: { type: 'integer', enum: [1, -1] },
            category: { type: 'string', enum: ['thu', 'chi'] },
            description: { type: 'string' },
          },
        },
        PaymentMethod: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', enum: ['CASH', 'BANK_TRANSFER', 'CARD', 'MOMO', 'ZALOPAY', 'VNPAY', 'OTHER'] },
            name: { type: 'string' },
          },
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['store_id', 'cashbook_type', 'amount'],
          properties: {
            store_id: { type: 'integer' },
            cashbook_type: { type: 'string', description: 'Code of cashbook type' },
            payment_method: { type: 'string', description: 'Code of payment method' },
            amount: { type: 'number', minimum: 0.01 },
            date_key: { type: 'string', format: 'date', nullable: true },
            reference_type: { type: 'string', nullable: true },
            reference_id: { type: 'integer', nullable: true },
            description: { type: 'string', maxLength: 500 },
            recipient_name: { type: 'string', maxLength: 200 },
            recipient_phone: { type: 'string', pattern: '^[0-9]{10,11}$' },
            notes: { type: 'string', maxLength: 1000 },
          },
        },
        TransactionSummary: {
          type: 'object',
          properties: {
            period: {
              type: 'object',
              properties: {
                from: { type: 'string', format: 'date' },
                to: { type: 'string', format: 'date' },
              },
            },
            totals: {
              type: 'object',
              properties: {
                total_income: { type: 'number' },
                total_expense: { type: 'number' },
                net_amount: { type: 'number' },
              },
            },
            by_store: { type: 'array' },
            by_type: { type: 'array' },
          },
        },

        // Shipment Schemas
        Shipment: {
          type: 'object',
          properties: {
            shipment_id: { type: 'integer' },
            order_id: { type: 'integer' },
            order_code: { type: 'string' },
            customer_name: { type: 'string' },
            shipper_code: { type: 'string' },
            shipper_name: { type: 'string' },
            tracking_number: { type: 'string' },
            status_code: { type: 'string' },
            status_name: { type: 'string' },
            shipping_fee: { type: 'number' },
            cod_amount: { type: 'number' },
            weight_kg: { type: 'number' },
            estimated_delivery_date: { type: 'string', format: 'date' },
            actual_delivery_date: { type: 'string', format: 'date' },
            shipping_address: { type: 'string' },
            receiver_name: { type: 'string' },
            receiver_phone: { type: 'string' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            created_by: { type: 'integer' },
          },
        },
        ShipmentStatus: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED'] },
            name: { type: 'string' },
          },
        },
        Shipper: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', enum: ['GHTK', 'GHN', 'VNPOST', 'JANDT', 'BEST', 'NINJAVAN', 'VIETTEL_POST', 'SELF_DELIVERY', 'OTHER'] },
            name: { type: 'string' },
          },
        },
        CreateShipmentRequest: {
          type: 'object',
          required: ['order_id', 'shipper_code'],
          properties: {
            order_id: { type: 'integer' },
            shipper_code: { type: 'string', description: 'Code of shipper' },
            tracking_number: { type: 'string', maxLength: 100 },
            shipping_fee: { type: 'number', minimum: 0 },
            cod_amount: { type: 'number', minimum: 0 },
            weight_kg: { type: 'number', minimum: 0 },
            estimated_delivery_date: { type: 'string', format: 'date' },
            shipping_address: { type: 'string', maxLength: 500 },
            receiver_name: { type: 'string', maxLength: 200 },
            receiver_phone: { type: 'string', pattern: '^[0-9]{10,11}$' },
            notes: { type: 'string', maxLength: 1000 },
          },
        },
        UpdateShipmentStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED'] },
            actual_delivery_date: { type: 'string', format: 'date', description: 'Required when status is DELIVERED' },
            notes: { type: 'string', maxLength: 1000 },
          },
        },

        // Report Schemas
        DailyReportSummary: {
          type: 'object',
          properties: {
            total_orders: { type: 'integer' },
            gross_revenue: { type: 'number' },
            total_discount: { type: 'number' },
            total_shipping: { type: 'number' },
            total_tax: { type: 'number' },
            net_revenue: { type: 'number' },
            avg_order_value: { type: 'number' },
            unique_customers: { type: 'integer' },
          },
        },
        SoldProduct: {
          type: 'object',
          properties: {
            stt: { type: 'integer' },
            product_id: { type: 'integer' },
            product_name: { type: 'string' },
            sku: { type: 'string' },
            variant_id: { type: 'integer' },
            variant_name: { type: 'string' },
            order_count: { type: 'integer' },
            quantity_sold: { type: 'integer' },
            gross_revenue: { type: 'number' },
            discount: { type: 'number' },
            net_revenue: { type: 'number' },
            tax: { type: 'number' },
            avg_price: { type: 'number' },
            profit: { type: 'number' },
          },
        },
        ActualRevenueSummary: {
          type: 'object',
          properties: {
            total_paid: { type: 'number' },
            total_pending: { type: 'number' },
            total_refund: { type: 'number' },
            net_actual: { type: 'number' },
            cashbook_income: { type: 'number' },
            cashbook_expense: { type: 'number' },
            cashbook_net: { type: 'number' },
            grand_total: { type: 'number' },
          },
        },

        // Bank Account Schemas
        BankAccount: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            account_name: { type: 'string', example: 'Siêu Thị Mini' },
            account_number: { type: 'string', example: '1234567890' },
            bank_name: { type: 'string', example: 'Vietcombank' },
            bank_code: { type: 'string', example: 'VCB' },
            branch: { type: 'string', example: 'Chi nhánh Quận 1' },
            store_id: { type: 'integer', nullable: true },
            store_name: { type: 'string' },
            is_default: { type: 'boolean', default: false },
            is_active: { type: 'boolean', default: true },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            created_by_name: { type: 'string' },
          },
        },
        CreateBankAccountRequest: {
          type: 'object',
          required: ['account_name', 'account_number', 'bank_name', 'bank_code'],
          properties: {
            account_name: { type: 'string', minLength: 2, maxLength: 100 },
            account_number: { type: 'string', pattern: '^[0-9]{6,50}$' },
            bank_name: { type: 'string', minLength: 2, maxLength: 100 },
            bank_code: { type: 'string', minLength: 2, maxLength: 20, example: 'VCB' },
            branch: { type: 'string', maxLength: 100 },
            store_id: { type: 'integer', nullable: true },
            is_default: { type: 'boolean', default: false },
            notes: { type: 'string', maxLength: 500 },
          },
        },
        PaymentQR: {
          type: 'object',
          properties: {
            bank_code: { type: 'string' },
            bank_name: { type: 'string' },
            account_number: { type: 'string' },
            account_name: { type: 'string' },
            amount: { type: 'number', nullable: true },
            description: { type: 'string', nullable: true },
            qr_url: { type: 'string', description: 'VietQR image URL' },
            napas_qr: { type: 'string', description: 'NAPAS QR string' },
          },
        },

        // Checkout Schemas
        Checkout: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            checkoutCode: { type: 'string', example: 'CK-260201-001' },
            customerName: { type: 'string', example: 'Nguyễn Văn A' },
            customerContact: { type: 'string', example: 'email@example.com' },
            customerId: { type: 'integer', nullable: true },
            storeId: { type: 'integer' },
            storeName: { type: 'string' },
            createdDate: { type: 'string', format: 'date-time' },
            totalAmount: { type: 'number' },
            subtotal: { type: 'number' },
            discountAmount: { type: 'number' },
            status: { type: 'string', enum: ['Chưa liên hệ', 'Đã gửi email'] },
            paymentStatus: { type: 'string' },
            itemCount: { type: 'integer' },
            emailSentAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CheckoutDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            checkoutCode: { type: 'string' },
            customer: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
              },
            },
            store: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
            status: { type: 'string' },
            displayStatus: { type: 'string' },
            paymentStatus: { type: 'string' },
            subtotal: { type: 'number' },
            discountAmount: { type: 'number' },
            taxAmount: { type: 'number' },
            shippingFee: { type: 'number' },
            totalAmount: { type: 'number' },
            paymentMethod: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  variantId: { type: 'integer' },
                  sku: { type: 'string' },
                  productName: { type: 'string' },
                  variantName: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  lineTotal: { type: 'number' },
                  productImage: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            emailSent: { type: 'boolean' },
            emailSentAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        SendPaymentLinkRequest: {
          type: 'object',
          properties: {
            custom_message: { type: 'string', maxLength: 500 },
          },
        },
        SendPaymentLinkResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            checkout_id: { type: 'integer' },
            checkout_code: { type: 'string' },
            payment_link: { type: 'string' },
            sent_to: { type: 'string' },
            sent_at: { type: 'string', format: 'date-time' },
            message: { type: 'string' },
          },
        },
        MassEmailRequest: {
          type: 'object',
          properties: {
            checkout_ids: { type: 'array', items: { type: 'integer' } },
            store_id: { type: 'integer' },
            exclude_already_sent: { type: 'boolean', default: true },
            custom_message: { type: 'string', maxLength: 500 },
          },
        },
        MassEmailResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            sent_count: { type: 'integer' },
            failed_count: { type: 'integer' },
            sent_checkout_ids: { type: 'array', items: { type: 'integer' } },
            failed_checkouts: { type: 'array', items: { type: 'object' } },
            message: { type: 'string' },
          },
        },
        CheckoutStats: {
          type: 'object',
          properties: {
            totalCheckouts: { type: 'integer' },
            emailedCount: { type: 'integer' },
            notContactedCount: { type: 'integer' },
            totalValue: { type: 'number' },
            avgValue: { type: 'number' },
          },
        },

        // POS Schemas
        POSCheckoutRequest: {
          type: 'object',
          required: ['store_id', 'items', 'subtotal', 'final_amount', 'payment_method'],
          properties: {
            store_id: { type: 'integer' },
            customer_id: { type: 'integer', nullable: true },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['variant_id', 'quantity', 'unit_price'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity: { type: 'number' },
                  unit_price: { type: 'number' },
                  discount_per_item: { type: 'number' },
                },
              },
            },
            subtotal: { type: 'number' },
            discount_amount: { type: 'number' },
            tax_amount: { type: 'number' },
            final_amount: { type: 'number' },
            payment_method: { type: 'string', enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'MOMO', 'ZALOPAY', 'VNPAY'] },
            discount_code: { type: 'string' },
            customer_note: { type: 'string' },
          },
        },
        POSCheckoutResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            order_id: { type: 'integer' },
            order_code: { type: 'string' },
            receipt_url: { type: 'string' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Not enough permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Staff', description: 'Staff management (Admin only)' },
      { name: 'Profile', description: 'User profile management' },
      { name: 'Products', description: 'Product management' },
      { name: 'Collections', description: 'Category management' },
      { name: 'Catalogs', description: 'Price list management' },
      { name: 'Inventory', description: 'Inventory management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'CustomerGroups', description: 'Customer group management' },
      { name: 'Suppliers', description: 'Supplier management' },
      { name: 'Discounts', description: 'Discount/Promotion management' },
      { name: 'Transactions', description: 'Cashbook/Fundbook management' },
      { name: 'Shipments', description: 'Shipment/Delivery management' },
      { name: 'Reports', description: 'End-of-day and revenue reports' },
      { name: 'POS', description: 'Point of Sale - Thanh toán tại quầy' },
      { name: 'Bank Accounts', description: 'Bank account and QR payment management' },
      { name: 'Checkouts', description: 'Abandoned cart / incomplete order management' },
      { name: 'Dashboard', description: 'Dashboard overview' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Supermarket API Docs',
  }));

  // Serve swagger.json
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = { setupSwagger, specs };
