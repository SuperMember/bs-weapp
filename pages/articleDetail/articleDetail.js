var app = getApp()
var time = require('../../utils/util.js')
var token = 'token'
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: {},
    id: null,
    imgs: [],
    commentList: [],
    showModal: false,
    noMore: true,
    releaseFocus: false,
    add: true,
    ImgUrl: '../../img/icon_add.png',
    content: '',
    type: '',
    currentIndex: null,
    page: 1,
    i: 0,
    arrowImg: '../../img/icon_arrow_down.png',
    detail: '全文',
    down: false,
    showModal: false,
    items: [
      { name: '色情', value: 0, checked: 'true' },
      { name: '无端谩骂', value: 1 },
      { name: '反动', value: 2 },
      { name: '不正当言论', value: 3 }
    ],
    reportContent: 0,
    currentCommentIndex: null,
    btnMsg: '回复时间↓',
    timeUp: true,
    count: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var i = options.i
    this.setData({
      id: id,
      i: i
    })
    //根据i分别获取不同的数据(帖子,文章,视频)

    if (this.data.i == 2) {
      //文章
      this.getArticles(this.data.id, 0)
    } else if (this.data.i == 1) {
      //视频
      this.getArticles(this.data.id, 1)
    } else {
      //帖子
      this.getArticleById(this.data.id)
    }
    //设置视频播放数
    this.setVideoCount(this.data.id)
    //获取评论
    this.getComment(this.data.id)

  },
  setVideoCount(id) {
    var that = this
    wx.request({
      url: app.conf.host + '/football/api/circle/video',
      data: {
        articleId: id
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //文章,视频
  getArticles(id, type) {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/index/article?id=' + id + "&type=" + type,
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          var date = new Date(res.data.data.CREATED)
          res.data.data.CREATED = time.formatTime(date)
          that.setData({
            article: res.data.data
          })
          if (type == 0) {
            //文章
            WxParse.wxParse('article_content', 'html', res.data.data.CONTENT, that, 5)
          }
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })

  },
  //帖子
  getArticleById(id) {
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/article?id=' + id,
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          var imgs = res.data.data.IMGS.split(",")
          var date = new Date(res.data.data.CREATED)
          res.data.data.CREATED = time.formatTime(date)
          that.setData({
            article: res.data.data,
            imgs: imgs
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  bindInputBlur: function (e) {
    this.inputValue = e.detail.value
  },
  bindSendDanmu: function () {
    this.videoContext.sendDanmu({
      text: this.inputValue,
      color: this.getRandomColor()
    })
  },
  inputValue: '',
  getRandomColor: function () {
    let rgb = []
    for (let i = 0; i < 3; ++i) {
      let color = Math.floor(Math.random() * 256).toString(16)
      color = color.length == 1 ? '0' + color : color
      rgb.push(color)
    }
    return '#' + rgb.join('')
  },
  handleDetail: function (e) {
    if (!this.data.down) {
      this.setData({
        arrowImg: '../../img/icon_arrow_up.png',
        detail: '收起'
      })
    } else {
      this.setData({
        arrowImg: '../../img/icon_arrow_down.png',
        detail: '全文'
      })
    }
    this.setData({
      down: !this.data.down
    })
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
      nomore: false
    })
    this.getComment(this.data.id)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getComment(id) {
    var that = this
    wx.showNavigationBarLoading()
    wx.request({
      url: app.conf.host + '/football/api/comment/list/' + that.data.i + '/' + id + "?page=" + that.data.page + "&order=" + (that.data.timeUp ? "ASC" : "DESC"),
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          for (var i = 0; i < res.data.data.list.length; i++) {
            var date = new Date(res.data.data.list[i].CREATED)
            res.data.data.list[i].CREATED = time.getDateDiff(time.formatTime(date).toString())
            if (res.data.data.list[i].reply != null && res.data.data.list[i].reply.length != 0) {
              for (var j = 0; j < res.data.data.list[i].reply.length; j++) {
                var d = new Date(res.data.data.list[i].reply[j].CREATED)
                res.data.data.list[i].reply[j].CREATED = time.formatTime(d)
              }
            }
          }
          var commentList = that.data.commentList.concat(res.data.data.list)
          that.setData({
            commentList: commentList,
            nomore: true,
            count: res.data.data.count
          })
          if (res.data.data.list.length != 0) {
            that.setData({
              page: that.data.page + 1
            })
          }
        }

      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideNavigationBarLoading()
      },
    })
  },


  preventTouchMove: function () {

  },


  go: function (e) {
    var url = e.currentTarget.dataset.url
    var urls = []
    urls.push(url)
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  handerZan: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      //点赞
      var id = e.currentTarget.dataset.id
      var that = this
      wx.showLoading({
        title: '提交中'
      })
      wx.request({
        url: app.conf.host + '/football/api/comment/clike',
        data: {
          commentId: that.data.commentList[parseInt(id)].ID
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
            // that.setData({
            //   page: 1,
            //   commentList: []
            // })
            // that.getComment(that.data.id)
            that.data.commentList[parseInt(id)].COUNT += 1
            that.setData({
              commentList: that.data.commentList
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
    }
  },
  bindReply: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      var type = e.currentTarget.dataset.type
      var statue = null
      if (this.data.releaseFocus) {
        statue = false
      } else {
        statue = true
      }
      if (type == 'reply') {
        this.setData({
          currentIndex: e.currentTarget.dataset.id
        })
      }
      this.setData({
        releaseFocus: statue,
        type: type
      })
    }
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
  submit: function () {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
    if (this.data.ImgUrl == '' && this.data.content == '') {
      wx.showToast({
        title: '回复内容不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.content == '') {
      this.setData({
        content: '图片分享'
      })
    }
    if (this.data.type == "comment") {
      this.submitComment()
    } else {
      this.submitReply()
    }
  },
  submitComment: function () {
    var that = this
    wx.showLoading({
      title: '提交中'
    })
    wx.request({
      url: app.conf.host + '/football/api/comment/list',
      data: {
        comment: that.data.content,
        url: that.data.ImgUrl == '../../img/icon_add.png' ? '' : that.data.ImgUrl,
        type: that.data.i,
        belongId: that.data.id,
        cId: that.data.article.C_ID
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
          that.setData({
            releaseFocus: false,
            add: true,
            content: '',
            ImgUrl: '',
            page: 1,
            commentList: []
          })
          that.getComment(that.data.id)
        } else if (res.data.code === 40001) {
          wx.showToast({
            title: '小黑屋状态不能进行此操作',
            icon: 'none',
            duration: 1500
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
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  submitReply: function (e) {

    var id = this.data.currentIndex
    var that = this
    wx.showLoading({
      title: '提交中'
    })
    wx.request({
      url: app.conf.host + '/football/api/comment/reply',
      data: {
        content: that.data.content,
        url: that.data.ImgUrl == '../../img/icon_add.png' ? '' : that.data.ImgUrl,
        commentId: that.data.commentList[parseInt(id)].ID,
        touserId: that.data.commentList[parseInt(id)].USER_ID
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
          that.setData({
            releaseFocus: false,
            add: true,
            content: '',
            ImgUrl: '',
            commentList: [],
            page: 1
          })
          that.getComment(that.data.id)
        } else if (res.data.code === 40001) {
          wx.showToast({
            title: '小黑屋状态不能进行此操作',
            icon: 'none',
            duration: 1500
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
  todetail: function (e) {
    var id = parseInt(e.currentTarget.dataset.id)
    var json = JSON.stringify(this.data.commentList[id])
    wx.navigateTo({
      url: '/pages/reply/reply?json=' + json
    })
  }
  ,
  scanPic: function (e) {
    //浏览图片
    var that = this
    var index = e.currentTarget.dataset.id
    wx.previewImage({
      current: that.data.imgs[index],
      urls: that.data.imgs
    })
  },

  scanImg: function (e) {
    var that = this
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
      var ruserId;
      var belongId;
      var type;
      if (this.data.currentCommentIndex != null) {
        //评论
        var index = this.data.currentCommentIndex
        ruserId = this.data.commentList[parseInt(index)].USER_ID
        belongId = this.data.commentList[parseInt(index)].ID
        type = 0
      } else {
        ruserId = that.data.article.USERID
        belongId = that.data.article.ID
        type = 1
      }

      wx.request({
        url: app.conf.host + '/football/api/report',
        data: {
          ruserId: ruserId,
          belongId: belongId,
          type: type,
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
        },
      })
    }
  }
  ,
  /**
    * 弹窗
    */
  showDialogBtn: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      this.setData({
        showModal: true,
        currentCommentIndex: e.currentTarget.dataset.id
      })
    }
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
      commentList: [],
      page: 1
    })
    //获取数据
    this.getComment(this.data.id)
  },
  toUserDetail: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/userInfo/userInfo?userId=' + id
    })
  }
})