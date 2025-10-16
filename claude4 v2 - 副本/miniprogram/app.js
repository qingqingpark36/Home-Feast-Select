// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloudbase-1gdysknn57ce9b9f',
        traceUser: true
      })
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isAdmin: false,
    cart: [] // 购物车数据
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'initUser'
      })
      if (res.result.success) {
        this.globalData.userInfo = res.result.data
        this.globalData.isAdmin = res.result.data.role === 'admin'
      }
    } catch (err) {
      console.error('检查登录状态失败', err)
    }
  },

  // 获取购物车数据
  getCart() {
    return this.globalData.cart
  },

  // 添加到购物车
  addToCart(dish) {
    const cart = this.globalData.cart
    const index = cart.findIndex(item => item._id === dish._id)

    if (index > -1) {
      cart[index].count += dish.count || 1
    } else {
      cart.push({
        ...dish,
        count: dish.count || 1
      })
    }

    this.globalData.cart = cart
    this.saveCart()
  },

  // 更新购物车商品数量
  updateCartItem(dishId, count) {
    const cart = this.globalData.cart
    const index = cart.findIndex(item => item._id === dishId)

    if (index > -1) {
      if (count <= 0) {
        cart.splice(index, 1)
      } else {
        cart[index].count = count
      }
    }

    this.globalData.cart = cart
    this.saveCart()
  },

  // 清空购物车
  clearCart() {
    this.globalData.cart = []
    this.saveCart()
  },

  // 保存购物车到本地存储
  saveCart() {
    wx.setStorageSync('cart', this.globalData.cart)
  },

  // 从本地存储加载购物车
  loadCart() {
    const cart = wx.getStorageSync('cart')
    if (cart) {
      this.globalData.cart = cart
    }
  }
})
