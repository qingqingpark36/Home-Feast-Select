// pages/admin/admin.js
const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.loadUserInfo()
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    const isAdmin = app.globalData.isAdmin

    if (!isAdmin) {
      wx.showModal({
        title: '提示',
        content: '您没有管理员权限',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
      return
    }

    this.setData({
      userInfo: userInfo
    })
  },

  /**
   * 跳转到订单管理
   */
  goToOrderManage() {
    wx.navigateTo({
      url: '/pages/admin/order-manage/order-manage'
    })
  },

  /**
   * 跳转到菜单管理
   */
  goToMenuManage() {
    wx.navigateTo({
      url: '/pages/admin/menu-manage/menu-manage'
    })
  },

  /**
   * 跳转到用户管理
   */
  goToUserManage() {
    wx.navigateTo({
      url: '/pages/admin/user-manage/user-manage'
    })
  },

  /**
   * 跳转到数据统计
   */
  goToStatistics() {
    wx.navigateTo({
      url: '/pages/admin/statistics/statistics'
    })
  },

  /**
   * 跳转到备份管理
   */
  goToBackupManage() {
    wx.navigateTo({
      url: '/pages/admin/backup-manage/backup-manage'
    })
  }
})
