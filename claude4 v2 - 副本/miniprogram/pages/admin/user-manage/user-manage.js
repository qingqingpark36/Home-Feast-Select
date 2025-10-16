// pages/admin/user-manage/user-manage.js
Page({
  data: {
    users: [],
    loading: true
  },

  onLoad() {
    this.loadUsers()
  },

  async loadUsers() {
    try {
      this.setData({ loading: true })

      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getAllUsers'
        }
      })

      if (res.result.success) {
        this.setData({
          users: res.result.data,
          loading: false
        })
      }
    } catch (err) {
      console.error('加载用户失败', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async toggleRole(e) {
    const { id, role } = e.currentTarget.dataset
    const newRole = role === 'admin' ? 'guest' : 'admin'

    try {
      wx.showLoading({ title: '更新中...' })

      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'updateRole',
          userId: id,
          role: newRole
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({ title: '更新成功', icon: 'success' })
        this.loadUsers()
      }
    } catch (err) {
      console.error('更新角色失败', err)
      wx.hideLoading()
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  }
})
