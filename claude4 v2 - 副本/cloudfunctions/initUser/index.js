// cloudfunctions/initUser/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloudbase-1gdysknn57ce9b9f'
})

const db = cloud.database()

/**
 * 初始化用户信息
 * 首次登录时自动创建用户记录
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查询用户是否已存在
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()

    let userData

    if (userRes.data.length === 0) {
      // 用户不存在，创建新用户（默认为访客）
      const createRes = await db.collection('users').add({
        data: {
          _openid: openid,
          role: 'guest',
          nickname: '用户' + openid.substr(-6),
          avatar: '',
          createTime: db.serverDate()
        }
      })

      // 获取新创建的用户信息
      const newUserRes = await db.collection('users').doc(createRes._id).get()
      userData = newUserRes.data
    } else {
      // 用户已存在，返回用户信息
      userData = userRes.data[0]
    }

    return {
      success: true,
      data: userData,
      message: '初始化成功'
    }
  } catch (err) {
    console.error('初始化用户失败', err)
    return {
      success: false,
      message: '初始化失败',
      error: err
    }
  }
}
