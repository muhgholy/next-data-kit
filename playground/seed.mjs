import mongoose from 'mongoose';
import UserModel from './src/models/User.ts';

const User = UserModel.default || UserModel;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/next-data-kit-demo';

const sampleUsers = [
     { name: 'John Doe', email: 'john@example.com', role: 'admin', age: 30, active: true },
     { name: 'Jane Smith', email: 'jane@example.com', role: 'user', age: 25, active: true },
     { name: 'Bob Johnson', email: 'bob@example.com', role: 'user', age: 35, active: true },
     { name: 'Alice Williams', email: 'alice@example.com', role: 'guest', age: 28, active: false },
     { name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', age: 42, active: true },
     { name: 'Diana Prince', email: 'diana@example.com', role: 'admin', age: 31, active: true },
     { name: 'Ethan Hunt', email: 'ethan@example.com', role: 'user', age: 38, active: true },
     { name: 'Fiona Green', email: 'fiona@example.com', role: 'guest', age: 22, active: false },
     { name: 'George Martin', email: 'george@example.com', role: 'user', age: 55, active: true },
     { name: 'Hannah White', email: 'hannah@example.com', role: 'admin', age: 29, active: true },
     { name: 'Ian Black', email: 'ian@example.com', role: 'user', age: 33, active: true },
     { name: 'Julia Roberts', email: 'julia@example.com', role: 'user', age: 27, active: false },
     { name: 'Kevin Hart', email: 'kevin@example.com', role: 'guest', age: 40, active: true },
     { name: 'Laura Palmer', email: 'laura@example.com', role: 'user', age: 26, active: true },
     { name: 'Michael Scott', email: 'michael@example.com', role: 'admin', age: 45, active: true },
     { name: 'Nancy Drew', email: 'nancy@example.com', role: 'user', age: 24, active: true },
     { name: 'Oscar Wilde', email: 'oscar@example.com', role: 'guest', age: 50, active: false },
     { name: 'Pam Beesly', email: 'pam@example.com', role: 'user', age: 32, active: true },
     { name: 'Quincy Jones', email: 'quincy@example.com', role: 'user', age: 48, active: true },
     { name: 'Rachel Green', email: 'rachel@example.com', role: 'admin', age: 28, active: true },
];

async function seed() {
     try {
          await mongoose.connect(MONGODB_URI);
          console.log('Connected to MongoDB');

          // Clear existing users
          await User.deleteMany({});
          console.log('Cleared existing users');

          // Insert sample users
          await User.insertMany(sampleUsers);
          console.log(`Inserted ${sampleUsers.length} sample users`);

          console.log('Seed completed successfully!');
          process.exit(0);
     } catch (error) {
          console.error('Seed failed:', error);
          process.exit(1);
     }
}

seed();
