const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/products',  require('./routes/productRoutes'));
app.use('/api/cart',      require('./routes/cartRoutes'));
app.use('/api/orders',    require('./routes/orderRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));
app.use('/api/coupons',   require('./routes/couponRoutes'));
app.use('/api/wishlist',  require('./routes/wishlistRoutes'));
app.use('/api/payment',   require('./routes/paymentRoutes'));
app.use('/api/upload',    require('./routes/uploadRoutes'));

app.get('/', (req, res) => res.json({ message: 'ShopSavyy API running' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`ShopSavyy server running on port ${PORT}`));