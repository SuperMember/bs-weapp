//index.js
//获取应用实例
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const app = getApp()
const token = 'token'
var time = require('../../utils/util.js')
Page({
  data: {
    userInfo: null,
    showModal: false,
    tabs: ["发表", "评论", "粉丝", "关注"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    publishList: [],
    commentList: [],
    fanList: [],
    focusList: [],
    page: 1,
    userId: null
  },
  onLoad: function (options) {
    var userId = options.userId
    this.setData({
      userId: userId
    })
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    this.getInfo()
  }
  ,
  onReachBottom: function () {
    if (this.data.activeIndex == 1) {
      //评论
      this.getComment()
    }
  },
  
  getCircleUser: function (e) {
    //查看登录用户是否关注过该用户
    if (wx.getStorageSync(token) == '') {
      this.setData({
        msg: '+关注'
      })

    } else {
      var that = this
      wx.request({
        url: app.conf.host + '/user/focus/exist/' + that.data.userInfo.ID,
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
          that.getArticle()
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },

  getInfo() {
    var that = this
    wx.request({
      url: app.conf.host + '/user/one/info?userId=' + that.data.userId,
      header: {
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        var time = Math.ceil((new Date().getTime() - new Date(res.data.data.CREATED).getTime()) / (1000 * 60 * 60 * 24))
        res.data.data.CREATED = time
        if(res.data.data.STATUE==1){
          res.data.data.IMG="../../img/bg_close.jpg"
        }
        that.setData({
          userInfo: res.data.data
        })
        that.getCircleUser()
      },
      fail: function (res) { },
      complete: function (res) {
        wx.stopPullDownRefresh()
      },
    })
  },
  timeDefference: function (startTime, endTime) {
    var t1 = new Date(startTime)
    var t2 = new Date(endTime)
    if (t1.getFullYear() - t2.getFullYear() > 0) {
      var result = t1.getFullYear() - t2.getFullYear()
      return result + "年";
    }
    if (t1.getMonth() - t2.getMonth() > 0) {
      var result = t1.getMonth() - t2.getMonth();
      return;
    }
    if (t1.getDate() - t2.getDate() > 0) {
      var result = t1.getDate() - t2.getDate();
      return result + "天";
    }
    if (t1.getHours() - t2.getHours() > 0) {
      var result = t1.getHours() - t2.getHours();
      return result + "小时";
    }
    if (t1.getMinutes() - t2.getMinutes() > 0) {
      var result = t1.getMinutes() - t2.getMinutes();
      return result + "分钟";
    }
    return "刚刚"
  },
  open: function () {
    var that = this
    var urls = []
    urls.push(that.data.userInfo.IMG)
    wx.previewImage({
      current: that.data.userInfo.IMG,
      urls: urls,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    var index = e.currentTarget.id
    if (index == 0) {
      //发表
      this.getArticle()
    } else if (index == 1) {
      //评论
      this.getComment()
    } else if (index == 2) {
      //粉丝
      this.getFans()
    } else {
      //关注
      this.getFocus()
    }
  },
  getComment() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/comment/one/all?page=' + that.data.page + "&userId=" + that.data.userId,
      data: '',
      header: {
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          for (var i = 0; i < res.data.data.length; i++) {
            var date = new Date(res.data.data[i].CREATED)
            res.data.data[i].CREATED = time.formatTime(date)
          }
          that.setData({
            commentList: that.data.commentList.concat(res.data.data)
          })
          if (res.data.data.length != 0) {
            that.setData({
              page: that.data.page + 1
            })
          }
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  getArticle() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/article/one/list?userId=' + that.data.userId,
      header: {
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          for (var i = 0; i < res.data.data.length; i++) {
            var date = new Date(res.data.data[i].CREATED)
            res.data.data[i].CREATED = time.formatTime(date)
          }
          that.setData({
            publishList: res.data.data
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  toDetail: function (e) {
    var index = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?id=' + this.data.publishList[index].ID + "&i=0"
    })
  },
  toCommentDetail: function (e) {
    var index = parseInt(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?id=' + this.data.commentList[index].BELONG_ID + "&i=" + this.data.commentList[index].TYPE
    })
  },
  focusUser: function (e) {
    //关注用户
    if (wx.getStorageSync(token) != '') {
      var that = this
      wx.request({
        url: app.conf.host + '/user/focus',
        data: {
          beuserId: that.data.userInfo.ID
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
  },

  getFans() {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/user/fans?userId=' + that.data.userInfo.ID,
      data: '',
      header: {
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            fanList: res.data.data
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  getFocus: function (e) {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/user/focus/user?userId=' + that.data.userInfo.ID,
      data: {
      },
      header: {
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          that.setData({
            focusList: res.data.data
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  toUserDetail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userInfo/userInfo?userId=' + id
    })
  }
})
