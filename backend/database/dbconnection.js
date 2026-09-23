const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
           try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
            });

            console.log('MongoDB connected successfully');
            return true;

        } catch (error) {
            console.error('MongoDB connection failed Because:', error.message);

            await new Promise(resolve => setTimeout(resolve, 5000));
            return false;
        }
};

module.exports = connectDB;
