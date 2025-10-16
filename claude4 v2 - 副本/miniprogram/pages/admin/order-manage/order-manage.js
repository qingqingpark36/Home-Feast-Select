// pages/admin/order-manage/order-manage.js
const { ORDER_STATUS_TEXT } = require('../../../utils/constants.js')
const { formatTime } = require('../../../utils/util.js')

Page({
  data: {
    currentStatus: '',
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

      const data = {
        action: 'getAllOrders'
      }

      if (this.data.currentStatus) {
        data.status = this.data.currentStatus
      }

      const res = await wx.cloud.callFunction({
        name: 'order',
        data: data
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
   * 选择状态筛选
   */
  selectStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      currentStatus: status
    })
    this.loadOrders()
  },

  /**
   * 更新订单状态
   */
  async updateStatus(e) {
    const { id, status } = e.currentTarget.dataset

    try {
      wx.showLoading({ title: '更新中...' })

      const res = await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'updateStatus',
          id: id,
          status: status
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        })
        this.loadOrders()
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('更新订单状态失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '更新失败',
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
