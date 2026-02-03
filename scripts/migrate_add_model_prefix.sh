#!/bin/bash

# ============================================================================
# Database Migration Script: Add model_name_prefix Column
# ============================================================================
# This script safely adds the model_name_prefix column to the channels table
# Supports: PostgreSQL, MySQL, SQLite
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

confirm() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" response
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# ============================================================================
# Database Detection
# ============================================================================

detect_database() {
    print_info "Detecting database type..."

    # Check for database files/configs
    if [ -f "new-api.db" ] || [ -f "data.db" ]; then
        echo "sqlite"
    elif [ -n "$DATABASE_URL" ]; then
        if [[ $DATABASE_URL == postgres* ]]; then
            echo "postgresql"
        elif [[ $DATABASE_URL == mysql* ]]; then
            echo "mysql"
        fi
    else
        echo "unknown"
    fi
}

# ============================================================================
# Backup Functions
# ============================================================================

backup_sqlite() {
    local db_file=$1
    local backup_file="${BACKUP_DIR}/backup_${TIMESTAMP}.db"

    print_info "Backing up SQLite database: $db_file"
    mkdir -p "$BACKUP_DIR"

    if command -v sqlite3 &> /dev/null; then
        sqlite3 "$db_file" ".backup '$backup_file'"
        print_success "Backup created: $backup_file"
        echo "$backup_file"
    else
        print_error "sqlite3 command not found"
        return 1
    fi
}

backup_postgresql() {
    local backup_file="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

    print_info "Backing up PostgreSQL database..."
    mkdir -p "$BACKUP_DIR"

    if command -v pg_dump &> /dev/null; then
        # Extract connection info from DATABASE_URL
        # Format: postgresql://user:pass@host:port/dbname
        pg_dump "$DATABASE_URL" > "$backup_file"
        print_success "Backup created: $backup_file"
        echo "$backup_file"
    else
        print_error "pg_dump command not found"
        return 1
    fi
}

backup_mysql() {
    local backup_file="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

    print_info "Backing up MySQL database..."
    mkdir -p "$BACKUP_DIR"

    if command -v mysqldump &> /dev/null; then
        # Extract connection info from DATABASE_URL
        mysqldump --single-transaction "$DATABASE_URL" > "$backup_file"
        print_success "Backup created: $backup_file"
        echo "$backup_file"
    else
        print_error "mysqldump command not found"
        return 1
    fi
}

# ============================================================================
# Migration Functions
# ============================================================================

migrate_sqlite() {
    local db_file=$1

    print_info "Running migration on SQLite database..."

    sqlite3 "$db_file" <<EOF
-- Check if column already exists
SELECT CASE
    WHEN COUNT(*) > 0 THEN 'EXISTS'
    ELSE 'NOT_EXISTS'
END as status
FROM pragma_table_info('channels')
WHERE name = 'model_name_prefix';

-- Add column if not exists
ALTER TABLE channels ADD COLUMN model_name_prefix VARCHAR(255) DEFAULT NULL;
EOF

    if [ $? -eq 0 ]; then
        print_success "Migration completed successfully"
        return 0
    else
        print_error "Migration failed"
        return 1
    fi
}

migrate_postgresql() {
    print_info "Running migration on PostgreSQL database..."

    psql "$DATABASE_URL" <<EOF
-- Check if column already exists
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'channels'
        AND column_name = 'model_name_prefix'
    ) THEN
        ALTER TABLE channels ADD COLUMN model_name_prefix VARCHAR(255) DEFAULT NULL;
        RAISE NOTICE 'Column model_name_prefix added successfully';
    ELSE
        RAISE NOTICE 'Column model_name_prefix already exists, skipping';
    END IF;
END \$\$;
EOF

    if [ $? -eq 0 ]; then
        print_success "Migration completed successfully"
        return 0
    else
        print_error "Migration failed"
        return 1
    fi
}

migrate_mysql() {
    print_info "Running migration on MySQL database..."

    mysql "$DATABASE_URL" <<EOF
-- Check if column exists and add if not
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'channels'
    AND column_name = 'model_name_prefix'
);

SET @query = IF(@col_exists = 0,
    'ALTER TABLE channels ADD COLUMN model_name_prefix VARCHAR(255) DEFAULT NULL',
    'SELECT "Column already exists" as message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
EOF

    if [ $? -eq 0 ]; then
        print_success "Migration completed successfully"
        return 0
    else
        print_error "Migration failed"
        return 1
    fi
}

# ============================================================================
# Verification Functions
# ============================================================================

verify_sqlite() {
    local db_file=$1

    print_info "Verifying migration..."

    result=$(sqlite3 "$db_file" "SELECT COUNT(*) FROM pragma_table_info('channels') WHERE name = 'model_name_prefix';")

    if [ "$result" -eq 1 ]; then
        print_success "Verification passed: Column exists"

        # Show sample data
        print_info "Sample data from channels table:"
        sqlite3 -header -column "$db_file" "SELECT id, name, model_name_prefix FROM channels LIMIT 3;"
        return 0
    else
        print_error "Verification failed: Column not found"
        return 1
    fi
}

