# 数据库迁移指南

## 📋 概述

本迁移添加 `model_name_prefix` 字段到 `channels` 表,支持为渠道配置模型名称前缀功能。

## 🔧 支持的数据库

- ✅ SQLite
- ✅ PostgreSQL
- ✅ MySQL

## 📦 迁移脚本

### 1. 迁移脚本 (`migrate_add_model_prefix.sh`)

**功能:**
- 自动检测数据库类型
- 创建数据库备份
- 执行迁移 (添加 model_name_prefix 列)
- 验证迁移结果
- 失败时可选择自动回滚

### 2. 回滚脚本 (`rollback_migration.sh`)

**功能:**
- 从备份恢复数据库
- 或仅删除 model_name_prefix 列

## 🚀 使用方法

### 准备工作

1. **赋予执行权限:**
```bash
chmod +x scripts/migrate_add_model_prefix.sh
chmod +x scripts/rollback_migration.sh
```

2. **设置数据库连接 (PostgreSQL/MySQL):**
```bash
# PostgreSQL
export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# MySQL
export DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

3. **SQLite 无需配置** (脚本会自动查找 `new-api.db` 或 `data.db`)

### 执行迁移

```bash
# 进入项目目录
cd /path/to/new-api

# 运行迁移脚本
./scripts/migrate_add_model_prefix.sh
```

**脚本会提示:**
1. 检测到的数据库类型
2. 将要执行的操作
3. 要求确认

**输出示例:**
```
============================================================================
Database Migration: Add model_name_prefix Column
============================================================================
✓ Detected database type: sqlite
ℹ Using database file: new-api.db

⚠ This script will:
  1. Create a backup of your database
  2. Add the model_name_prefix column to the channels table
  3. Verify the migration

⚠ Do you want to proceed? [y/N]: y

============================================================================
Step 1: Creating Backup
============================================================================
ℹ Backing up SQLite database: new-api.db
✓ Backup created: ./backups/backup_20260204_001234.db

============================================================================
Step 2: Running Migration
============================================================================
ℹ Running migration on SQLite database...
✓ Migration completed successfully

============================================================================
Step 3: Verifying Migration
============================================================================
ℹ Verifying migration...
✓ Verification passed: Column exists
ℹ Sample data from channels table:
id  name          model_name_prefix
--  ------------  -----------------
1   OpenAI        NULL
2   Azure         NULL
3   AWS Bedrock   NULL

============================================================================
Migration Completed Successfully!
============================================================================
✓ Backup saved to: ./backups/backup_20260204_001234.db
ℹ You can now restart your application to use the new feature

ℹ To rollback if needed, run:
  ./scripts/rollback_migration.sh ./backups/backup_20260204_001234.db
```

### 回滚迁移

**方法1: 从备份恢复 (推荐)**
```bash
# 恢复整个数据库到迁移前状态
./scripts/rollback_migration.sh ./backups/backup_20260204_001234.db
```

**方法2: 仅删除列**
```bash
# 只删除 model_name_prefix 列,保留其他数据
./scripts/rollback_migration.sh
```

## ⚠️ 注意事项

### 执行前

1. **✅ 必须备份数据库** - 脚本会自动创建备份,但建议额外手动备份
2. **✅ 在测试环境先测试** - 确保迁移脚本在您的环境中正常工作
3. **✅ 选择低峰期执行** - 减少对用户的影响
4. **✅ 停止应用服务** - 避免迁移期间的数据写入冲突

### 执行中

- 脚本会自动检测数据库类型
- 如果列已存在,会跳过添加操作
- 迁移失败会提示是否回滚

### 执行后

1. **验证迁移结果:**
```bash
# SQLite
sqlite3 new-api.db "PRAGMA table_info(channels);" | grep model_name_prefix

# PostgreSQL
psql $DATABASE_URL -c "\d channels" | grep model_name_prefix

# MySQL
mysql $DATABASE_URL -e "DESCRIBE channels;" | grep model_name_prefix
```

2. **重启应用:**
```bash
# 根据您的部署方式重启
systemctl restart new-api
# 或
docker-compose restart
# 或
pm2 restart new-api
```

3. **验证功能:**
   - 登录管理后台
   - 编辑任意渠道
   - 检查是否显示"模型名称前缀"字段

## 🔍 故障排查

### 问题1: 脚本无法检测数据库类型

**解决方案:**
```bash
# 确保设置了 DATABASE_URL 环境变量
echo $DATABASE_URL

# 或确保 SQLite 数据库文件存在
ls -la *.db
```

### 问题2: 权限不足

**解决方案:**
```bash
# 赋予脚本执行权限
chmod +x scripts/*.sh

# 确保数据库文件有读写权限
chmod 644 new-api.db
```

### 问题3: 备份失败

**解决方案:**
```bash
# 确保 backups 目录存在且可写
mkdir -p backups
chmod 755 backups

# 确保有足够的磁盘空间
df -h
```

### 问题4: 迁移失败

**解决方案:**
1. 查看错误信息
2. 确认数据库连接正常
3. 使用回滚脚本恢复
4. 联系技术支持

## 📊 迁移影响评估

| 项目 | 影响 | 说明 |
|------|------|------|
| **数据丢失风险** | ❌ 无 | 只添加列,不修改现有数据 |
| **停机时间** | ✅ 秒级 | 现代数据库引擎优化良好 |
| **性能影响** | ✅ 极小 | 添加 NULL 列几乎无性能影响 |
| **回滚难度** | ✅ 简单 | 提供自动回滚脚本 |
| **兼容性** | ✅ 完全兼容 | 向后兼容,不影响现有功能 |

## 🎯 最佳实践

1. **在测试环境先执行**
   ```bash
   # 测试环境
   ./scripts/migrate_add_model_prefix.sh
   # 验证功能正常
   # 然后在生产环境执行
   ```

2. **保留备份文件**
   ```bash
   # 备份文件保存至少7天
   ls -lh backups/
   ```

3. **监控迁移过程**
   ```bash
   # 在另一个终端监控数据库
   watch -n 1 'sqlite3 new-api.db "SELECT COUNT(*) FROM channels;"'
   ```

4. **记录迁移日志**
   ```bash
   # 保存迁移输出
   ./scripts/migrate_add_model_prefix.sh 2>&1 | tee migration_$(date +%Y%m%d_%H%M%S).log
   ```

## 📞 支持

如果遇到问题:
1. 查看本文档的故障排查部分
2. 检查 GitHub Issues
3. 联系技术支持

## 📝 变更日志

- **2026-02-04**: 初始版本,添加 model_name_prefix 字段
