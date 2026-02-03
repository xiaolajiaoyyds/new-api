# Database Migration Notes

## Add model_name_prefix Column to channels Table

Execute the following SQL to add the new column:

```sql
ALTER TABLE channels ADD COLUMN model_name_prefix VARCHAR(255) DEFAULT NULL;
```

## Migration Steps

1. **Backup Database**: Always backup your database before running migrations
2. **Run SQL**: Execute the ALTER TABLE statement above
3. **Restart Application**: Restart the application to load the new schema
4. **Verify**: Check that the new field appears in the channel edit form

## Rollback (if needed)

```sql
ALTER TABLE channels DROP COLUMN model_name_prefix;
```

## Notes

- The `model_name_prefix` field is optional (NULL allowed)
- When set, it will automatically add a prefix to all models in that channel
- Example: Setting prefix to "aws" will make models display as "aws/gpt-4"
- The prefix is automatically stripped when forwarding requests to upstream providers
