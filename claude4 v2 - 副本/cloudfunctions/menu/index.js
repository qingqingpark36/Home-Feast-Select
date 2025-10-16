// cloudfunctions/menu/index.js
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
 * 菜单管理云函数
 * 支持操作：getList, add, update, delete
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  try {
    switch (action) {
      case 'getList':
        return await getMenuList(event)
      case 'add':
        return await addDish(event, openid)
      case 'update':
        return await updateDish(event, openid)
      case 'delete':
        return await deleteDish(event, openid)
      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('菜单操作失败', err)
    return {
      success: false,
      message: '操作失败',
      error: err
    }
  }
}

/**
 * 获取菜单列表
 * 参数：category（可选）- 按分类筛选
 *      status（可选）- 按状态筛选
 */
async function getMenuList(event) {
  const { category, status } = event

  let query = db.collection('menu')
  const where = {}

  // 添加分类筛选
  if (category) {
    where.category = category
  }

  // 添加状态筛选（访客只能看到上架的菜品）
  if (status !== undefined) {
    where.status = status
  } else {
    // 默认只显示上架的菜品
    where.status = 'online'
  }

  if (Object.keys(where).length > 0) {
    query = query.where(where)
  }

  const res = await query.orderBy('createTime', 'desc').get()

  return {
    success: true,
    data: res.data,
    message: '获取成功'
  }
}

/**
 * 添加菜品（需要管理员权限）
 * 参数：name, image, category
 */
async function addDish(event, openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  const { name, image, category } = event

  if (!name || !category) {
    return {
      success: false,
      message: '参数不完整'
    }
  }

  // 验证分类是否有效
  const validCategories = ['cold_dish', 'main_dish', 'stir_fry', 'soup', 'staple', 'dessert', 'breakfast']
  if (!validCategories.includes(category)) {
    return {
      success: false,
      message: '无效的分类'
    }
  }

  const res = await db.collection('menu').add({
    data: {
      name,
      image: image || '',
      category,
      status: 'online',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }
  })

  return {
    success: true,
    data: { _id: res._id },
    message: '添加成功'
  }
}

/**
 * 更新菜品（需要管理员权限）
 * 参数：id, name, image, category, status
 */
async function updateDish(event, openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  const { id, name, image, category, status } = event

  if (!id) {
    return {
      success: false,
      message: '缺少菜品ID'
    }
  }

  const updateData = {
    updateTime: db.serverDate()
  }

  if (name !== undefined) updateData.name = name
  if (image !== undefined) updateData.image = image
  if (category !== undefined) {
    // 验证分类是否有效
    const validCategories = ['cold_dish', 'main_dish', 'stir_fry', 'soup', 'staple', 'dessert', 'breakfast']
    if (!validCategories.includes(category)) {
      return {
        success: false,
        message: '无效的分类'
      }
    }
    updateData.category = category
  }
  if (status !== undefined) updateData.status = status

  await db.collection('menu').doc(id).update({
    data: updateData
  })

  return {
    success: true,
    message: '更新成功'
  }
}

/**
 * 删除菜品（需要管理员权限）
 * 参数：id
 */
async function deleteDish(event, openid) {
  const isAdmin = await checkAdmin(openid)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限操作'
    }
  }

  const { id } = event

  if (!id) {
    return {
      success: false,
      message: '缺少菜品ID'
    }
  }

  await db.collection('menu').doc(id).remove()

  return {
    success: true,
    message: '删除成功'
  }
}
