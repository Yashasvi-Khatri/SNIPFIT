# First Admin Setup Guide

## 🔥 Critical Issue: The Chicken-and-Egg Problem

The invite-only admin system requires existing admins to invite new admins, but there are no existing admins yet. This guide provides several methods to create your **first admin account** and get the system started.

---

## 🚀 Method 1: Direct Database Creation (Recommended for Production)

### **Option A: Using Prisma Studio (Easiest)**

1. **Open Prisma Studio**
   ```bash
   cd server
   npx prisma studio
   ```

2. **Add First Admin**
   - Navigate to the `User` table
   - Click "Add Record"
   - Fill in the details:
     ```
     email: your.admin@snipfit.com
     name: Your Admin Name
     role: ADMIN
     createdAt: (current timestamp)
     updatedAt: (current timestamp)
     ```
   - Click "Save"

3. **Set Up Security Code**
   - Use the security code script:
     ```bash
     npm run set-admin-code your.admin@snipfit.com ADMIN123
     ```
   - Note: Security codes must be exactly 6 alphanumeric characters

### **Option B: Manual SQL via Supabase Dashboard**

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to SQL Editor
   - Run this query:

   ```sql
   INSERT INTO "User" (email, name, role, "createdAt", "updatedAt")
   VALUES ('your.admin@snipfit.com', 'Your Admin Name', 'ADMIN', NOW(), NOW());
   ```

2. **Set Up Security Code**
   ```bash
   npm run set-admin-code your.admin@snipfit.com SECURE123
   ```

---

## 🔧 Method 2: Seed Script (Best for Development)

### **Create Seed Script**

Create a new file `server/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      return;
    }

    // Create first admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@snipfit.com',
        name: 'SNIPFIT Admin',
        role: 'ADMIN',
        adminSecurityCode: 'ADMIN123',
      }
    });

    console.log('✅ First admin created successfully:');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Security Code: ADMIN123');
    console.log('⚠️  CHANGE THIS SECURITY CODE IMMEDIATELY!');
    console.log('📝 Use this command to change it:');
    console.log('npm run set-admin-code admin@snipfit.com NEW_6DIGIT_CODE');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### **Run the Seed Script**

1. **Add seed command to package.json** (if not already there):
   ```json
   "scripts": {
     "seed": "ts-node prisma/seed.ts"
   }
   ```

2. **Run the seed**:
   ```bash
   npm run seed
   ```

3. **Change the security code** (IMPORTANT!):
   ```bash
   npm run set-admin-code admin@snipfit.com YOUR_NEW_SECURE_CODE
   ```

---

## 🌐 Method 3: Supabase Auth Method (Alternative)

### **Step 1: Create User via Supabase Dashboard**

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Fill in:
   - Email: `admin@snipfit.com`
   - Password: `YourSecurePassword123`
   - Auto Confirm User: Yes
4. Click "Create User"

### **Step 2: Add Admin Role to Database**

1. Go to SQL Editor in Supabase
2. Run this query:

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@snipfit.com';
```

### **Step 3: Set Up Security Code**

```bash
npm run set-admin-code admin@snipfit.com YOUR_SECURE_CODE
```

---

## 🔑 Method 4: Environment Variable Setup (Quick Development)

### **Add Admin Credentials to Environment**

Create a temporary setup script and run it with environment variables.

---

## 📋 Method 5: Manual API Request (Development Only)

### **Using Prisma Client Directly**

Create a temporary setup script:

```typescript
// server/scripts/setupFirstAdmin.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupFirstAdmin() {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@snipfit.com',
      name: 'First Admin',
      role: 'ADMIN',
      adminSecurityCode: 'INITIAL123',
    }
  });
  
  console.log('Admin created:', admin.email);
}

setupFirstAdmin().catch(console.error).finally(() => prisma.$disconnect());
```

Run it:
```bash
cd server
npx ts-node scripts/setupFirstAdmin.ts
```

---

## ✅ Recommended Approach for Production

### **Step-by-Step Production Setup**

1. **Use Supabase Dashboard** (most secure):
   - Create user via Supabase Auth
   - Manually update role in database
   - Set security code via script

2. **Or use Prisma Studio** (easiest):
   - Open Prisma Studio
   - Add admin directly to User table
   - Set security code

3. **Immediately change security code**:
   ```bash
   npm run set-admin-code your.admin@email.com YOUR_VERY_SECURE_CODE
   ```

4. **Log in and test**:
   - Navigate to `/admin-login`
   - Enter email + password + security code
   - Verify admin dashboard access

