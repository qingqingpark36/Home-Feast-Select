// cloudfunctions/checkAdmin/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloudbase-1gdysknn57ce9b9f'
})

const db = cloud.database()

/**
 * 检查当前用户是否为管理员
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const res = await db.collection('users').where({
      _openid: openid
    }).get()

    if (res.data.length === 0) {
      return {
        success: false,
        isAdmin: false,
        message: '用户不存在'
      }
    }

    const user = res.data[0]
    const isAdmin = user.role === 'admin'

    return {
      success: true,
      isAdmin: isAdmin,
      userData: user,
      message: isAdmin ? '管理员权限' : '普通用户'
    }
  } catch (err) {
    console.error('检查管理员权限失败', err)
    return {
      success: false,
      isAdmin: false,
      message: '检查失败',
      error: err
    }
  }
}
