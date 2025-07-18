// MSME Mock Data for Makcik Fatimah's Kuih Business (Comprehensive)
// This file provides a single source of truth for all MSME plugin screens
// Last updated: 2025-07-19 05:00

import { v4 as uuidv4 } from 'uuid';

// --- Inventory (expanded) ---
export const inventory = [
    {
        id: '1',
        name: 'Ondeh-ondeh',
        description: 'Traditional kuih with palm sugar',
        category: 'Kuih',
        price: 0.80,
        cost: 0.40,
        stock: 12,
        unit: 'pieces',
        lowStockThreshold: 10,
        image: require('../../assets/ondeh-ondeh.jpg'),
        perishable: true,
        expiryDate: '2025-07-20',
        manufactureDate: '2025-07-18',
        batch: 'B20250718A',
        autoListEnabled: false,
        status: 'low_stock',
        tags: ['Halal', 'Homemade'],
        isListed: true,
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-19T05:00:00Z',
    },
    {
        id: '2',
        name: 'Kuih Lapis',
        description: 'Layered steamed kuih',
        category: 'Kuih',
        price: 1.00,
        cost: 0.50,
        stock: 8,
        unit: 'pieces',
        lowStockThreshold: 10,
        image: require('../../assets/kuih-lapis.jpeg'),
        perishable: true,
        expiryDate: '2025-07-21',
        manufactureDate: '2025-07-18',
        batch: 'B20250718B',
        autoListEnabled: false,
        status: 'low_stock',
        tags: ['Halal'],
        isListed: true,
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-19T05:00:00Z',
    },
    {
        id: '3',
        name: 'Seri Muka',
        description: 'Glutinous rice with pandan custard',
        category: 'Kuih',
        price: 1.20,
        cost: 0.60,
        stock: 0,
        unit: 'pieces',
        lowStockThreshold: 15,
        image: require('../../assets/seri-muka.jpg'),
        perishable: true,
        expiryDate: '2025-07-18',
        manufactureDate: '2025-07-16',
        batch: 'B20250716A',
        autoListEnabled: false,
        status: 'out_of_stock',
        tags: ['Halal'],
        isListed: false,
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-19T05:00:00Z',
    },
    {
        id: '4',
        name: 'Kuih Talam',
        description: 'Two-layered kuih with coconut',
        category: 'Kuih',
        price: 0.90,
        cost: 0.45,
        stock: 18,
        unit: 'pieces',
        lowStockThreshold: 8,
        image: require('../../assets/kuih-talam.jpeg'),
        perishable: true,
        expiryDate: '2025-07-22',
        manufactureDate: '2025-07-19',
        batch: 'B20250719A',
        autoListEnabled: false,
        status: 'available',
        tags: ['Halal'],
        isListed: true,
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-19T05:00:00Z',
    },
    {
        id: '5',
        name: 'Teh Tarik',
        description: 'Malaysian pulled tea',
        category: 'Beverage',
        price: 2.00,
        cost: 0.80,
        stock: 30,
        unit: 'cups',
        lowStockThreshold: 10,
        image: require('../../assets/teh-tarik.jpg'),
        perishable: false,
        expiryDate: null,
        manufactureDate: null,
        batch: null,
        autoListEnabled: false,
        status: 'available',
        tags: ['Drink'],
        isListed: true,
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-19T05:00:00Z',
    },
    {
        id: '6',
        name: 'Nasi Lemak',
        description: 'Coconut rice with sambal and anchovies',
        category: 'Food',
        price: 3.50,
        cost: 1.80,
        stock: 15,
        unit: 'packets',
        lowStockThreshold: 10,
        image: require('../../assets/nasi-lemak.jpg'),
        perishable: true,
        expiryDate: '2025-07-19',
        manufactureDate: '2025-07-19',
        batch: 'B20250719B',
        autoListEnabled: false,
        status: 'available',
        tags: ['Halal'],
        isListed: true,
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-19T05:00:00Z',
    },
    {
        id: '7',
        name: 'Plastic Packaging',
        description: 'Food-grade plastic containers',
        category: 'Packaging',
        price: 0.10,
        cost: 0.05,
        stock: 200,
        unit: 'pieces',
        lowStockThreshold: 50,
        image: null,
        perishable: false,
        expiryDate: null,
        manufactureDate: null,
        batch: null,
        autoListEnabled: false,
        status: 'available',
        tags: ['Packaging'],
        isListed: false,
        createdAt: '2025-07-01T08:00:00Z',
        updatedAt: '2025-07-19T05:00:00Z',
    },
];

