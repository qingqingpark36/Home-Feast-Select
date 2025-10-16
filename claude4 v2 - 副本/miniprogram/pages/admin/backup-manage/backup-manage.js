// pages/admin/backup-manage/backup-manage.js
const { formatTime } = require('../../../utils/util.js')

Page({
  data: {
    backups: [],
    loading: true
  },

  onLoad() {
    this.loadBackups()
  },

  async backupDatabase() {
    try {
      wx.showLoading({ title: '备份中...' })

      const res = await wx.cloud.callFunction({
        name: 'backup',
        data: {
          action: 'backupDatabase'
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({ title: '备份成功', icon: 'success' })
        this.loadBackups()
      }
    } catch (err) {
      console.error('备份失败', err)
      wx.hideLoading()
      wx.showToast({ title: '备份失败', icon: 'none' })
    }
  },

  async loadBackups() {
    try {
      this.setData({ loading: true })

      const res = await wx.cloud.callFunction({
        name: 'backup',
        data: {
          action: 'getBackupHistory'
        }
      })

      if (res.result.success) {
        this.setData({
          backups: res.result.data,
          loading: false
        })
      }
    } catch (err) {
      console.error('加载备份失败', err)
      this.setData({ loading: false })
    }
  },

  formatTime(timestamp) {
    if (!timestamp) return ''
    return formatTime(new Date(timestamp))
  }
})
