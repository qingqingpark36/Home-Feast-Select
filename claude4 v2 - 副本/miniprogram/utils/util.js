// utils/util.js - 工具函数

/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 格式化日期（只显示日期）
 */
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('-')}`
}

/**
 * 显示加载提示
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示成功提示
 */
const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 */
const showError = (title = '操作失败') => {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 显示确认对话框
 */
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success(res) {
        if (res.confirm) {
          resolve()
        } else {
          reject()
        }
      }
    })
  })
}

/**
 * 检查是否为管理员
 */
const checkAdmin = () => {
  const app = getApp()
  return app.globalData.isAdmin
}

/**
 * 调用云函数
 */
const callFunction = async (name, data = {}) => {
  try {
    const res = await wx.cloud.callFunction({
      name,
      data
    })
    return res.result
  } catch (err) {
    console.error(`调用云函数 ${name} 失败`, err)
    throw err
  }
}

/**
 * 上传图片到云存储
 */
const uploadImage = async () => {
  try {
    // 选择图片
    const chooseResult = await wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const tempFilePath = chooseResult.tempFilePaths[0]

    // 生成唯一文件名
    const cloudPath = `dish-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${tempFilePath.match(/\.(\w+)$/)[1]}`

    showLoading('上传中...')

    // 上传到云存储
    const uploadResult = await wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath
    })

    hideLoading()
    return uploadResult.fileID
  } catch (err) {
    hideLoading()
    console.error('上传图片失败', err)
    throw err
  }
}

/**
 * 删除云存储文件
 */
const deleteFile = async (fileID) => {
  try {
    await wx.cloud.deleteFile({
      fileList: [fileID]
    })
    return true
  } catch (err) {
    console.error('删除文件失败', err)
    return false
  }
}

module.exports = {
  formatTime,
  formatDate,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  checkAdmin,
  callFunction,
  uploadImage,
  deleteFile
}