// --- Customers ---
export const customers = [
    { id: 'c1', name: 'Kak Siti', type: 'regular', contact: '012-3456789', loyaltyPoints: 120 },
    { id: 'c2', name: 'Encik Ahmad', type: 'regular', contact: '019-8765432', loyaltyPoints: 80 },
    { id: 'c3', name: 'Walk-in', type: 'walk-in', contact: null, loyaltyPoints: 0 },
    { id: 'c4', name: 'Online Order', type: 'online', contact: 'makcikfatimah@foodapp.com', loyaltyPoints: 0 },
];

// --- Transactions (sales & purchases, expanded) ---
export const transactions = [
    // Sales (type: 'sale')
    { id: uuidv4(), date: '2025-07-18T08:15:00', type: 'sale', productId: '1', qty: 6, price: 0.80, total: 4.80, customerId: 'c3', paymentMethod: 'cash' },
    { id: uuidv4(), date: '2025-07-18T09:30:00', type: 'sale', productId: '2', qty: 4, price: 1.00, total: 4.00, customerId: 'c1', paymentMethod: 'ewallet' },
    { id: uuidv4(), date: '2025-07-18T10:00:00', type: 'sale', productId: '5', qty: 5, price: 2.00, total: 10.00, customerId: 'c3', paymentMethod: 'cash' },
    { id: uuidv4(), date: '2025-07-18T11:45:00', type: 'sale', productId: '6', qty: 3, price: 3.50, total: 10.50, customerId: 'c2', paymentMethod: 'qr' },
    { id: uuidv4(), date: '2025-07-18T13:00:00', type: 'sale', productId: '4', qty: 5, price: 0.90, total: 4.50, customerId: 'c3', paymentMethod: 'cash' },
    { id: uuidv4(), date: '2025-07-18T15:30:00', type: 'sale', productId: '1', qty: 4, price: 0.80, total: 3.20, customerId: 'c4', paymentMethod: 'ewallet' },
    { id: uuidv4(), date: '2025-07-19T08:00:00', type: 'sale', productId: '6', qty: 5, price: 3.50, total: 17.50, customerId: 'c3', paymentMethod: 'cash' },
    { id: uuidv4(), date: '2025-07-19T08:30:00', type: 'sale', productId: '1', qty: 2, price: 0.80, total: 1.60, customerId: 'c1', paymentMethod: 'ewallet' },
    { id: uuidv4(), date: '2025-07-19T09:00:00', type: 'sale', productId: '2', qty: 3, price: 1.00, total: 3.00, customerId: 'c2', paymentMethod: 'qr' },
    { id: uuidv4(), date: '2025-07-19T09:30:00', type: 'sale', productId: '5', qty: 4, price: 2.00, total: 8.00, customerId: 'c3', paymentMethod: 'cash' },
    { id: uuidv4(), date: '2025-07-19T10:00:00', type: 'sale', productId: '4', qty: 2, price: 0.90, total: 1.80, customerId: 'c3', paymentMethod: 'cash' },
    // Purchases (type: 'purchase')
    { id: uuidv4(), date: '2025-07-01T09:00:00', type: 'purchase', productId: null, qty: 1, price: 1200.00, total: 1200.00, supplier: 'Landlord', category: 'rent', description: 'Monthly rent' },
    { id: uuidv4(), date: '2025-07-01T10:00:00', type: 'purchase', productId: null, qty: 1, price: 200.00, total: 200.00, supplier: 'TNB', category: 'utilities', description: 'Electricity bill' },
    { id: uuidv4(), date: '2025-07-01T11:00:00', type: 'purchase', productId: null, qty: 1, price: 80.00, total: 80.00, supplier: 'Syabas', category: 'utilities', description: 'Water bill' },
    { id: uuidv4(), date: '2025-07-02T08:00:00', type: 'purchase', productId: '1', qty: 50, price: 0.40, total: 20.00, supplier: 'Pasar Tani', category: 'ingredients', description: 'Palm sugar, flour' },
    { id: uuidv4(), date: '2025-07-02T09:00:00', type: 'purchase', productId: '5', qty: 30, price: 0.80, total: 24.00, supplier: 'Kedai Runcit', category: 'ingredients', description: 'Tea, milk, sugar' },
    { id: uuidv4(), date: '2025-07-10T10:00:00', type: 'purchase', productId: '7', qty: 100, price: 0.05, total: 5.00, supplier: 'Packaging Supplier', category: 'packaging', description: 'Plastic containers' },
    { id: uuidv4(), date: '2025-07-15T12:00:00', type: 'purchase', productId: null, qty: 1, price: 300.00, total: 300.00, supplier: 'Staff', category: 'staff', description: 'Part-time helper' },
    { id: uuidv4(), date: '2025-07-17T14:00:00', type: 'purchase', productId: null, qty: 1, price: 50.00, total: 50.00, supplier: 'Grab', category: 'transport', description: 'Delivery to customer' },
];

