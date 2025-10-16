// pages/menu/menu.js
const app = getApp()
const { CATEGORIES } = require('../../utils/constants.js')

Page({
  data: {
    categories: CATEGORIES,
    currentCategory: '', // 当前选中的分类
    dishes: [], // 所有菜品
    filteredDishes: [], // 筛选后的菜品
    loading: true,
    cartCount: 0
  },

  onLoad() {
    this.loadDishes()
  },

  onShow() {
    // 更新购物车数量
    this.updateCartCount()
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
          action: 'getList',
          status: 'online' // 只显示上架的菜品
        }
      })

      if (res.result.success) {
        this.setData({
          dishes: res.result.data,
          filteredDishes: res.result.data,
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
   * 选择分类
   */
  selectCategory(e) {
    const category = e.currentTarget.dataset.category

    this.setData({
      currentCategory: category
    })

    this.filterDishes()
  },

  /**
   * 筛选菜品
   */
  filterDishes() {
    const { dishes, currentCategory } = this.data

    if (currentCategory === '') {
      // 显示所有菜品
      this.setData({
        filteredDishes: dishes
      })
    } else {
      // 按分类筛选
      const filtered = dishes.filter(dish => dish.category === currentCategory)
      this.setData({
        filteredDishes: filtered
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
   * 显示菜品详情（可选功能）
   */
  showDishDetail(e) {
    // 暂不实现详情页，直接添加到购物车
  },

  /**
   * 添加到购物车
   */
  addToCart(e) {
    const dish = e.currentTarget.dataset.dish

    app.addToCart({
      ...dish,
      count: 1
    })

    this.updateCartCount()

    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500
    })
  },

  /**
   * 更新购物车数量
   */
  updateCartCount() {
    const cart = app.getCart()
    const count = cart.reduce((sum, item) => sum + item.count, 0)
    this.setData({ cartCount: count })
  },

  /**
   * 跳转到购物车页面
   */
  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  }
})