verify_postgresql() {
    print_info "Verifying migration..."

    result=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'channels' AND column_name = 'model_name_prefix';")

    if [ "$result" -eq 1 ]; then
        print_success "Verification passed: Column exists"

        # Show sample data
        print_info "Sample data from channels table:"
        psql "$DATABASE_URL" -c "SELECT id, name, model_name_prefix FROM channels LIMIT 3;"
        return 0
    else
        print_error "Verification failed: Column not found"
        return 1
    fi
}

verify_mysql() {
    print_info "Verifying migration..."

    result=$(mysql "$DATABASE_URL" -sN -e "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'channels' AND column_name = 'model_name_prefix';")

    if [ "$result" -eq 1 ]; then
        print_success "Verification passed: Column exists"

        # Show sample data
        print_info "Sample data from channels table:"
        mysql "$DATABASE_URL" -e "SELECT id, name, model_name_prefix FROM channels LIMIT 3;"
        return 0
    else
        print_error "Verification failed: Column not found"
        return 1
    fi
}

# ============================================================================
# Rollback Functions
# ============================================================================

rollback_sqlite() {
    local db_file=$1
    local backup_file=$2

    print_warning "Rolling back SQLite database..."

    if [ -f "$backup_file" ]; then
        cp "$backup_file" "$db_file"
        print_success "Database restored from backup"
    else
        print_error "Backup file not found: $backup_file"
        return 1
    fi
}

rollback_postgresql() {
    local backup_file=$1

    print_warning "Rolling back PostgreSQL database..."

    if [ -f "$backup_file" ]; then
        psql "$DATABASE_URL" < "$backup_file"
        print_success "Database restored from backup"
    else
        print_error "Backup file not found: $backup_file"
        return 1
    fi
}

rollback_mysql() {
    local backup_file=$1

    print_warning "Rolling back MySQL database..."

    if [ -f "$backup_file" ]; then
        mysql "$DATABASE_URL" < "$backup_file"
        print_success "Database restored from backup"
    else
        print_error "Backup file not found: $backup_file"
        return 1
    fi
}

# ============================================================================
# Main Script
# ============================================================================

main() {
    print_header "Database Migration: Add model_name_prefix Column"

    # Detect database type
    DB_TYPE=$(detect_database)

    if [ "$DB_TYPE" = "unknown" ]; then
        print_error "Could not detect database type"
        print_info "Please set DATABASE_URL environment variable or ensure database file exists"
        exit 1
    fi

    print_success "Detected database type: $DB_TYPE"

    # Find database file for SQLite
    if [ "$DB_TYPE" = "sqlite" ]; then
        if [ -f "new-api.db" ]; then
            DB_FILE="new-api.db"
        elif [ -f "data.db" ]; then
            DB_FILE="data.db"
        else
            print_error "SQLite database file not found"
            exit 1
        fi
        print_info "Using database file: $DB_FILE"
    fi

    # Confirm before proceeding
    echo ""
    print_warning "This script will:"
    echo "  1. Create a backup of your database"
    echo "  2. Add the model_name_prefix column to the channels table"
    echo "  3. Verify the migration"
    echo ""

    if ! confirm "Do you want to proceed?"; then
        print_info "Migration cancelled"
        exit 0
    fi

    # Create backup
    echo ""
    print_header "Step 1: Creating Backup"

    case $DB_TYPE in
        sqlite)
            BACKUP_FILE=$(backup_sqlite "$DB_FILE")
            ;;
        postgresql)
            BACKUP_FILE=$(backup_postgresql)
            ;;
        mysql)
            BACKUP_FILE=$(backup_mysql)
            ;;
    esac

    if [ $? -ne 0 ]; then
        print_error "Backup failed. Aborting migration."
        exit 1
    fi

    # Run migration
    echo ""
    print_header "Step 2: Running Migration"

    case $DB_TYPE in
        sqlite)
            migrate_sqlite "$DB_FILE"
            MIGRATION_STATUS=$?
            ;;
        postgresql)
            migrate_postgresql
            MIGRATION_STATUS=$?
            ;;
        mysql)
            migrate_mysql
            MIGRATION_STATUS=$?
            ;;
    esac

    if [ $MIGRATION_STATUS -ne 0 ]; then
        print_error "Migration failed!"

        if confirm "Do you want to rollback to the backup?"; then
            case $DB_TYPE in
                sqlite)
                    rollback_sqlite "$DB_FILE" "$BACKUP_FILE"
                    ;;
                postgresql)
                    rollback_postgresql "$BACKUP_FILE"
                    ;;
                mysql)
                    rollback_mysql "$BACKUP_FILE"
                    ;;
            esac
        fi
        exit 1
    fi

    # Verify migration
    echo ""
    print_header "Step 3: Verifying Migration"

    case $DB_TYPE in
        sqlite)
            verify_sqlite "$DB_FILE"
            ;;
        postgresql)
            verify_postgresql
            ;;
        mysql)
            verify_mysql
            ;;
    esac

    if [ $? -ne 0 ]; then
        print_error "Verification failed!"
        exit 1
    fi

    # Success
    echo ""
    print_header "Migration Completed Successfully!"
    print_success "Backup saved to: $BACKUP_FILE"
    print_info "You can now restart your application to use the new feature"
    echo ""
    print_info "To rollback if needed, run:"
    echo "  ./scripts/rollback_migration.sh $BACKUP_FILE"
}

# Run main function
main "$@"