// --- Expenses (fixed & variable, expanded) ---
export const expenses = [
    { id: uuidv4(), date: '2025-07-01', category: 'rent', amount: 1200.00, description: 'Monthly rent' },
    { id: uuidv4(), date: '2025-07-01', category: 'utilities', amount: 200.00, description: 'Electricity bill' },
    { id: uuidv4(), date: '2025-07-01', category: 'utilities', amount: 80.00, description: 'Water bill' },
    { id: uuidv4(), date: '2025-07-02', category: 'ingredients', amount: 44.00, description: 'Palm sugar, flour, tea, milk, sugar' },
    { id: uuidv4(), date: '2025-07-10', category: 'packaging', amount: 5.00, description: 'Plastic containers' },
    { id: uuidv4(), date: '2025-07-15', category: 'staff', amount: 300.00, description: 'Part-time helper' },
    { id: uuidv4(), date: '2025-07-17', category: 'transport', amount: 50.00, description: 'Delivery to customer' },
    { id: uuidv4(), date: '2025-07-12', category: 'marketing', amount: 40.00, description: 'Social media ads' },
    { id: uuidv4(), date: '2025-07-14', category: 'repairs', amount: 20.00, description: 'Fix fridge' },
];

// --- Sales Summary (daily, weekly, monthly, expanded) ---
export const salesSummary = [
    { date: '2025-07-17', totalSales: 45.00, totalUnits: 32, byProduct: { '1': 10, '2': 5, '4': 7, '5': 10 }, byCategory: { 'Kuih': 22, 'Beverage': 10 } },
    { date: '2025-07-18', totalSales: 37.00, totalUnits: 24, byProduct: { '1': 10, '2': 4, '4': 5, '5': 5 }, byCategory: { 'Kuih': 19, 'Beverage': 5 } },
    { date: '2025-07-19', totalSales: 31.90, totalUnits: 16, byProduct: { '1': 2, '2': 3, '4': 2, '5': 4, '6': 5 }, byCategory: { 'Kuih': 7, 'Beverage': 4, 'Food': 5 } },
    // ... more days
];

// --- Group Buy / Surplus / Resource Sharing (for BulkPurchaseScreen) ---
export const groupBuys = [
    {
        id: 'g1',
        title: 'Bulk Coconut Milk Purchase',
        description: 'Group buy for fresh coconut milk, 10L minimum.',
        participants: 4,
        itemsCount: 1,
        deadline: '2025-07-25',
        category: 'Ingredients',
        status: 'Active',
        location: 'Pasar Tani, Shah Alam',
        joined: true,
        currentQuantity: 8,
        targetQuantity: 10,
    },
    {
        id: 'g2',
        title: 'Eco Packaging Order',
        description: 'Order eco-friendly packaging together for discount.',
        participants: 6,
        itemsCount: 2,
        deadline: '2025-07-28',
        category: 'Packaging',
        status: 'Active',
        location: 'Online',
        joined: false,
        currentQuantity: 12,
        targetQuantity: 20,
    },
];

export const surplusListings = [
    {
        id: 's1',
        userName: 'Makcik Fatimah',
        title: 'Surplus Kuih Lapis',
        quantity: 3,
        price: 'RM 0.80',
        expiry: '2025-07-20',
        isSurplus: true,
        description: 'Extra kuih lapis, fresh, expiring soon!',
        category: 'Kuih',
        type: 'offer',
        location: 'Kampung Baru',
        posted: '2025-07-19',
    },
];

// --- Helper Functions ---
/**
 * Get inventory, optionally filtered by category, low stock, or expiring soon.
 */
export function getInventory({ category, lowStock, expiringSoon } = {}) {
    const today = new Date('2025-07-19T05:00:00');
    return inventory.filter(item => {
        if (category && item.category !== category) return false;
        if (lowStock && item.stock > item.lowStockThreshold) return false;
        if (expiringSoon && item.expiryDate) {
            const expiry = new Date(item.expiryDate);
            const diff = (expiry - today) / (1000 * 60 * 60 * 24);
            if (diff > 2) return false;
        }
        return true;
    });
}

/**
 * Get transactions, optionally filtered by type, date range, product, or payment method.
 */
export function getTransactions({ type, from, to, productId, paymentMethod } = {}) {
    return transactions.filter(txn => {
        if (type && txn.type !== type) return false;
        if (from && new Date(txn.date) < new Date(from)) return false;
        if (to && new Date(txn.date) > new Date(to)) return false;
        if (productId && txn.productId !== productId) return false;
        if (paymentMethod && txn.paymentMethod !== paymentMethod) return false;
        return true;
    });
}

