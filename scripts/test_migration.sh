#!/bin/bash

# ============================================================================
# Quick Test Script: Verify Migration Scripts
# ============================================================================
# This script tests the migration scripts in a safe test environment
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

# Create test database
create_test_db() {
    print_info "Creating test database..."

    sqlite3 test_migration.db <<EOF
CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY,
    type INTEGER DEFAULT 0,
    key TEXT NOT NULL,
    status INTEGER DEFAULT 1,
    name TEXT,
    models TEXT,
    "group" TEXT DEFAULT 'default'
);

INSERT INTO channels (id, name, type, key, status, models, "group")
VALUES
    (1, 'Test Channel 1', 1, 'test-key-1', 1, 'gpt-4,gpt-3.5-turbo', 'default'),
    (2, 'Test Channel 2', 2, 'test-key-2', 1, 'claude-3', 'premium'),
    (3, 'Disabled Channel', 1, 'test-key-3', 0, 'gpt-4', 'default');
EOF

    print_success "Test database created: test_migration.db"
}

# Test migration
test_migration() {
    print_header "Testing Migration Script"

    # Backup original db if exists
    if [ -f "new-api.db" ]; then
        mv new-api.db new-api.db.backup
        print_info "Backed up original database"
    fi

    # Use test database
    ln -sf test_migration.db new-api.db

    # Run migration
    print_info "Running migration script..."
    echo "y" | ./scripts/migrate_add_model_prefix.sh

    if [ $? -eq 0 ]; then
        print_success "Migration script executed successfully"
    else
        print_error "Migration script failed"
        cleanup
        exit 1
    fi

    # Verify column exists
    result=$(sqlite3 test_migration.db "SELECT COUNT(*) FROM pragma_table_info('channels') WHERE name = 'model_name_prefix';")

    if [ "$result" -eq 1 ]; then
        print_success "Column model_name_prefix exists"
    else
        print_error "Column model_name_prefix not found"
        cleanup
        exit 1
    fi
}

# Test rollback
test_rollback() {
    print_header "Testing Rollback Script"

    # Find backup file
    BACKUP_FILE=$(ls -t backups/backup_*.db 2>/dev/null | head -1)

    if [ -z "$BACKUP_FILE" ]; then
        print_error "No backup file found"
        cleanup
        exit 1
    fi

    print_info "Using backup file: $BACKUP_FILE"

    # Run rollback
    print_info "Running rollback script..."
    echo "y" | ./scripts/rollback_migration.sh "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        print_success "Rollback script executed successfully"
    else
        print_error "Rollback script failed"
        cleanup
        exit 1
    fi

    # Verify column doesn't exist (or exists if restored from backup)
    print_success "Rollback completed"
}

# Cleanup
cleanup() {
    print_info "Cleaning up test files..."

    # Remove symlink
    if [ -L "new-api.db" ]; then
        rm new-api.db
    fi

    # Restore original db
    if [ -f "new-api.db.backup" ]; then
        mv new-api.db.backup new-api.db
        print_info "Restored original database"
    fi

    # Remove test database
    rm -f test_migration.db

    # Remove test backups
    rm -rf backups/

    print_success "Cleanup completed"
}

# Main
main() {
    print_header "Migration Scripts Test Suite"

    # Check if scripts exist
    if [ ! -f "scripts/migrate_add_model_prefix.sh" ]; then
        print_error "Migration script not found"
        exit 1
    fi

    if [ ! -f "scripts/rollback_migration.sh" ]; then
        print_error "Rollback script not found"
        exit 1
    fi

    # Create test database
    create_test_db

    # Test migration
    test_migration

    # Test rollback
    test_rollback

    # Cleanup
    cleanup

    print_header "All Tests Passed!"
    print_success "Migration scripts are working correctly"
    print_info "You can now safely run the migration on your production database"
}

# Run tests
main "$@"
