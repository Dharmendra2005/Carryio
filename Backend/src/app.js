require('dotenv').config();

const path = require('path');   
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const addressRouter = require('./routes/addressRouter');
const orderRouter = require('./routes/orderRouter');
const userRouter = require('././routes/roleRouter/userRouter');
const cartRouter = require('./routes/cartRouter');
const managerRouter = require('./routes/roleRouter/managerRouter');
const productRouter = require('./routes/productRouter');
const rezopayRouter = require('./routes/rezoPayRouter');

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // ← added

connectDB();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true
}));

app.use('/users', userRouter);
app.use('/manager', managerRouter);
app.use('/products', productRouter);
app.use('/addresses', addressRouter);
app.use('/orders', orderRouter);
app.use("/cart", cartRouter);
app.use("/payment", rezopayRouter);

module.exports = app;