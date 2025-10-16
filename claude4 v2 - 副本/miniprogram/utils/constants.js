// utils/constants.js - 常量定义

// 固定的菜品分类
const CATEGORIES = [
  { id: 'cold_dish', name: '凉菜', icon: '🥗' },
  { id: 'main_dish', name: '主菜', icon: '🍖' },
  { id: 'stir_fry', name: '小炒', icon: '🍳' },
  { id: 'soup', name: '汤', icon: '🍲' },
  { id: 'staple', name: '主食', icon: '🍚' },
  { id: 'dessert', name: '甜品', icon: '🍰' },
  { id: 'breakfast', name: '早餐', icon: '🥐' }
]

// 订单状态
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed'
}

const ORDER_STATUS_TEXT = {
  'pending': '待处理',
  'confirmed': '已确认',
  'completed': '已完成'
}

const ORDER_STATUS_COLOR = {
  'pending': '#faad14',
  'confirmed': '#1890ff',
  'completed': '#52c41a'
}

// 用户角色
const USER_ROLE = {
  ADMIN: 'admin',
  GUEST: 'guest'
}

module.exports = {
  CATEGORIES,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLOR,
  USER_ROLE
}
