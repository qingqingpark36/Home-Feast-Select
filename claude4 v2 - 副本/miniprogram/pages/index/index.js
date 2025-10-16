// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    isAdmin: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时刷新用户信息
    this.loadUserInfo()
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      wx.showLoading({ title: '加载中...' })

      const res = await wx.cloud.callFunction({
        name: 'initUser'
      })

      if (res.result.success) {
        const userInfo = res.result.data
        this.setData({
          userInfo: userInfo,
          isAdmin: userInfo.role === 'admin'
        })

        // 更新全局数据
        app.globalData.userInfo = userInfo
        app.globalData.isAdmin = userInfo.role === 'admin'
      }

      wx.hideLoading()
    } catch (err) {
      console.error('加载用户信息失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 跳转到菜单页面
   */
  goToMenu() {
    wx.navigateTo({
      url: '/pages/menu/menu'
    })
  },

  /**
   * 跳转到订单历史页面
   */
  goToOrderHistory() {
    wx.navigateTo({
      url: '/pages/order-history/order-history'
    })
  },

  /**
   * 跳转到管理后台
   */
  goToAdmin() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '无管理员权限',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/admin/admin'
    })
  }
})
