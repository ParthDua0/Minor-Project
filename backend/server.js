const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./database/dbconnection');
dotenv.config();
const userRoutes = require('./routes/userRoute');



const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();
// Middleware
app.use(express.json());
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});