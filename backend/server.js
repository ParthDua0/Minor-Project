const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./database/dbconnection');
dotenv.config();
const userRoutes = require('./routes/userRoute');
const User = require('./model/userModel');



const PORT = process.env.PORT || 3001;

const deleteExpiredUnverifiedUsers = async () => {
    try {
        const cutoff = new Date(Date.now() - 30 * 60 * 1000);
        const result = await User.deleteMany({
            verifiyed: false,
            createdAt: { $lte: cutoff }
        });

        if (result.deletedCount > 0) {
            console.log(`Deleted ${result.deletedCount} unverified users older than 30 minutes`);
        }
    } catch (error) {
        console.error('Error deleting expired unverified users:', error.message);
    }
};

// Connect to MongoDB
connectDB().then((connected) => {
    if (connected) {
        deleteExpiredUnverifiedUsers();
        setInterval(deleteExpiredUnverifiedUsers, 5 * 60 * 1000);
    }
});
// Middleware
app.use(express.json());
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
