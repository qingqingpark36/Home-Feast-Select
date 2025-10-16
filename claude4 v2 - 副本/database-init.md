# 数据库初始化说明

## 云开发环境
- 环境 ID: `cloudbase-1gdysknn57ce9b9f`

## 需要创建的数据库集合

### 1. users 集合（用户表）
字段说明：
- `_id`: 自动生成
- `_openid`: 自动生成（用户唯一标识）
- `role`: string（用户角色：admin/guest）
- `nickname`: string（昵称）
- `avatar`: string（头像）
- `createTime`: date（创建时间）

索引：
- `_openid`: 唯一索引

### 2. menu 集合（菜单表）
字段说明：
- `_id`: 自动生成
- `name`: string（菜品名称）
- `image`: string（图片云存储路径）
- `category`: string（分类：cold_dish/main_dish/stir_fry/soup/staple/dessert/breakfast）
- `status`: string（状态：online/offline）
- `createTime`: date（创建时间）
- `updateTime`: date（更新时间）

索引：
- `category`: 普通索引
- `status`: 普通索引

### 3. orders 集合（订单表）
字段说明：
- `_id`: 自动生成
- `_openid`: string（用户标识，自动生成）
- `userId`: string（用户ID）
- `userName`: string（用户昵称）
- `userAvatar`: string（用户头像）
- `dishes`: array（菜品数组）
  - `dishId`: string（菜品ID）
  - `name`: string（菜品名称）
  - `category`: string（分类）
  - `count`: number（数量）
- `status`: string（订单状态：pending/confirmed/completed）
- `notes`: string（备注）
- `createTime`: date（创建时间）
- `updateTime`: date（更新时间）

索引：
- `_openid`: 普通索引
- `status`: 普通索引
- `createTime`: 降序索引

### 4. backups 集合（备份记录表）
字段说明：
- `_id`: 自动生成
- `type`: string（备份类型：database/storage）
- `fileName`: string（备份文件名）
- `fileUrl`: string（备份文件路径）
- `createTime`: date（备份时间）
- `operator`: string（操作人）
- `operatorId`: string（操作人ID）

索引：
- `type`: 普通索引
- `createTime`: 降序索引

## 权限设置

所有集合权限设置为：
- 仅创建者可读写（默认设置）
- 云函数通过管理端 API 访问

## 云存储目录结构

```
cloud://cloudbase-1gdysknn57ce9b9f/
├── dish-images/          # 菜品图片
├── backups/             # 备份文件
│   ├── database/        # 数据库备份
│   └── storage/         # 存储备份
```

## 初始化步骤

1. 在微信开发者工具中打开项目
2. 点击"云开发"按钮
3. 确认环境ID为：cloudbase-1gdysknn57ce9b9f
4. 在"数据库"标签页中创建以上4个集合
5. 为每个集合添加相应的索引
6. 设置集合权限为"仅创建者可读写"
7. 在"存储"标签页中创建相应的目录结构

## 初始管理员设置

首次使用时，需要手动在 users 集合中添加一条管理员记录，或在第一次登录后，在数据库中将该用户的 role 字段修改为 "admin"。

## 注意事项

1. 开发阶段可以先设置集合权限为"所有用户可读，仅创建者可写"，方便调试
2. 正式上线前务必将权限改为"仅创建者可读写"，通过云函数访问
3. 定期备份数据库和云存储
4. 云存储文件命名规则：`{类型}-{时间戳}-{随机字符串}.{扩展名}`
