# next-data-kit Playground

A real Next.js application demonstrating next-data-kit with MongoDB.

## Prerequisites

- Node.js 20+
- MongoDB running locally on port 27017

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB (if not running):
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

3. Seed the database:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Features Demonstrated

- **DataKitTable** component with:
  - Server-side pagination
  - Search filtering (name, email)
  - Dropdown filtering (role)
  - Number filtering (age)
  - Multi-column sorting
  - Row selection
  - Bulk delete actions
  - Real-time data from MongoDB

## Environment Variables

Create `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/next-data-kit-demo
```

## Project Structure

```
playground/
├── src/
│   ├── app/
│   │   └── page.tsx          # DataKitTable demo
│   ├── actions/
│   │   └── users.ts          # Server actions
│   ├── models/
│   │   └── User.ts           # Mongoose model
│   └── lib/
│       └── mongodb.ts        # MongoDB connection
├── seed.mjs                  # Database seeder
└── package.json
```

## Notes

- This playground is for development/demo purposes only
- Uses local MongoDB instance
- Sample data is generated on seed
