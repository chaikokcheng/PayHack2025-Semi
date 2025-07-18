// Inventory data model and mock data for MSME Inventory

// Inventory item structure
export const inventoryFields = [
    'id', 'name', 'description', 'category', 'price', 'cost', 'stock', 'unit',
    'lowStockThreshold', 'image', 'perishable', 'expiryDate', 'manufactureDate',
    'autoListEnabled', 'status', 'tags', 'isListed', 'createdAt', 'updatedAt'
];

// Mock data
let inventoryData = [
    {
        id: '1',
        name: 'Ondeh-ondeh',
        description: 'Traditional kuih with palm sugar',
        category: 'Kuih',
        price: 0.80,
        cost: 0.40,
        stock: 25,
        unit: 'pieces',
        lowStockThreshold: 10,
        image: require('../../assets/ondeh-ondeh.jpg'),
        perishable: true,
        expiryDate: null,
        manufactureDate: null,
        autoListEnabled: false,
        status: 'available',
        tags: ['Halal', 'Homemade'],
        isListed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Kuih Lapis',
        description: '',
        category: 'Kuih',
        price: 1.00,
        cost: 0.50,
        stock: 5,
        unit: 'pieces',
        lowStockThreshold: 10,
        image: require('../../assets/kuih-lapis.jpeg'),
        perishable: true,
        expiryDate: null,
        manufactureDate: null,
        autoListEnabled: false,
        status: 'low_stock',
        tags: ['Halal'],
        isListed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        name: 'Seri Muka',
        description: '',
        category: 'Kuih',
        price: 1.20,
        cost: 0.60,
        stock: 0,
        unit: 'pieces',
        lowStockThreshold: 15,
        image: require('../../assets/seri-muka.jpg'),
        perishable: true,
        expiryDate: null,
        manufactureDate: null,
        autoListEnabled: false,
        status: 'out_of_stock',
        tags: ['Halal'],
        isListed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '4',
        name: 'Kuih Talam',
        description: '',
        category: 'Kuih',
        price: 0.90,
        cost: 0.45,
        stock: 18,
        unit: 'pieces',
        lowStockThreshold: 8,
        image: require('../../assets/kuih-talam.jpeg'),
        perishable: true,
        expiryDate: null,
        manufactureDate: null,
        autoListEnabled: false,
        status: 'available',
        tags: ['Halal'],
        isListed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// CRUD helpers
export function getAllInventory() {
    return inventoryData;
}

export function addInventory(item) {
    // Find the highest numeric ID in inventoryData
    let maxId = 0;
    inventoryData.forEach(i => {
        const numId = parseInt(i.id, 10);
        if (!isNaN(numId) && numId > maxId) maxId = numId;
    });
    const newId = (maxId + 1).toString();
    const newItem = {
        ...item,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    inventoryData = [...inventoryData, newItem];
    return newItem;
}

export function updateInventory(id, updates) {
    inventoryData = inventoryData.map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    return inventoryData.find(item => item.id === id);
}

export function removeInventory(id) {
    inventoryData = inventoryData.filter(item => item.id !== id);
} 