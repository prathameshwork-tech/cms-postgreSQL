# 🚀 MongoDB to PostgreSQL Migration Guide

This document outlines the complete migration of the CMS Complaint Management System from MongoDB to PostgreSQL using Sequelize ORM.

## 📋 Migration Overview

### What Changed:
- **Database**: MongoDB → PostgreSQL
- **ORM**: Mongoose → Sequelize
- **ID Type**: ObjectId → UUID
- **Data Types**: BSON → PostgreSQL native types
- **Relationships**: Embedded documents → Foreign keys

### What Remains Unchanged:
- ✅ JWT Authentication
- ✅ API Endpoints
- ✅ Frontend React components
- ✅ Role-based access control
- ✅ File upload functionality
- ✅ Audit logging

## 🛠️ Setup Instructions

### 1. Install PostgreSQL

```bash
# Run the setup script
./setup-postgresql.sh

# Or manually install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Update Environment Variables

Create/update your `.env` file:

```env
# Database Configuration (PostgreSQL)
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cms_db
DB_HOST=127.0.0.1
DB_PORT=5432

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
# Create tables
npm run db:migrate

# If you need to undo migrations
npm run db:migrate:undo
```

### 5. Seed the Database

```bash
# Add initial data
npm run db:seed

# If you need to undo seeding
npm run db:seed:undo
```

### 6. Start the Server

```bash
npm run dev
```

## 🗄️ Database Schema

### Tables Created:

1. **users** - User accounts and authentication
2. **complaints** - Complaint records with relationships
3. **comments** - Complaint comments (separate table)
4. **logs** - Audit logging and system events

### Key Relationships:
- User → Complaints (as submitter, assignee, resolver)
- Complaint → Comments (one-to-many)
- User → Logs (one-to-many)

## 🔐 Authentication Credentials

### Admin Accounts:
- **Email**: `admin@techcorp.com`
- **Password**: `password123`
- **Role**: Admin

### User Accounts:
- **Email**: `user@techcorp.com`
- **Password**: `password123`
- **Role**: User

## 📊 Data Migration Notes

### UUID vs ObjectId:
- All IDs are now UUIDs instead of MongoDB ObjectIds
- JWT tokens work with UUID strings
- Foreign key relationships use UUIDs

### JSONB Fields:
- `attachments` and `tags` in complaints use PostgreSQL JSONB
- Better performance and querying capabilities
- Native JSON operations supported

### Enum Types:
- PostgreSQL ENUMs for status, priority, category, etc.
- Type safety and validation at database level

## 🚀 New Features

### Enhanced Querying:
- Complex SQL queries with JOINs
- Better performance with proper indexing
- Transaction support for data integrity

### Improved Relationships:
- Proper foreign key constraints
- Cascade delete/update rules
- Referential integrity

### Better Data Types:
- UUID primary keys
- JSONB for flexible data
- Proper date/time handling
- ENUMs for constrained values

## 🔧 Development Commands

```bash
# Database operations
npm run db:migrate          # Run migrations
npm run db:migrate:undo     # Undo last migration
npm run db:seed             # Seed database
npm run db:seed:undo        # Undo seeding
npm run db:reset            # Reset entire database

# Development
npm run dev                 # Start development server
npm start                   # Start production server
```

## 🐛 Troubleshooting

### Common Issues:

1. **PostgreSQL Connection Error**:
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Start PostgreSQL if stopped
   sudo systemctl start postgresql
   ```

2. **Permission Denied**:
   ```bash
   # Fix PostgreSQL permissions
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
   ```

3. **Database Not Found**:
   ```bash
   # Create database manually
   sudo -u postgres psql -c "CREATE DATABASE cms_db;"
   ```

4. **Migration Errors**:
   ```bash
   # Reset database completely
   npm run db:reset
   ```

## 📈 Performance Improvements

### Indexes Added:
- User email (unique)
- Complaint status + priority + created_at
- User + created_at for complaints
- Department + status for complaints
- Log timestamps and user relationships

### Query Optimizations:
- Proper JOINs instead of multiple queries
- JSONB indexing for attachments/tags
- UUID performance optimizations

## 🔄 Migration Benefits

### Advantages of PostgreSQL:
- ✅ ACID compliance
- ✅ Complex queries and transactions
- ✅ Better data integrity
- ✅ Advanced indexing
- ✅ JSONB for flexible data
- ✅ Better scalability
- ✅ Rich ecosystem

### Sequelize Benefits:
- ✅ Type safety with TypeScript support
- ✅ Better relationship management
- ✅ Migration system
- ✅ Seeding capabilities
- ✅ Query optimization
- ✅ Connection pooling

## 🎯 Next Steps

1. **Test the application** with the new PostgreSQL backend
2. **Verify all features** work correctly
3. **Monitor performance** and optimize queries
4. **Set up production** PostgreSQL instance
5. **Configure backups** and monitoring
6. **Update documentation** for team members

## 📞 Support

If you encounter any issues during the migration:

1. Check the troubleshooting section above
2. Review PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
3. Verify environment variables are correct
4. Ensure all dependencies are installed

---

**Migration completed successfully! 🎉**

Your CMS system is now running on PostgreSQL with enhanced performance, better data integrity, and improved scalability. 