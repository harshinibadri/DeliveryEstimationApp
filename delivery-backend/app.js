const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Pincode = require('./models/Pincode');
const { getAllDocuments } = require('./utils/dbUtils');
const app = express();
app.use(cors({ origin: ['https://delivery-estimation-website.vercel.app']
             methods:["GET"],
              credentials: true}));
app.use(express.json());
// Function to get delivery estimate
const getDeliveryEstimate = (provider, pincode, orderTime, inStock) => {
    let currentDate = new Date(); // Local current date and time
    console.log("Current Date and Time (Local):", currentDate.toLocaleString());
    // Adjust the date if the time is midnight or later
    if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0) {
        currentDate.setDate(currentDate.toLocaleString().getDate() + 1);
    }
    // Set cutoffs in local time
    const cutoffTimeProviderA = new Date(currentDate);
    cutoffTimeProviderA.setHours(17, 0, 0, 0); // 5:00 PM local time

    const cutoffTimeProviderB = new Date(currentDate);
    cutoffTimeProviderB.setHours(9, 0, 0, 0); // 9:00 AM local time

    console.log(`Provider A cutoff (local): ${cutoffTimeProviderA.toLocaleString()}`);
    console.log(`Provider B cutoff (local): ${cutoffTimeProviderB.toLocaleString()}`);

    let deliveryDate = new Date(currentDate); // Initialize delivery date as today
    let sameDayEligibilityCountdown = null;

    // Define regions for delivery days based on the pincode prefix
    const metroCities = ["110", "400", "560"]; // Metro city pincodes
    const nonMetroCities = ["122", "125"]; // Non-metro city pincodes
    const tier2Cities = ["128", "130"]; // Tier 2-3 cities

    let deliveryDays;

    // Determine delivery days based on pincode
    if (metroCities.some(prefix => pincode.startsWith(prefix))) {
        deliveryDays = 2;
    } else if (nonMetroCities.some(prefix => pincode.startsWith(prefix))) {
        deliveryDays = 3;
    } else if (tier2Cities.some(prefix => pincode.startsWith(prefix))) {
        deliveryDays = 5;
    } else {
        deliveryDays = 5;
    }

    // Determine the delivery date based on provider and cutoff times
    if (inStock) {
        if (provider === "Provider A") {
            if (orderTime < cutoffTimeProviderA) {
                sameDayEligibilityCountdown = Math.floor((cutoffTimeProviderA - orderTime) / 1000); // Countdown in seconds
            } else {
                deliveryDate.setDate(currentDate.getDate() + 1); // Set to next day if after 5 PM
            }
        } else if (provider === "Provider B") {
            if (orderTime < cutoffTimeProviderB) {
                sameDayEligibilityCountdown = Math.floor((cutoffTimeProviderB - orderTime) / 1000); // Countdown in seconds
            } else {
                deliveryDate.setDate(currentDate.getDate() + 1); // Set to next day if after 9 AM
            }
        } else {
            // Default behavior if no specific provider
            deliveryDate.setDate(currentDate.getDate() + deliveryDays);
        }
    } else {
        // Out of stock case
        return {
            estimatedDelivery: "Out of stock, delivery not available",
            sameDayEligibilityCountdown: null
        };
    }

    // Format the delivery date in YYYY-MM-DD format
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-CA').split('T')[0];

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
        console.log('Fetched products:', products);

        const productList = products.map(product => ({
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            imageUrl: product.imageUrl || 'https://th.bing.com/th/id/OIP.DAZvhmzO0sxCp-uWdJBEawHaFa?w=216&h=180&c=7&r=0&o=5&pid=1.7'
        }));

        res.json(productList);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ message: 'Error retrieving products' });
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

// Connect to MongoDB
mongoose.connect('mongodb+srv://<Harshini>:<Honey>@cluster0.mongodb.net/<deliveryapp>?retryWrites=true&w=majority', {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});
