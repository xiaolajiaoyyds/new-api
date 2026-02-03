# 重要补充 - Codex Code Review 发现的关键问题

## 🚨 关键问题: 内存缓存路径未应用前缀

### 问题描述

**发现者**: Codex
**严重程度**: Critical (如果系统启用了 MemoryCacheEnabled)

**问题**: `model/channel_cache.go` 的 `InitChannelCache()` 函数构建内存缓存映射时,使用的是原始模型名(`channel.Models`),没有应用 `ModelNamePrefix`。

**影响**:
- 如果系统启用了内存缓存(`MemoryCacheEnabled = true`)
- 用户请求 `aws/gpt-4` 时,会在内存缓存中查找
- 但缓存中的键是 `gpt-4`,不是 `aws/gpt-4`
- 导致找不到可用渠道,请求失败

### 修复方案

在 `model/channel_cache.go:InitChannelCache()` 中应用与 `AddAbilities/UpdateAbilities` 相同的前缀逻辑:

```go
for _, model := range models {
    model = strings.TrimSpace(model)
    if model == "" {
        continue
    }
    abilityModel := model
    if channel.ModelNamePrefix != nil && *channel.ModelNamePrefix != "" {
        abilityModel = *channel.ModelNamePrefix + "/" + model
    }
    // 使用 abilityModel 作为缓存键
    newGroup2model2channels[group][abilityModel] = append(...)
}
```

### 修复状态

✅ **已修复** - Line 49-60 in `model/channel_cache.go`

## 📊 Codex 的其他建议

Codex 还提供了一些架构优化建议,但这些是**可选的增强**,不影响核心功能:

### 1. 引入 `requested_model` 概念

**建议**: 区分 `requested_model` (用户请求的模型名) 和 `original_model` (基础模型名)

**当前实现**: 我们在 `model_mapped.go` 中剥离前缀,直接修改 `OriginModelName`

**评估**:
- ✅ 当前实现简单有效
- ⚠️ Codex 的方案更清晰,但增加了复杂度
- 📝 建议: 保持当前实现,如果未来出现问题再重构

### 2. 定价计算使用基础模型名

**建议**: 在 `pricing.go` 中,使用基础模型名(去除前缀)来匹配元数据和倍率

**当前实现**: 我们直接使用 `ability.Model` (带前缀)

**评估**:
- ⚠️ 这可能导致元数据匹配问题
- 📝 建议: 如果用户反馈元数据不匹配,再实施此优化

### 3. 支持通配符模型的前缀匹配

**建议**: 支持 `aws/gpt-4o-gizmo-*` 这样的通配符模型

**当前实现**: 不支持

**评估**:
- 📝 这是一个高级功能
- 📝 建议: YAGNI - 等用户有需求再实施

## ✅ 最终修改清单

### 必须修复 (已完成)

1. ✅ `model/ability.go` - 添加 channel status 过滤 + 前缀逻辑 + trim
2. ✅ `model/channel.go` - 添加 ModelNamePrefix 字段
3. ✅ `constant/context_key.go` - 添加 context key
4. ✅ `middleware/distributor.go` - 设置 prefix 到 context (含显式清空)
5. ✅ `relay/helper/model_mapped.go` - 剥离前缀逻辑
6. ✅ `web/src/components/table/channels/modals/EditChannelModal.jsx` - 添加前端字段
7. ✅ **`model/channel_cache.go` - 修复内存缓存路径 (Codex 发现)**

### 可选优化 (暂不实施)

- ⏸️ 引入 `requested_model` vs `original_model` 概念
- ⏸️ 定价计算使用基础模型名
- ⏸️ 支持通配符模型的前缀匹配

## 🎯 测试建议

### 必须测试

1. **内存缓存启用场景**:
   ```bash
   # 确保 MemoryCacheEnabled = true
   # 配置渠道前缀
   # 请求带前缀的模型
   # 验证能正确选择渠道
   ```

2. **内存缓存禁用场景**:
   ```bash
   # 确保 MemoryCacheEnabled = false
   # 配置渠道前缀
   # 请求带前缀的模型
   # 验证能正确选择渠道
   ```

### 可选测试

- 元数据匹配 (图标、描述、供应商)
- 倍率计算
- 通配符模型

## 📝 总结

**Codex 发现了一个关键问题**: 内存缓存路径未应用前缀,会导致功能在启用内存缓存时失效。

**已修复**: 在 `model/channel_cache.go` 中应用了与 `AddAbilities` 相同的前缀逻辑。

**其他建议**: Codex 提供了一些架构优化建议,但这些是可选的,不影响核心功能。我们遵循 YAGNI 原则,暂不实施。

---

**更新日期**: 2026-02-04
**发现者**: Codex
**修复者**: Claude (Opus 4.5)
**状态**: ✅ 已修复
