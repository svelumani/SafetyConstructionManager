# MySafety Migration System

## Overview
This is your unified migration system that replaces the multiple conflicting migration systems you had before. It's Docker-compatible and ensures all tables and columns are properly created.

## How to Run Migrations

### Development
```bash
node run-migrations.js
```

### Production/Docker
```bash
NODE_ENV=production tsx migrations/migrate.js
```

## Creating New Migrations

### Step 1: Copy Template
```bash
cp migrations/migration-template.sql migrations/sql/001_your_feature_name.sql
```

### Step 2: Edit the Migration
- Use sequential numbering: `001_`, `002_`, `003_`, etc.
- Add clear description and rollback instructions
- Test thoroughly before applying

### Step 3: Apply Migration
```bash
node run-migrations.js
```

## Migration Naming Convention
- `000_complete_schema_fixed.sql` - Base schema (already applied)
- `001_add_user_preferences.sql` - Add user preferences
- `002_enhance_hazard_tracking.sql` - Enhance hazard features
- `003_add_mobile_support.sql` - Add mobile app support

## Common Migration Patterns

### Add Column
```sql
ALTER TABLE users ADD COLUMN mobile_token TEXT;
```

### Add Table
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Add Index
```sql
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
```

### Add Enum Value
```sql
ALTER TYPE user_role ADD VALUE 'contractor_admin';
```

## Migration Status
You can check which migrations have been applied:
```sql
SELECT * FROM migration_history ORDER BY applied_at;
```

## Rollback
Currently manual rollback only. Use the commented rollback instructions in each migration file.

## Best Practices
1. **Always test migrations** on a copy of production data first
2. **Keep migrations small** and focused on one feature
3. **Add indexes** for new columns that will be queried
4. **Use transactions** (handled automatically by the migration runner)
5. **Document rollback steps** in comments
6. **Never edit applied migrations** - create new ones instead

## Troubleshooting

### Migration Failed
Check the `migration_history` table for failed migrations:
```sql
SELECT * FROM migration_history WHERE status = 'failed';
```

### Schema Mismatch
If your Drizzle schema doesn't match the database, create a migration to align them.

### Docker Issues
The migration system is designed for Docker with enhanced connection handling and error reporting.

### Migrate Backup to Production Database
DATABASE_URL=postgres://postgres:venpep123@localhost:5432/mysafety node migrations/migrate.js