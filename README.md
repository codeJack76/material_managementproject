# DepEd LR Inventory Management System

A comprehensive Learning Resources Inventory Management System for the **Department of Education - Division of Davao de Oro**. This web-based application streamlines the tracking, management, and distribution of educational materials to schools across the division.

## 📋 Overview

The DepEd LR Inventory Management System is designed to efficiently manage the entire lifecycle of learning resources from inventory tracking to distribution and delivery confirmation. The system provides real-time visibility into material stocks, school assignments, and delivery records while maintaining comprehensive audit trails.

### Key Features

#### 🔐 **Authentication & Security**
- Secure login system with bcrypt password hashing
- Session management with 30-minute inactivity timeout
- Protected routes preventing unauthorized access
- Role-based access control (Admin/User roles)

#### 📦 **Inventory Management**
- Track learning materials by subject, grade level, and education stage
- Real-time quantity monitoring and stock updates
- Material categorization (Elementary/Secondary/Integrated)
- Automatic inventory adjustments on issuance
- Search and filter capabilities

#### 🏫 **School Management**
- Comprehensive school database
- Filter by municipality, school type, and congressional district
- Track issuance history per school
- Support for 11 municipalities in Davao de Oro
- Congressional district mapping (District 1 & 2)

#### 📤 **Issue Items (Material Distribution)**
- Create and manage material issuances to schools
- Real-time inventory deduction on issuance
- Filter by school, material, or search query
- Edit pending issuances before completion
- Complete issuances with delivery confirmation
- Automatic quantity restoration on deletion

#### ✅ **Completed Issue Items (History)**
- Complete delivery records with timestamps
- Remarks and notes for each delivery
- Advanced filtering (date range, school, material)
- Export to CSV for reporting
- Delete records with proper authorization

#### 👥 **User Management** (Admin Only)
- Create and manage user accounts
- Assign roles (Admin/User)
- Password management and updates
- User activity tracking

#### 📊 **Dashboard & Analytics**
- Real-time statistics (materials, schools, issuances)
- Recent activity feed
- Quick action shortcuts
- Visual summary of system status

#### 👤 **User Profile**
- Update personal information
- Change password securely
- View account details and role

### Technology Stack

**Frontend:**
- Next.js 16.0.10 (App Router)
- React 19.2.1
- TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- React Icons

**Backend:**
- Next.js API Routes
- Prisma ORM 6.19.1
- PostgreSQL (Supabase)
- bcryptjs for authentication

**Development:**
- ESLint
- TypeScript strict mode
- Hot module replacement

## 🚀 Getting Started

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database (Supabase account recommended)
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project_ms
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   ```

4. **Set up Prisma and Database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Account

After seeding the database, you can log in with:
- **Username:** `admin`
- **Password:** `admin123`

> ⚠️ **Important:** Change the default admin password immediately after first login.

## 📁 Project Structure

```
project_ms/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── inventory/     # Material management
│   │   │   ├── schools/       # School records
│   │   │   ├── issue-items/   # Material issuance
│   │   │   ├── history/       # Completed issuances
│   │   │   ├── users/         # User management (Admin)
│   │   │   └── profile/       # User profile
│   │   ├── api/               # API routes
│   │   ├── components/        # React components
│   │   └── page.tsx           # Landing/Login page
│   ├── lib/
│   │   ├── auth-context.tsx   # Authentication context
│   │   ├── prisma.ts          # Prisma client
│   │   └── password.ts        # Password utilities
│   └── generated/
│       └── prisma/            # Generated Prisma client
├── public/                    # Static assets
└── package.json
```

## 🔧 Configuration

### Database Configuration

The system uses Prisma with PostgreSQL. Configure your database connection in `prisma.config.ts`:

```typescript
export default {
  datasourceUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
}
```

### Session Timeout

Session timeout is set to 30 minutes of inactivity. Modify in `src/lib/auth-context.tsx`:

```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000; // milliseconds
```

## 📊 Database Schema

### Main Tables

- **User** - System users with authentication
- **Subject** - Academic subjects
- **Material** - Learning resources inventory
- **School** - School records
- **Issuance** - Pending material distributions
- **CompletedIssuance** - Completed delivery records

### Relationships

- Materials belong to Subjects
- Issuances link Materials to Schools
- CompletedIssuances track delivered items

## 🔐 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **Session Management:** Automatic timeout on inactivity
- **Route Protection:** Middleware guards dashboard routes
- **Role-Based Access:** Admin-only features restricted
- **Input Validation:** Server-side validation on all API endpoints

## 📱 User Interface

### Responsive Design
- Mobile-friendly layout
- Collapsible sidebar navigation
- Adaptive tables and forms

### Color Coding
- Blue: Primary actions and navigation
- Green: Success states
- Yellow: Pending states
- Red: Errors and deletions
- Purple: Completed items

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma studio    # Open Prisma Studio (DB GUI)

# Code Quality
npm run lint         # Run ESLint
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Materials
- `GET /api/materials` - List materials (with filters)
- `POST /api/materials` - Create material
- `PUT /api/materials/[id]` - Update material
- `DELETE /api/materials/[id]` - Delete material

### Schools
- `GET /api/schools` - List schools (with filters)
- `POST /api/schools` - Create school
- `PUT /api/schools/[id]` - Update school
- `DELETE /api/schools/[id]` - Delete school

### Issuances
- `GET /api/issuances` - List issuances (with filters)
- `POST /api/issuances` - Create issuance
- `PUT /api/issuances/[id]` - Update issuance
- `POST /api/issuances/[id]/complete` - Complete issuance
- `DELETE /api/issuances/[id]` - Delete issuance

### History
- `GET /api/history` - List completed issuances
- `DELETE /api/history/[id]` - Delete record

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `PUT /api/users/[id]/password` - Change password
- `DELETE /api/users/[id]` - Delete user

### Export
- `GET /api/export/history` - Export history to CSV

## 🎯 Usage Guide

### For Administrators

1. **Managing Inventory**
   - Add new materials with subject, grade level, and quantity
   - Monitor stock levels in real-time
   - Update quantities as needed

2. **Issuing Materials**
   - Select school and material from dropdowns
   - Enter quantity to issue
   - System automatically deducts from inventory

3. **Completing Issuances**
   - Mark pending issuances as completed
   - Add delivery date and remarks
   - Records move to history automatically

4. **User Management**
   - Create user accounts for staff
   - Assign appropriate roles
   - Manage passwords and permissions

### For Regular Users

1. **View Dashboard**
   - Monitor overall system statistics
   - View recent activity

2. **Browse Records**
   - Search and filter materials
   - View school information
   - Check issuance history

## 🏢 Department Information

**Department of Education - Division of Davao de Oro**

**Municipalities Covered:**
- Compostela
- Laak
- Mabini
- Maco
- Maragusan
- Mawab
- Monkayo
- Montevista
- Nabunturan
- New Bataan
- Pantukan

**Congressional Districts:**
- District 1
- District 2

## 📄 License

© 2025 Department of Education - Division of Davao de Oro. All rights reserved.

## 🤝 Support

For technical support or questions, please contact the system administrator.

---

**Built with Next.js** | **Powered by Prisma & PostgreSQL** | **Styled with Tailwind CSS**
