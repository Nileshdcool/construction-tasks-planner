# 🔍 How to View RxDB Data in Your Construction Planner

## 📊 **Method 1: Browser Developer Tools (IndexedDB)**

Since you're using Dexie/IndexedDB storage, your data is stored in the browser's IndexedDB:

### Steps to View Data:
1. **Open Developer Tools**: Press `F12` or right-click → "Inspect"
2. **Go to Application Tab**: In Chrome/Edge DevTools
3. **Expand IndexedDB**: In the left sidebar
4. **Find Your Database**: Look for `construction_planner_db`
5. **Expand Database**: You'll see object stores (collections)
6. **Click on `users`**: See all user records
7. **View Individual Records**: Click on each entry to see the data

### What You'll See:
```
IndexedDB
└── construction_planner_db
    └── users
        ├── user_1727021234567_abc123
        │   ├── id: "user_1727021234567_abc123"
        │   ├── username: "your_username"
        │   ├── createdAt: "2025-09-22T18:30:00.000Z"
        │   └── lastLoginAt: "2025-09-22T18:30:00.000Z"
        └── (more users...)
```

## 🖥️ **Method 2: Browser Console (Real-time Inspection)**

Open the browser console and run these commands to inspect your RxDB data:

### Basic Queries:
```javascript
// Get the database instance
const db = window.rxdbInstance || await initializeDatabase();

// View all users
const allUsers = await db.users.find().exec();
console.table(allUsers.map(user => user.toJSON()));

// Find specific user
const user = await db.users.findOne({ selector: { username: 'your_username' } }).exec();
console.log('Found user:', user?.toJSON());

// Count total users
const userCount = await db.users.count().exec();
console.log('Total users:', userCount);
```

## 🎛️ **Method 3: Add Debug Component to Your App**

I can create a debug component that shows the data directly in your React app.

## 📱 **Method 4: Console Logging (Already Implemented)**

Your app already logs data operations. Look for these in the console:
- `✅ User created:` - Shows newly created users
- `✅ User found:` - Shows found users  
- `✅ User updated:` - Shows updated users

## 🔧 **Method 5: RxDB Query Playground**

Add this to your app for real-time data exploration:

```javascript
// Add to browser console
window.rxdbQuery = async (query) => {
  const db = await initializeDatabase();
  const result = await db.users.find(query).exec();
  return result.map(doc => doc.toJSON());
};

// Usage examples:
await rxdbQuery({}); // All users
await rxdbQuery({ selector: { username: 'john' } }); // Specific user
```

Would you like me to:
1. **Create a Debug Component** for your React app to show data in the UI?
2. **Add Console Helpers** to make data inspection easier?
3. **Show you the exact console commands** to run right now?

Let me know which approach interests you most!