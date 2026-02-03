# 数据库迁移脚本

## 📁 文件说明

```
scripts/
├── migrate_add_model_prefix.sh   # 迁移脚本 (添加 model_name_prefix 列)
├── rollback_migration.sh         # 回滚脚本 (恢复或删除列)
├── test_migration.sh             # 测试脚本 (验证迁移脚本)
├── MIGRATION_GUIDE.md            # 详细使用指南
└── README.md                     # 本文件
```

## 🚀 快速开始

### 1. 测试迁移脚本 (推荐)

```bash
# 在测试环境中验证脚本
./scripts/test_migration.sh
```

### 2. 执行迁移

```bash
# 运行迁移脚本
./scripts/migrate_add_model_prefix.sh
```

### 3. 如需回滚

```bash
# 从备份恢复
./scripts/rollback_migration.sh ./backups/backup_YYYYMMDD_HHMMSS.db

# 或仅删除列
./scripts/rollback_migration.sh
```

## 📖 详细文档

请查看 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) 获取完整的使用说明。

## ⚠️ 重要提示

1. **必须先备份数据库** (脚本会自动创建备份)
2. **建议在低峰期执行**
3. **先在测试环境验证**
4. **执行前停止应用服务**

## 🔧 支持的数据库

- ✅ SQLite
- ✅ PostgreSQL
- ✅ MySQL

## 📊 迁移内容

添加 `model_name_prefix` 字段到 `channels` 表:

```sql
ALTER TABLE channels ADD COLUMN model_name_prefix VARCHAR(255) DEFAULT NULL;
```

## 🎯 功能说明

此迁移支持为渠道配置模型名称前缀功能:

- 管理员可为渠道配置前缀 (如 "aws")
- 模型将显示为 "aws/gpt-4" 格式
- 转发请求时自动剥离前缀
- 禁用渠道的模型不再显示在模型广场

## 📞 获取帮助

- 查看 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) 的故障排查部分
- 查看 [MIGRATION_NOTES.md](../MIGRATION_NOTES.md) 了解技术细节
- 提交 GitHub Issue
