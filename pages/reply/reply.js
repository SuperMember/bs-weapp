var app = getApp()
var token = 'token'
var time = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    page: 1,
    comment: {},
    replyList: [],
    releaseFocus: false,
    add: true,
    content: '',
    ImgUrl: '../../img/icon_add.png',
    releaseName: '',
    currentIndex: null,
    nomore: false,
    currentCommentIndex: null,
    reportContent: 0,
    items: [
      { name: '色情', value: 0, checked: 'true' },
      { name: '无端谩骂', value: 1 },
      { name: '反动', value: 2 },
      { name: '不正当言论', value: 3 }
    ],
    btnMsg: '回复时间↓',
    timeUp: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var json = options.json
    var comment = JSON.parse(json)
    this.setData({
      id: comment.ID,
      comment: comment
    })
    this.getReplyById(comment.ID)
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      nomore: true,
      page: this.data.page + 1
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindReply: function (e) {
    var statue = null
    if (this.data.releaseFocus) {
      statue = false
    } else {
      statue = true
    }
    this.setData({
      releaseFocus: statue
    })
    var id = e.currentTarget.dataset.id
    var name = this.data.replyList[parseInt(id)].USERNAME
    this.setData({
      releaseName: '@' + name,
      currentIndex: parseInt(id)
    })
  },
  getReplyById(id) {
    var that = this
    wx.showNavigationBarLoading()
    wx.request({
      url: app.conf.host + '/football/api/comment/reply?commentId=' + id + "&page=" + this.data.page + "&order=" + (that.data.timeUp ? "ASC" : "DESC"),
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          for (var i = 0; i < res.data.data.length; i++) {
            var date = new Date(res.data.data[i].CREATED)
            res.data.data[i].CREATED = time.getDateDiff(time.formatTime(date).toString())
          }
          var replyList = that.data.replyList.concat(res.data.data)
          that.setData({
            replyList: res.data.data,
            nomore: false
          })

        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideNavigationBarLoading()
      },
    })
  },
  add: function (e) {
    this.setData({
      add: !this.data.add
    })
  },
  bindInput: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  upload: function () {

    var that = this
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        wx.uploadFile({
          url: app.conf.host + '/football/api/upload', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          success: function (res) {
            var data = JSON.parse(res.data)
            if (data.code == 20000) {
              that.setData({
                ImgUrl: data.data[0]
              })
              wx.hideLoading()
              wx.showToast({
                title: '上传成功',
                duration: 500
              })
            } else {
              wx.showToast({
                title: '上传失败',
                icon: 'none',
                duration: 1000
              })
            }
          }
        })
      }
    })
  },
  submit: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login?redirectUrl=/pages/reply/reply?json=' + JSON.stringify(this.data.comment)
      })
    }
    var id = this.data.currentIndex
    var that = this
    wx.showLoading({
      title: '提交中'
    })
    wx.request({
      url: app.conf.host + '/football/api/comment/reply',
      data: {
        content: "回复" + that.data.releaseName + '' + that.data.content,
        url: that.data.ImgUrl == '../../img/icon_add.png' ? '' : that.data.ImgUrl,
        commentId: that.data.comment.ID,
        touserId: that.data.replyList[parseInt(id)].USER_ID
      },
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.showToast({
            title: '提交成功',
            duration: 1000
          })
          that.getReplyById(that.data.id)
          that.setData({
            releaseFocus: false,
            add: true,
            content: '',
            ImgUrl: '../../img/icon_add.png'
          })
        } else if (res.data.code === 40001) {
          wx.showToast({
            title: '小黑屋状态不能进行该操作',
            icon: 'none',
            duration: 1000
          })
        }
        else {
          wx.showToast({
            title: '提交失败',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '提交失败',
          icon: 'none',
          duration: 1000
        })
      },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  handlezan: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login?redirectUrl=/pages/reply/reply?json' + JSON.stringify(that.data.comment)
      })
    }
    //点赞
    var id = e.currentTarget.dataset.id
    var that = this
    wx.showLoading({
      title: '提交中'
    })
    wx.request({
      url: app.conf.host + '/football/api/comment/rlike',
      data: {
        replyId: that.data.replyList[parseInt(id)].ID
      },
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.showToast({
            title: '点赞成功',
            duration: 1000
          })
          // that.getReplyById(that.data.id)
          that.data.replyList[parseInt(id)].COUNT += 1
          that.setData({
            replyList: that.data.replyList
          })
        } else {
          wx.showToast({
            title: '你已经点过赞',
            icon: 'none',
            duration: 1000
          })
        }

      },
      fail: function (res) {
        wx.showToast({
          title: '点赞失败',
          icon: 'none',
          duration: 1000
        })
      },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  scanPic: function (e) {
    var url = e.currentTarget.dataset.url
    var urls = []
    urls.push(url)
    wx.previewImage({
      current: url,
      urls: urls
    })
  },
  toUserInfo: function (e) {
    //跳转到用户信息页
    var userId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userInfo/userInfo?userId=' + userId
    })
  },
  /**
   * 弹窗
   */
  showDialogBtn: function (e) {
    this.setData({
      showModal: true,
      currentCommentIndex: e.currentTarget.dataset.id
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.reportArticle()
  },
  radioChange: function (e) {
    this.setData({
      reportContent: e.detail.value
    })
  },
  reportArticle: function (e) {
    //举报
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      var that = this
      wx.showLoading({
        title: '提交中'
      })
      wx.request({
        url: app.conf.host + '/football/api/report',
        data: {
          ruserId: that.data.replyList[parseInt(that.data.currentCommentIndex)].USER_ID,
          belongId: that.data.replyList[parseInt(that.data.currentCommentIndex)].ID,
          type: 2,
          content: that.data.reportContent + ''
        },
        header: {
          'X-AUTH-TOKEN': wx.getStorageSync(token)
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if (res.data.code == 20000) {
            wx.showToast({
              title: '举报成功',
              duration: 1500
            })
            that.hideModal()
          } else {
            wx.showToast({
              title: '举报失败',
              icon: 'none',
              duration: 1500
            })
          }
        },
        fail: function (res) { },
        complete: function (res) {
          wx.hideLoading()
        }
      })
    }
  },
  bytime: function () {
    if (this.data.timeUp) {
      this.setData({
        btnMsg: '回复时间↑'
      })
    } else {
      this.setData({
        btnMsg: '回复时间↓'
      })
    }
    this.setData({
      timeUp: !this.data.timeUp,
      replyList: [],
      page: 1
    })
    //获取数据
    this.getReplyById(this.data.id)
  }
})