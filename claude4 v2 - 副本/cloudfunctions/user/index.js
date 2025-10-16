// cloudfunctions/user/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloudbase-1gdysknn57ce9b9f'
})

const db = cloud.database()

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
 * 用户管理云函数
 * 支持操作：getAllUsers, updateRole
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  try {
    switch (action) {
      case 'getAllUsers':
        return await getAllUsers(openid)
      case 'updateRole':
        return await updateUserRole(event, openid)
      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('用户操作失败', err)
    return {
      success: false,
      message: '操作失败',
      error: err
    }
  }
}

/**
 * 获取所有用户（需要管理员权限）
 */
async function getAllUsers(openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  const res = await db.collection('users')
    .orderBy('createTime', 'desc')
    .get()

  return {
    success: true,
    data: res.data,
    message: '获取成功'
  }
}

/**
 * 更新用户角色（需要管理员权限）
 * 参数：userId, role
 */
async function updateUserRole(event, openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  const { userId, role } = event

  if (!userId || !role) {
    return {
      success: false,
      message: '参数不完整'
    }
  }

  // 验证角色是否有效
  const validRoles = ['admin', 'guest']
  if (!validRoles.includes(role)) {
    return {
      success: false,
      message: '无效的角色'
    }
  }

  await db.collection('users').doc(userId).update({
    data: {
      role: role
    }
  })

  return {
    success: true,
    message: '角色更新成功'
  }
}
