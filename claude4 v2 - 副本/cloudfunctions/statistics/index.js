// cloudfunctions/statistics/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloudbase-1gdysknn57ce9b9f'
})

const db = cloud.database()
const _ = db.command

/**
 * 检查是否为管理员
 */
async function checkAdmin(openid) {
  const res = await db.collection('users').where({
    _openid: openid
  }).get()

  if (res.data.length === 0) return false
  return res.data[0].role === 'admin'
}

/**
 * 统计云函数
 * 支持操作：getDishStatistics, getOrderStatistics, getCategoryStatistics
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  try {
    switch (action) {
      case 'getDishStatistics':
        return await getDishStatistics(openid)
      case 'getOrderStatistics':
        return await getOrderStatistics(openid)
      case 'getCategoryStatistics':
        return await getCategoryStatistics(openid)
      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('统计操作失败', err)
    return {
      success: false,
      message: '操作失败',
      error: err
    }
  }
}

/**
 * 获取菜品统计（需要管理员权限）
 * 统计每个菜品被点的次数
 */
async function getDishStatistics(openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  // 获取所有订单
  const ordersRes = await db.collection('orders').get()
  const orders = ordersRes.data

  // 获取所有菜品
  const menuRes = await db.collection('menu').get()
  const dishes = menuRes.data

  // 统计每个菜品被点的次数
  const statistics = {}

  orders.forEach(order => {
    order.dishes.forEach(dish => {
      if (!statistics[dish.dishId]) {
        statistics[dish.dishId] = {
          dishId: dish.dishId,
          name: dish.name,
          category: dish.category,
          count: 0,
          totalQuantity: 0
        }
      }
      statistics[dish.dishId].count++
      statistics[dish.dishId].totalQuantity += dish.count
    })
  })

  // 转换为数组并排序
  const result = Object.values(statistics).sort((a, b) => b.totalQuantity - a.totalQuantity)

  return {
    success: true,
    data: result,
    message: '统计成功'
  }
}

/**
 * 获取订单统计（需要管理员权限）
 * 统计不同状态的订单数量
 */
async function getOrderStatistics(openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  // 获取所有订单
  const ordersRes = await db.collection('orders').get()
  const orders = ordersRes.data

  // 统计
  const statistics = {
    total: orders.length,
    pending: 0,
    confirmed: 0,
    completed: 0
  }

  orders.forEach(order => {
    statistics[order.status]++
  })

  return {
    success: true,
    data: statistics,
    message: '统计成功'
  }
}

/**
 * 获取分类统计（需要管理员权限）
 * 统计每个分类的菜品数量和被点次数
 */
async function getCategoryStatistics(openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  // 获取所有菜品
  const menuRes = await db.collection('menu').get()
  const dishes = menuRes.data

  // 获取所有订单
  const ordersRes = await db.collection('orders').get()
  const orders = ordersRes.data

  // 定义分类
  const categories = [
    { id: 'cold_dish', name: '凉菜' },
    { id: 'main_dish', name: '主菜' },
    { id: 'stir_fry', name: '小炒' },
    { id: 'soup', name: '汤' },
    { id: 'staple', name: '主食' },
    { id: 'dessert', name: '甜品' },
    { id: 'breakfast', name: '早餐' }
  ]

  // 统计每个分类的菜品数量
  const statistics = {}
  categories.forEach(cat => {
    statistics[cat.id] = {
      category: cat.id,
      categoryName: cat.name,
      dishCount: 0,
      orderCount: 0,
      totalQuantity: 0
    }
  })

  // 统计菜品数量
  dishes.forEach(dish => {
    if (statistics[dish.category]) {
      statistics[dish.category].dishCount++
    }
  })

  // 统计订单数量
  orders.forEach(order => {
    order.dishes.forEach(dish => {
      if (statistics[dish.category]) {
        statistics[dish.category].orderCount++
        statistics[dish.category].totalQuantity += dish.count
      }
    })
  })

  // 转换为数组
  const result = Object.values(statistics)

  return {
    success: true,
    data: result,
    message: '统计成功'
  }
}
