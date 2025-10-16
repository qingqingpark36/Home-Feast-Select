# 家庭点餐微信小程序 - 部署指南

## 项目概述

这是一个基于微信小程序云开发的家庭点餐系统，采用完全 Serverless 架构，支持菜单管理、订单管理、用户权限管理等功能。

## 技术栈

- **前端**: 微信小程序原生开发
- **后端**: 微信云开发 Serverless 架构
- **数据库**: 云数据库
- **存储**: 云存储
- **云函数**: Node.js

## 项目结构

```
claude4 v2/
├── cloudfunctions/          # 云函数目录
│   ├── initUser/           # 用户初始化
│   ├── checkAdmin/         # 权限检查
│   ├── menu/               # 菜单管理
│   ├── order/              # 订单管理
│   ├── user/               # 用户管理
│   ├── statistics/         # 数据统计
│   └── backup/             # 备份管理
├── miniprogram/            # 小程序目录
│   ├── pages/             # 页面
│   │   ├── index/         # 首页
│   │   ├── menu/          # 菜单页
│   │   ├── cart/          # 购物车
│   │   ├── order-history/ # 订单历史
│   │   └── admin/         # 管理后台
│   ├── utils/             # 工具类
│   ├── app.js             # 小程序入口
│   ├── app.json           # 小程序配置
│   └── app.wxss           # 全局样式
├── project.config.json     # 项目配置
└── database-init.md        # 数据库初始化说明
```

## 部署步骤

### 1. 准备工作

1. **注册微信小程序账号**
   - 访问 https://mp.weixin.qq.com/
   - 注册小程序账号并完成认证
   - 获取小程序 AppID

2. **安装微信开发者工具**
   - 下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - 安装并登录

### 2. 开通云开发环境

1. 打开微信开发者工具
2. 导入项目，选择 `claude4 v2` 目录
3. 在 `project.config.json` 中填入你的 AppID
4. 点击工具栏"云开发"按钮
5. 开通云开发，选择合适的环境
6. 记录环境 ID（默认已设置为 `cloudbase-1gdysknn57ce9b9f`）
7. 如果环境 ID 不同，需要修改以下文件中的环境 ID：
   - `miniprogram/app.js` 第 8 行
   - 所有云函数目录下的 `index.js` 文件第 4 行

### 3. 创建数据库集合

在云开发控制台 - 数据库中，创建以下集合：

#### 3.1 users（用户表）

```json
字段说明：
- _id: 自动生成
- _openid: 自动生成
- role: string (admin/guest)
- nickname: string
- avatar: string
- createTime: date
```

索引：`_openid` (唯一索引)

#### 3.2 menu（菜单表）

```json
字段说明：
- _id: 自动生成
- name: string
- image: string
- category: string (cold_dish/main_dish/stir_fry/soup/staple/dessert/breakfast)
- status: string (online/offline)
- createTime: date
- updateTime: date
```

索引：
- `category` (普通索引)
- `status` (普通索引)

#### 3.3 orders（订单表）

```json
字段说明：
- _id: 自动生成
- _openid: string
- userId: string
- userName: string
- userAvatar: string
- dishes: array
- status: string (pending/confirmed/completed)
- notes: string
- createTime: date
- updateTime: date
```

索引：
- `_openid` (普通索引)
- `status` (普通索引)
- `createTime` (降序索引)

#### 3.4 backups（备份记录表）

```json
字段说明：
- _id: 自动生成
- type: string (database/storage)
- fileName: string
- fileUrl: string
- createTime: date
- operator: string
- operatorId: string
```

索引：
- `type` (普通索引)
- `createTime` (降序索引)

### 4. 设置数据库权限

开发阶段建议设置为：
- **所有用户可读，仅创建者可写**（方便调试）

正式上线前改为：
- **仅创建者可读写**（通过云函数访问）

### 5. 部署云函数

在微信开发者工具中，依次右键以下云函数文件夹，选择"上传并部署：云端安装依赖"：

1. `cloudfunctions/initUser`
2. `cloudfunctions/checkAdmin`
3. `cloudfunctions/menu`
4. `cloudfunctions/order`
5. `cloudfunctions/user`
6. `cloudfunctions/statistics`
7. `cloudfunctions/backup`

等待所有云函数部署成功。

### 6. 配置云存储

在云开发控制台 - 云存储中，创建以下目录结构：

