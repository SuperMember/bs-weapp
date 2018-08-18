// pages/circleDetail/circleDetail.js
var app = getApp()
var time = require('../../utils/util.js')
var token = 'token'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentList: [],
    id: null,
    page: 1,
    imgs: [],
    circleInfo: {},
    nomore: true,
    isBottom: false,
    msg: '+关注',
    topList: [],
    searchType: '按时间',
    index: 0,
    type: [{
      id: 0,
      name: '按发表时间'
    }, {
      id: 1,
      name: "按回复时间"
    }],
    rankList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //var id=options.id
    var json = options.json
    var circleInfo = JSON.parse(json)
    this.setData({
      circleInfo: circleInfo
    })
    this.getCircleFocus()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      isbottom: false,
      contentList: [],
      imgs: []
    })
    this.getCircleFocus()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      nomore: true
    })
    if (this.data.isBottom) {
      this.getArticle(this.data.circleInfo.ID, this.data.page)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
  ,
  getCircleFocus: function (e) {
    //查看登录用户已经关注
    if (wx.getStorageSync(token) == '') {
      this.setData({
        msg: '+关注'
      })
      this.getArticle(this.data.circleInfo.ID, this.data.page)
    } else {
      var that = this
      wx.request({
        url: app.conf.host + '/football/api/circle/focus/exist/' + that.data.circleInfo.ID,
        data: '',
        header: {
          'X-AUTH-TOKEN': wx.getStorageSync(token)
        },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if (res.data.code == 20000) {
            that.setData({
              msg: '√ 取关'
            })
          } else {
            that.setData({
              msg: '+ 关注'
            })
          }
          that.getArticle(that.data.circleInfo.ID, that.data.page)
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },

  handerFocus: function () {
    if (wx.getStorageSync(token) != '') {
      var that = this
      wx.request({
        url: app.conf.host + '/football/api/circle/focus',
        data: {
          circleId: that.data.circleInfo.ID
        },
        header: {
          'X-AUTH-TOKEN': wx.getStorageSync(token)
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if (res.data.code == 20000) {
            that.setData({
              msg: '√ 取关'
            })
            wx.showToast({
              title: '关注成功',
              icon: 'none',
              duration: 1500
            })
          } else {
            that.setData({
              msg: '+ 关注'
            })
            wx.showToast({
              title: '取消成功',
              icon: 'none',
              duration: 1500
            })
          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  }
  ,
  getCircleInfo: function () {
    var that = this
    wx.request({
      url: app.conf.host + '/football/api/circle',
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  getArticle: function (id, page) {
    //获取圈子数据
    var that = this
    wx.request({
      url: app.conf.host + '/football/api/circle/arlist?cId=' + id + "&page=" + page + "&type=" + that.data.index,
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          if (res.data.data.list.length != 0) {
            var imgs = []
            for (var i = 0; i < res.data.data.list.length; i++) {
              if (res.data.data.list[i].IMGS != null) {
                var igs = res.data.data.list[i].IMGS.split(",")
                imgs.push(igs)
              } else {
                imgs.push([])
              }
              var date = new Date(res.data.data.list[i].CREATED)
              res.data.data.list[i].CREATED = time.getDateDiff(time.formatTime(date).toString())
            }
            var list = that.data.contentList.concat(res.data.data.list)
            var imgList = that.data.imgs.concat(imgs)
            that.setData({
              contentList: list,
              imgs: imgList,
              isBottom: true,
              page: that.data.page + 1,
              nomore: false,
              topList: res.data.data.top,
              rankList: res.data.data.rank
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
        wx.stopPullDownRefresh()
      },
    })
  }
  ,
  addArticle: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      //跳转到发表文章页面
      wx.navigateTo({
        url: '/pages/article/article?cid=' + this.data.circleInfo.ID
      })
    }
  }
  ,
  up: function (e) {
    //回到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  toDetail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?id=' + id + "&i=0"
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value,
      page: 1,
      contentList: []
    })
    this.getArticle(this.data.circleInfo.ID, this.data.page)
  },
  toRank: function (e) {
    wx.navigateTo({
      url: '/pages/rank/rank?cId=' + this.data.circleInfo.ID
    })
  }
})