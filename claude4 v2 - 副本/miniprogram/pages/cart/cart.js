// pages/cart/cart.js
const app = getApp()
const { CATEGORIES } = require('../../utils/constants.js')

Page({
  data: {
    cart: [],
    notes: '',
    totalCount: 0
  },

  onLoad() {
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  /**
   * 加载购物车数据
   */
  loadCart() {
    const cart = app.getCart()
    const totalCount = cart.reduce((sum, item) => sum + item.count, 0)

    this.setData({
      cart: cart,
      totalCount: totalCount
    })
  },

  /**
   * 获取分类名称
   */
  getCategoryName(categoryId) {
    const category = CATEGORIES.find(cat => cat.id === categoryId)
    return category ? category.name : ''
  },

  /**
   * 增加数量
   */
  increaseCount(e) {
    const id = e.currentTarget.dataset.id
    const cart = this.data.cart
    const item = cart.find(item => item._id === id)

    if (item) {
      item.count++
      app.updateCartItem(id, item.count)
      this.loadCart()
    }
  },

  /**
   * 减少数量
   */
  decreaseCount(e) {
    const id = e.currentTarget.dataset.id
    const cart = this.data.cart
    const item = cart.find(item => item._id === id)

    if (item) {
      if (item.count > 1) {
        item.count--
        app.updateCartItem(id, item.count)
      } else {
        // 数量为1时，确认是否删除
        wx.showModal({
          title: '提示',
          content: '确定要移除该菜品吗？',
          success: (res) => {
            if (res.confirm) {
              app.updateCartItem(id, 0)
              this.loadCart()
            }
          }
        })
        return
      }
      this.loadCart()
    }
  },

  /**
   * 备注输入
   */
  onNotesInput(e) {
    this.setData({
      notes: e.detail.value
    })
  },

  /**
   * 提交订单
   */
  async submitOrder() {
    const { cart, notes } = this.data

    if (cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '提交中...' })

      // 构建订单数据
      const dishes = cart.map(item => ({
        dishId: item._id,
        name: item.name,
        category: item.category,
        count: item.count
      }))

      const res = await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'create',
          dishes: dishes,
          notes: notes
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        // 清空购物车
        app.clearCart()

        wx.showToast({
          title: '订单提交成功',
          icon: 'success'
        })

        // 跳转到订单历史页面
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/order-history/order-history'
          })
        }, 1500)
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('提交订单失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
    }
  },

  /**
   * 返回菜单页面
   */
  goToMenu() {
    wx.navigateBack()
  }
})
