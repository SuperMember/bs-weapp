//index.js
//获取应用实例
var time = require('../../utils/util.js')
const app = getApp()
Page({
  data: {
    
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    page: 1,
    indexList: [],
    recommendList: [],
    swiper: [],
    nomore: false,
    more: 0
  },
  onReady: function () {

  },

  onLoad: function () {
    this.getIndex()
  },
  onReachBottom: function (e) {
    //加载更多
    this.setData({
      more: 1
    })
    this.getIndex()
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      indexList: [],
      recommendList: [],
      swiper: [],
      more: 0
    })
    this.getIndex()
  },
  getIndex: function () {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/index?page=' + that.data.page + "&more=" + that.data.more,
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          for (var i = 0; i < res.data.data.list.length; i++) {
            var date = new Date(res.data.data.list[i].CREATED)
            res.data.data.list[i].CREATED = time.formatTime(date)
          }
          var indexList = that.data.indexList.concat(res.data.data.list)
          if (res.data.data.list.length != 0) {
            that.setData({
              indexList: indexList,
              recommendList: res.data.data.recommend,
              swiper: res.data.data.swiper
            })
          }
          if (res.data.data.list.length != 0) {
            that.setData({
              page: that.data.page + 1
            })
          } else {
            that.setData({
              nomore: false
            })
          }
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      },
    })
  },
  toDetail: function (e) {
    var index = parseInt(e.currentTarget.dataset.id)
    var that = this
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?id=' + that.data.indexList[index].ID + "&i=" + (that.data.indexList[index].TYPE == 0 ? '2' : '1')
    })
  },
  toGameDetail: function (e) {
    var url = e.currentTarget.dataset.link
    wx.navigateTo({
      url: '/pages/gameDetail/gameDetail?id=' + url
    })
  },
  up: function (e) {
    //回到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  toDetailArticle: function (e) {
    var index = parseInt(e.currentTarget.dataset.id)
    var that = this
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?id=' + that.data.indexList[index].ID + "&i=" + (that.data.indexList[index].TYPE == 0 ? '2' : '1')
    })
  }
})
