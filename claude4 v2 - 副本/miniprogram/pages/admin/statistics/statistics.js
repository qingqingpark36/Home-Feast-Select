// pages/admin/statistics/statistics.js
Page({
  data: {
    orderStats: { total: 0, pending: 0, confirmed: 0, completed: 0 },
    dishStats: [],
    loading: true
  },

  onLoad() {
    this.loadStatistics()
  },

  async loadStatistics() {
    try {
      this.setData({ loading: true })

      const [orderRes, dishRes] = await Promise.all([
        wx.cloud.callFunction({
          name: 'statistics',
          data: { action: 'getOrderStatistics' }
        }),
        wx.cloud.callFunction({
          name: 'statistics',
          data: { action: 'getDishStatistics' }
        })
      ])

      this.setData({
        orderStats: orderRes.result.data,
        dishStats: dishRes.result.data.slice(0, 10),
        loading: false
      })
    } catch (err) {
      console.error('加载统计失败', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  }
})