5. **Invite other admins** (now that you have one):
   - Use the Admin Invitation Manager in the dashboard
   - Invite team members securely

---

## ⚠️ CRITICAL: You Need to Create User in BOTH Places

### **The Problem You're Facing**

You created the user in Prisma Studio (database), but users also need to be created in **Supabase Auth** for authentication to work.

### **Solution for Your Current Situation**

Since you already created `yashasvikhattri@gmail.com` in the database via Prisma Studio, you now need to:

1. **Create the same user in Supabase Auth**:
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" → "Create New User"
   - Email: `yashasvikhattri@gmail.com`
   - Password: Set your desired password
   - Auto Confirm User: Yes
   - Click "Create User"

2. **Verify the database user has the right role**:
   - Your Prisma Studio creation should have set `role: ADMIN`
   - If not, run this SQL in Supabase SQL Editor:
   
   ```sql
   UPDATE "User" 
   SET role = 'ADMIN' 
   WHERE email = 'yashasvikhattri@gmail.com';
   ```

3. **Set the security code** (already done):
   ```bash
   cd server
   npm run set-admin-code yashasvikhattri@gmail.com SNIPFIT2024
   ```

### **Then You Can Login**:
- URL: `http://localhost:5173/admin-login`
- Email: `yashasvikhattri@gmail.com`
- Password: (the one you set in Supabase Auth)
- Security Code: `SNIPFIT2024`

---

## 🔒 Security Considerations

### **Important Security Notes**

1. **Change Default Codes Immediately**:
   - Never use default codes like "ADMIN123" in production
   - Generate strong, random security codes
   - Use environment variables for sensitive data

2. **Remove Setup Scripts**:
   - Delete first admin creation scripts after use
   - Remove from git repository
   - Keep no traces of backdoor methods

3. **Audit Trail**:
   - Document who created the first admin
   - Note the creation method
   - Keep security logs

4. **Access Control**:
   - Limit who can run setup scripts
   - Use environment variables for admin credentials
   - Rotate security codes periodically

---

## 🎯 Quick Start Guide for YOU (Your Current Situation)

### **Complete Setup Steps:**

1. **Create User in Supabase Auth** (missing step):
   - Go to your Supabase project dashboard
   - Authentication → Users → Add User
   - Email: `yashasvikhattri@gmail.com`
   - Password: `YourPassword123` (choose secure password)
   - Auto Confirm: Yes
   - Create User

2. **Verify Database Role** (already done via Prisma Studio):
   - Check that the user in your User table has `role: ADMIN`
   - If not, run SQL: `UPDATE "User" SET role = 'ADMIN' WHERE email = 'yashasvikhattri@gmail.com';`

3. **Security Code** (already set):
   - You already set it to `SNIPFIT2024`

4. **Test Login**:
   ```
   URL: http://localhost:5173/admin-login
   Email: yashasvikhattri@gmail.com
   Password: YourPassword123
   Security Code: SNIPFIT2024
   ```

5. **Change Password Later** (if needed):
   - Use Supabase Dashboard to change the password
   - Security code stays separate

---

## 🆘 Troubleshooting

### **Common Issues**

**Issue**: "User not found" during login
- **Solution**: User exists in database but not in Supabase Auth (create in Supabase Auth)

**Issue**: "Invalid security code"  
- **Solution**: Make sure security code is set in database with the script

**Issue**: "Wrong role"
- **Solution**: Run SQL to update role to 'ADMIN' in database

---

## 📝 Post-Setup Checklist

After creating your first admin:

- [x] User created in database (✅ done via Prisma Studio)
- [ ] User created in Supabase Auth (⚠️ you need to do this)
- [x] Security code set (✅ already done)
- [ ] Test admin login with security code
- [ ] Change default password to secure value
- [ ] Invite other team members via admin invitation system
- [ ] Set up admin security codes for all admins
- [ ] Test admin dashboard functionality
- [ ] Review audit logs for admin creation
- [ ] Remove setup scripts and documentation
- [ ] Document admin credentials securely
- [ ] Set up regular security code rotation
- [ ] Configure proper access controls

---

## 🔐 Long-term Admin Management

Once you have your first admin:

1. **Use the Invite System** for all subsequent admins
2. **Regular Security Audits** of admin accounts
3. **Periodic Code Rotation** (every 3-6 months)
4. **Access Reviews** (remove inactive admins)
5. **Monitor Audit Logs** for suspicious activity

---

This guide provides multiple secure methods to create your first admin account. Once you have one admin, you can use the secure invite-only system for all subsequent admin account creations.