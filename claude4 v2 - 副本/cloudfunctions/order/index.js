// cloudfunctions/order/index.js
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
 * 获取用户信息
 */
async function getUserInfo(openid) {
  const res = await db.collection('users').where({
    _openid: openid
  }).get()

  if (res.data.length === 0) return null
  return res.data[0]
}

/**
 * 订单管理云函数
 * 支持操作：create, getUserOrders, getAllOrders, updateStatus
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  try {
    switch (action) {
      case 'create':
        return await createOrder(event, openid)
      case 'getUserOrders':
        return await getUserOrders(event, openid)
      case 'getAllOrders':
        return await getAllOrders(event, openid)
      case 'updateStatus':
        return await updateOrderStatus(event, openid)
      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('订单操作失败', err)
    return {
      success: false,
      message: '操作失败',
      error: err
    }
  }
}

/**
 * 创建订单
 * 参数：dishes（菜品数组）, notes（备注）
 */
async function createOrder(event, openid) {
  const { dishes, notes } = event

  if (!dishes || dishes.length === 0) {
    return {
      success: false,
      message: '订单不能为空'
    }
  }

  // 获取用户信息
  const userInfo = await getUserInfo(openid)
  if (!userInfo) {
    return {
      success: false,
      message: '用户信息不存在'
    }
  }

  const res = await db.collection('orders').add({
    data: {
      _openid: openid,
      userId: userInfo._id,
      userName: userInfo.nickname,
      userAvatar: userInfo.avatar,
      dishes: dishes,
      status: 'pending',
      notes: notes || '',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }
  })

  return {
    success: true,
    data: { _id: res._id },
    message: '订单创建成功'
  }
}

/**
 * 获取当前用户的订单
 */
async function getUserOrders(event, openid) {
  const res = await db.collection('orders')
    .where({
      _openid: openid
    })
    .orderBy('createTime', 'desc')
    .get()

  return {
    success: true,
    data: res.data,
    message: '获取成功'
  }
}

/**
 * 获取所有订单（需要管理员权限）
 * 参数：status（可选）- 按状态筛选
 */
async function getAllOrders(event, openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  const { status } = event

  let query = db.collection('orders')

  if (status) {
    query = query.where({
      status: status
    })
  }

  const res = await query.orderBy('createTime', 'desc').get()

  return {
    success: true,
    data: res.data,
    message: '获取成功'
  }
}

/**
 * 更新订单状态（需要管理员权限）
 * 参数：id, status
 */
async function updateOrderStatus(event, openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  const { id, status } = event

  if (!id || !status) {
    return {
      success: false,
      message: '参数不完整'
    }
  }

  // 验证状态是否有效
  const validStatus = ['pending', 'confirmed', 'completed']
  if (!validStatus.includes(status)) {
    return {
      success: false,
      message: '无效的状态'
    }
  }

  await db.collection('orders').doc(id).update({
    data: {
      status: status,
      updateTime: db.serverDate()
    }
  })

  return {
    success: true,
    message: '状态更新成功'
  }
}