/**
 * Get expenses, optionally filtered by category or date range.
 */
export function getExpenses({ category, from, to } = {}) {
    return expenses.filter(exp => {
        if (category && exp.category !== category) return false;
        if (from && new Date(exp.date) < new Date(from)) return false;
        if (to && new Date(exp.date) > new Date(to)) return false;
        return true;
    });
}

/**
 * Get sales summary, optionally filtered by date range, by product, or by category.
 */
export function getSalesSummary({ from, to, byProduct, byCategory } = {}) {
    let filtered = salesSummary.filter(sale => {
        if (from && new Date(sale.date) < new Date(from)) return false;
        if (to && new Date(sale.date) > new Date(to)) return false;
        return true;
    });
    if (byProduct) {
        return filtered.map(sale => ({ date: sale.date, byProduct: sale.byProduct }));
    }
    if (byCategory) {
        return filtered.map(sale => ({ date: sale.date, byCategory: sale.byCategory }));
    }
    return filtered;
}

/**
 * Get current stock status (low stock, out of stock, expiring soon)
 */
export function getStockStatus({ lowStockThreshold = 10, expiringInDays = 2 } = {}) {
    const today = new Date('2025-07-19T05:00:00');
    return inventory.map(item => {
        let status = 'ok';
        if (item.stock <= (item.lowStockThreshold || lowStockThreshold)) status = 'low_stock';
        if (item.stock === 0) status = 'out_of_stock';
        if (item.expiryDate) {
            const expiry = new Date(item.expiryDate);
            const diff = (expiry - today) / (1000 * 60 * 60 * 24);
            if (diff <= expiringInDays) status = 'expiring_soon';
        }
        return { ...item, status };
    });
}

/**
 * Get customer list, optionally filtered by type.
 */
export function getCustomerList({ type } = {}) {
    return customers.filter(c => (type ? c.type === type : true));
}

/**
 * Get product sales for a given product and date range.
 */
export function getProductSales({ productId, from, to } = {}) {
    return transactions.filter(txn => txn.type === 'sale' && txn.productId === productId &&
        (!from || new Date(txn.date) >= new Date(from)) && (!to || new Date(txn.date) <= new Date(to))
    );
}

/**
 * Get profit for a date range (total sales - total cost of goods sold - expenses)
 */
export function getProfit({ from, to } = {}) {
    // Sales
    const sales = transactions.filter(txn => txn.type === 'sale' &&
        (!from || new Date(txn.date) >= new Date(from)) && (!to || new Date(txn.date) <= new Date(to))
    );
    const totalSales = sales.reduce((sum, txn) => sum + txn.total, 0);
    // COGS
    const cogs = sales.reduce((sum, txn) => {
        const prod = inventory.find(i => i.id === txn.productId);
        return sum + (prod ? prod.cost * txn.qty : 0);
    }, 0);
    // Expenses
    const exp = getExpenses({ from, to });
    const totalExp = exp.reduce((sum, e) => sum + e.amount, 0);
    return {
        totalSales,
        cogs,
        totalExp,
        profit: totalSales - cogs - totalExp,
    };
}

/**
 * Get cash flow for a date range (sales in - purchases/expenses out)
 */
export function getCashFlow({ from, to } = {}) {
    const inflow = transactions.filter(txn => txn.type === 'sale' &&
        (!from || new Date(txn.date) >= new Date(from)) && (!to || new Date(txn.date) <= new Date(to))
    ).reduce((sum, txn) => sum + txn.total, 0);
    const outflow = transactions.filter(txn => txn.type === 'purchase' &&
        (!from || new Date(txn.date) >= new Date(from)) && (!to || new Date(txn.date) <= new Date(to))
    ).reduce((sum, txn) => sum + txn.total, 0);
    return { inflow, outflow, net: inflow - outflow };
}

/**
 * Estimate tax for a given year (simple flat 15% on profit)
 */
export function getTaxEstimate({ year = 2025 } = {}) {
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    const { profit } = getProfit({ from, to });
    return { year, estimatedTax: Math.max(0, profit * 0.15) };
}

/**
 * Calculate break-even units for a product, given fixed costs, price, and cost per unit
 */
export function getBreakEven({ productId, fixedCosts, price, cost }) {
    if (!price || !cost) {
        const prod = inventory.find(i => i.id === productId);
        if (!prod) return null;
        price = prod.price;
        cost = prod.cost;
    }
    if (!fixedCosts) fixedCosts = 1000; // default
    const units = price > cost ? fixedCosts / (price - cost) : null;
    return { units: units ? Math.ceil(units) : null, price, cost, fixedCosts };
}

// Optionally, add more helpers for analytics, group buy, surplus, etc. 