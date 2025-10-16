// pages/order-history/order-history.js
const { ORDER_STATUS_TEXT } = require('../../utils/constants.js')
const { formatTime } = require('../../utils/util.js')

Page({
  data: {
    orders: [],
    loading: true
  },

  onLoad() {
    this.loadOrders()
  },

  /**
   * 加载订单列表
   */
  async loadOrders() {
    try {
      this.setData({ loading: true })

      const res = await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'getUserOrders'
        }
      })

      if (res.result.success) {
        this.setData({
          orders: res.result.data,
          loading: false
        })
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('加载订单失败', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return formatTime(date)
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    return ORDER_STATUS_TEXT[status] || status
  }
})
