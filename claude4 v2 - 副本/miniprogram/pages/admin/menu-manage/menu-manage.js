// pages/admin/menu-manage/menu-manage.js
const { CATEGORIES } = require('../../../utils/constants.js')

Page({
  data: {
    dishes: [],
    loading: true
  },

  onLoad() {
    this.loadDishes()
  },

  onShow() {
    this.loadDishes()
  },

  /**
   * 加载菜品列表
   */
  async loadDishes() {
    try {
      this.setData({ loading: true })

      const res = await wx.cloud.callFunction({
        name: 'menu',
        data: {
          action: 'getList'
          // 不传status参数，获取所有菜品
        }
      })

      if (res.result.success) {
        this.setData({
          dishes: res.result.data,
          loading: false
        })
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('加载菜品失败', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 获取分类名称
   */
  getCategoryName(categoryId) {
    const category = CATEGORIES.find(cat => cat.id === categoryId)
    return category ? category.name : ''
  },

  /**
   * 添加菜品
   */
  addDish() {
    wx.navigateTo({
      url: '/pages/admin/menu-edit/menu-edit'
    })
  },

  /**
   * 编辑菜品
   */
  editDish(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/menu-edit/menu-edit?id=${id}`
    })
  },

  /**
   * 切换上下架状态
   */
  async toggleStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const newStatus = status === 'online' ? 'offline' : 'online'

    try {
      wx.showLoading({ title: '更新中...' })

      const res = await wx.cloud.callFunction({
        name: 'menu',
        data: {
          action: 'update',
          id: id,
          status: newStatus
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        })
        this.loadDishes()
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      console.error('更新状态失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  /**
   * 删除菜品
   */
  deleteDish(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道菜品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' })

            const result = await wx.cloud.callFunction({
              name: 'menu',
              data: {
                action: 'delete',
                id: id
              }
            })

            wx.hideLoading()

            if (result.result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadDishes()
            } else {
              throw new Error(result.result.message)
            }
          } catch (err) {
            console.error('删除菜品失败', err)
            wx.hideLoading()
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
