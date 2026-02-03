#!/bin/bash

# ============================================================================
# Rollback Script: Remove model_name_prefix Column
# ============================================================================
# This script safely removes the model_name_prefix column from channels table
# Or restores from a backup file
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
# Rollback Functions
# ============================================================================

rollback_sqlite_from_backup() {
    local db_file=$1
    local backup_file=$2

    print_info "Restoring SQLite database from backup..."

    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi

    cp "$backup_file" "$db_file"
    print_success "Database restored from backup: $backup_file"
}

rollback_sqlite_drop_column() {
    local db_file=$1

    print_info "Removing model_name_prefix column from SQLite database..."

    # SQLite doesn't support DROP COLUMN directly, need to recreate table
    sqlite3 "$db_file" <<EOF
BEGIN TRANSACTION;

-- Create new table without model_name_prefix
CREATE TABLE channels_new AS
SELECT id, type, key, openai_organization, test_model, status, name, weight,
       created_time, test_time, response_time, base_url, other, balance,
       balance_updated_time, models, "group", used_quota, model_mapping,
       status_code_mapping, priority, auto_ban, other_info, tag, setting,
       param_override, header_override, remark, channel_info, settings
FROM channels;

-- Drop old table
DROP TABLE channels;

-- Rename new table
ALTER TABLE channels_new RENAME TO channels;

COMMIT;
EOF

    if [ $? -eq 0 ]; then
        print_success "Column removed successfully"
        return 0
    else
        print_error "Failed to remove column"
        return 1
    fi
}

rollback_postgresql_from_backup() {
    local backup_file=$1

    print_info "Restoring PostgreSQL database from backup..."

    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi

    psql "$DATABASE_URL" < "$backup_file"
    print_success "Database restored from backup: $backup_file"
}

rollback_postgresql_drop_column() {
    print_info "Removing model_name_prefix column from PostgreSQL database..."

    psql "$DATABASE_URL" <<EOF
ALTER TABLE channels DROP COLUMN IF EXISTS model_name_prefix;
EOF

    if [ $? -eq 0 ]; then
        print_success "Column removed successfully"
        return 0
    else
        print_error "Failed to remove column"
        return 1
    fi
}

rollback_mysql_from_backup() {
    local backup_file=$1

    print_info "Restoring MySQL database from backup..."

    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi

    mysql "$DATABASE_URL" < "$backup_file"
    print_success "Database restored from backup: $backup_file"
}

rollback_mysql_drop_column() {
    print_info "Removing model_name_prefix column from MySQL database..."

    mysql "$DATABASE_URL" <<EOF
ALTER TABLE channels DROP COLUMN IF EXISTS model_name_prefix;
EOF

    if [ $? -eq 0 ]; then
        print_success "Column removed successfully"
        return 0
    else
        print_error "Failed to remove column"
        return 1
    fi
}

# ============================================================================
# Main Script
# ============================================================================

main() {
    print_header "Rollback Migration: Remove model_name_prefix Column"

    # Check if backup file provided
    BACKUP_FILE=$1

    # Detect database type
    DB_TYPE=$(detect_database)

    if [ "$DB_TYPE" = "unknown" ]; then
        print_error "Could not detect database type"
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

    # Choose rollback method
    echo ""
    if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
        print_info "Backup file provided: $BACKUP_FILE"
        print_warning "This will restore the entire database from backup"
        print_warning "All changes made after the backup will be lost!"

        if ! confirm "Do you want to restore from backup?"; then
            print_info "Rollback cancelled"
            exit 0
        fi

        case $DB_TYPE in
            sqlite)
                rollback_sqlite_from_backup "$DB_FILE" "$BACKUP_FILE"
                ;;
            postgresql)
                rollback_postgresql_from_backup "$BACKUP_FILE"
                ;;
            mysql)
                rollback_mysql_from_backup "$BACKUP_FILE"
                ;;
        esac
    else
        print_info "No backup file provided"
        print_warning "This will only remove the model_name_prefix column"
        print_warning "Any data in this column will be lost!"

        if ! confirm "Do you want to remove the column?"; then
            print_info "Rollback cancelled"
            exit 0
        fi

        case $DB_TYPE in
            sqlite)
                rollback_sqlite_drop_column "$DB_FILE"
                ;;
            postgresql)
                rollback_postgresql_drop_column
                ;;
            mysql)
                rollback_mysql_drop_column
                ;;
        esac
    fi

    if [ $? -eq 0 ]; then
        echo ""
        print_header "Rollback Completed Successfully!"
        print_info "You can now restart your application"
    else
        print_error "Rollback failed!"
        exit 1
    fi
}

# Run main function
main "$@"
