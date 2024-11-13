require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Pincode = require('./models/Pincode');
const { getAllDocuments } = require('./utils/dbUtils');

const app = express();

// Set up CORS to allow requests from your frontend domain
app.use(cors({
    origin: ['https://delivery-estimation-frontend.vercel.app'],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB using environment variable
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000
        });
        console.log('Database connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}
connectDB();

// Function to get delivery estimate
const getDeliveryEstimate = (provider, pincode, orderTime, inStock) => {
    let currentDate = new Date();
    console.log("Current Date and Time (Local):", currentDate.toLocaleString());

    if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const cutoffTimeProviderA = new Date(currentDate);
    cutoffTimeProviderA.setHours(17, 0, 0, 0);

    const cutoffTimeProviderB = new Date(currentDate);
    cutoffTimeProviderB.setHours(9, 0, 0, 0);

    console.log(`Provider A cutoff (local): ${cutoffTimeProviderA.toLocaleString()}`);
    console.log(`Provider B cutoff (local): ${cutoffTimeProviderB.toLocaleString()}`);

    let deliveryDate = new Date(currentDate);
    let sameDayEligibilityCountdown = null;

    const metroCities = ["110", "400", "560"];
    const nonMetroCities = ["122", "125"];
    const tier2Cities = ["128", "130"];
    let deliveryDays;

    if (metroCities.some(prefix => pincode.startsWith(prefix))) {
        deliveryDays = 2;
    } else if (nonMetroCities.some(prefix => pincode.startsWith(prefix))) {
        deliveryDays = 3;
    } else if (tier2Cities.some(prefix => pincode.startsWith(prefix))) {
        deliveryDays = 5;
    } else {
        deliveryDays = 5;
    }

    if (inStock) {
        if (provider === "Provider A") {
            if (orderTime < cutoffTimeProviderA) {
                sameDayEligibilityCountdown = Math.floor((cutoffTimeProviderA - orderTime) / 1000);
            } else {
                deliveryDate.setDate(currentDate.getDate() + 1);
            }
        } else if (provider === "Provider B") {
            if (orderTime < cutoffTimeProviderB) {
                sameDayEligibilityCountdown = Math.floor((cutoffTimeProviderB - orderTime) / 1000);
            } else {
                deliveryDate.setDate(currentDate.getDate() + 1);
            }
        } else {
            deliveryDate.setDate(currentDate.getDate() + deliveryDays);
        }
    } else {
        return {
            estimatedDelivery: "Out of stock, delivery not available",
            sameDayEligibilityCountdown: null
        };
    }

    const estimatedDelivery = deliveryDate.toLocaleDateString('en-CA');

    return {
        estimatedDelivery,
        sameDayEligibilityCountdown
    };
};

// Route to check pincode with dynamic delivery estimate calculation
app.get('/check-pincode/:pincode', async (req, res) => {
    const { pincode } = req.params;
    console.log(`Received pincode: ${pincode}`);

    try {
        if (!pincode) {
            return res.status(400).json({ error: 'Pincode is not provided' });
        }

        const pincodeData = await Pincode.findOne({ pincode });
        if (!pincodeData) {
            return res.status(400).json({ valid: false, message: 'Invalid Pincode' });
        }

        const provider = pincodeData['Logistics Provider'];
        const inStock = true;
        const { estimatedDelivery, sameDayEligibilityCountdown } = getDeliveryEstimate(
            provider,
            pincode,
            new Date(),
            inStock
        );

        return res.json({
            valid: true,
            logisticsProvider: provider || 'No provider available',
            estimatedDelivery,
            sameDayEligibilityCountdown
        });
    } catch (err) {
        console.error('Error checking pincode:', err.message);
        return res.status(500).json({ error: 'Error checking pincode', details: err.message });
    }
});

// Route to get all products
app.get('/products', async (req, res) => {
    try {
        const products = await getAllDocuments('Products');
        console.log('Fetched products:', products); // Check what `products` contains
        
        if (!Array.isArray(products)) {
            throw new Error("Expected an array of products but received something else.");
        }

        const productList = products.map(product => ({
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            imageUrl: product.imageUrl || 'https://default-image-url.com'
        }));

        res.json(productList);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ message: 'Error retrieving products', details: error.message });
    }
});


// Check product availability based on stock info
app.get('/check-product/:product_id', async (req, res) => {
    const { product_id } = req.params;
    try {
        const productData = await Product.aggregate([
            { $match: { product_id: parseInt(product_id) } },
            {
                $lookup: {
                    from: 'Stock',
                    localField: 'product_id',
                    foreignField: 'product_id',
                    as: 'stock_info'
                }
            },
            { $unwind: '$stock_info' },
            {
                $project: {
                    product_id: 1,
                    product_name: 1,
                    price: 1,
                    stock_available: '$stock_info.stock_available'
                }
            }
        ]);

        if (!productData.length) {
            return res.status(404).json({ available: false, message: 'Product not found' });
        }

        const product = productData[0];
        const inStock = product.stock_available;
        if (!inStock) {
            return res.json({ available: false, message: 'Product not available' });
        }

        res.json({ available: true, product });
    } catch (err) {
        console.error('Error checking product availability:', err.message);
        res.status(500).json({ error: 'Error checking product availability', details: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