```
/
├── dish-images/       # 菜品图片
└── backups/          # 备份文件
    └── database/     # 数据库备份
```

### 7. 设置管理员

首次使用时需要设置管理员：

**方法一：在数据库中手动设置**
1. 用测试账号登录小程序一次
2. 在云开发控制台 - 数据库 - users 集合中
3. 找到对应的用户记录
4. 将 `role` 字段改为 `admin`

**方法二：通过云函数设置**
1. 在云开发控制台 - 云函数中
2. 找到需要设置的用户的 _openid
3. 直接修改数据库记录

### 8. 测试功能

#### 8.1 访客端测试
- ✅ 浏览菜单（按分类筛选）
- ✅ 添加菜品到购物车
- ✅ 调整购物车数量
- ✅ 提交订单（添加备注）
- ✅ 查看订单历史

#### 8.2 管理端测试
- ✅ 查看所有订单
- ✅ 更新订单状态
- ✅ 添加/编辑/删除菜品
- ✅ 上传菜品图片
- ✅ 管理用户权限
- ✅ 查看数据统计
- ✅ 数据备份

### 9. 正式发布

1. **完善小程序信息**
   - 在微信公众平台填写小程序信息
   - 设置服务类目
   - 上传小程序图标和介绍

2. **提交审核**
   - 在开发者工具中点击"上传"
   - 填写版本号和项目备注
   - 在微信公众平台提交审核

3. **发布上线**
   - 审核通过后点击"发布"
   - 小程序正式上线

## 固定分类说明

系统使用以下 7 个固定分类，不支持动态添加分类：

| ID | 名称 | 图标 |
|---|---|---|
| cold_dish | 凉菜 | 🥗 |
| main_dish | 主菜 | 🍖 |
| stir_fry | 小炒 | 🍳 |
| soup | 汤 | 🍲 |
| staple | 主食 | 🍚 |
| dessert | 甜品 | 🍰 |
| breakfast | 早餐 | 🥐 |

修改分类需要同时修改：
- `miniprogram/utils/constants.js`
- `cloudfunctions/menu/index.js` 中的验证逻辑
- `cloudfunctions/statistics/index.js` 中的分类列表

## 常见问题

### 1. 云函数调用失败

**问题**: 提示"云函数调用失败"或超时

**解决方案**:
- 检查云函数是否已成功部署
- 检查云函数中的环境 ID 是否正确
- 查看云函数日志排查错误
- 确保网络连接正常

### 2. 图片上传失败

**问题**: 上传菜品图片时失败

**解决方案**:
- 检查云存储配置是否正确
- 确保有足够的云存储空间
- 检查图片大小（建议小于 2MB）
- 查看控制台错误信息

### 3. 数据库操作权限不足

**问题**: 提示"permission denied"

**解决方案**:
- 检查数据库集合权限设置
- 开发阶段设置为"所有用户可读，仅创建者可写"
- 确保通过云函数访问数据库

### 4. 管理员权限无效

**问题**: 已设置管理员但无法访问管理功能

**解决方案**:
- 重新登录小程序
- 检查 users 表中 role 字段是否为 "admin"
- 清除小程序缓存后重试

## 性能优化建议

1. **图片优化**
   - 上传前压缩图片
   - 使用 webp 格式
   - 设置合理的图片尺寸

2. **数据库优化**
   - 为常用查询字段添加索引
   - 使用分页加载大量数据
   - 定期清理过期数据

3. **云函数优化**
   - 减少云函数调用次数
   - 使用并发调用
   - 缓存常用数据

4. **小程序性能**
   - 使用分包加载
   - 懒加载图片
   - 减少页面层级

## 后续维护

1. **定期备份**
   - 使用备份功能定期备份数据
   - 下载备份文件到本地保存

2. **监控告警**
   - 关注云开发控制台的用量统计
   - 设置合理的资源配额

3. **版本更新**
   - 记录每次更新的内容
   - 保持代码的向后兼容性

4. **用户反馈**
   - 建立用户反馈渠道
   - 及时修复 bug 和优化体验

## 技术支持

如遇到问题，可以：
1. 查看微信小程序官方文档: https://developers.weixin.qq.com/miniprogram/dev/
2. 查看云开发文档: https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html
3. 检查项目中的注释说明

## 许可证

本项目仅供学习和个人使用。

---

**开发完成日期**: 2025-10-15
**版本**: v1.0.0
