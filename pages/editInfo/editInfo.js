var app = getApp()
var time = require('../../utils/util.js')
var token = 'token'
var interval = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    showModal: false,
    phone: '',
    code: '',
    disable: false,
    codeMsg: '发送',
    hiddenmodalput: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var json = options.json
    var userInfo = JSON.parse(json)
    this.setData({
      userInfo: userInfo
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  selectImg: function () {
    var that = this
    wx.chooseImage({
      count: 1,
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
              if (data.data.length != 0) {
                that.data.userInfo.IMG = data.data[0]
                that.setData({
                  userInfo: that.data.userInfo
                })
                wx.hideLoading()
                wx.showToast({
                  title: '上传成功',
                  duration: 1500
                })

              } else {
                wx.hideLoading()
                wx.showToast({
                  title: '上传失败',
                  icon: 'none',
                  duration: 1500
                })
              }
            }

          }
        })
      }
    })
  },
  editImg: function (e) {
    var that = this
    this.selectImg()
  },
  editSex: function (e) {
    var that = this
    wx.showActionSheet({
      itemList: ['男', '女'],
      success: function (res) {
        that.data.userInfo.SEX = res.tapIndex
        that.setData({
          userInfo: that.data.userInfo
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  submit: function (e) {
    //保存
    var that = this
    wx.showLoading({
      title: '提交中'
    })
    wx.request({
      url: app.conf.host + '/user/info',
      data: {
        img: that.data.userInfo.IMG,
        sex: that.data.userInfo.SEX,
        phone: that.data.userInfo.PHONE
      },
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'PUT',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.showToast({
            title: '修改成功',
            duration: 1000
          })
          app.conf.edit = true
          wx.switchTab({
            url: '/pages/my/my'
          })
        } else {
          wx.showToast({
            title: '修改失败',
            duration: 1000
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '修改失败',
          duration: 1000
        })
      },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  logout: function (e) {
    wx.clearStorageSync();
    app.globalData.clear = true
    wx.switchTab({
      url: '/pages/my/my'
    })
  },
  showDialogBtn: function () {
    this.setData({
      showModal: true
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
    if (this.data.phone == '') {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    if (this.data.code == '') {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 1500,
        mask: true
      })
      return;
    }
    //提交验证
    var that = this
    wx.showLoading({
      title: '验证中',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/user/phone/check',
      data: {
        phone: that.data.phone,
        code: that.data.code
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.showToast({
            title: '验证成功',
            duration: 1500
          })
          that.data.userInfo.PHONE = that.data.phone
          that.setData({
            userInfo: that.data.userInfo
          })
          that.hideModal()
        } else {
          wx.showToast({
            title: '验证失败',
            icon: 'none',
            duration: 1500,
            mask: true
          })
        }
        clearInterval(interval)
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  },
  inputChange: function (e) {
    //手机号
    this.setData({
      phone: e.detail.value
    })
  },
  codeChange: function (e) {
    //验证码
    this.setData({
      code: e.detail.value
    })
  },
  bindblur: function (e) {

  },
  submitPhone: function (e) {
    //验证手机格式是否正确
    if (!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(this.data.phone))) {
      wx.showToast({
        title: '手机号码不正确',
        icon: 'none',
        duration: 1500
      })
      return;
    } else {
      this.setData({
        disable: false
      })
    }


    var that = this
    wx.request({
      url: app.conf.host + '/user/phone',
      data: {
        phone: that.data.phone
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.showToast({
            title: '发送成功',
            duration: 1500,
            mask: true
          })
          var time = 60
          interval = setInterval(function () {
            time--
            that.setData({
              codeMsg: time + 'S重发'
            })
            if (time <= 0) {
              clearInterval(interval)
              that.setData({
                codeMsg: '发送',
                disable: true
              })
            }
          }.bind(this), 1000)
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1500,
            mask: true
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
  // cancelName: function (e) {
  //   this.setData({
  //     hiddenmodalput: true
  //   });
  // },
  // confirmName: function (e) {
  //   if (this.data.username == '') {
  //     wx.showToast({
  //       title: '用户名不能为空',
  //       icon: 'none',
  //       duration: 1500,
  //       mask: true
  //     })
  //     return;
  //   } else if (this.data.username.length > 10) {
  //     wx.showToast({
  //       title: '长度不能超过10',
  //       icon: 'none',
  //       duration: 1500
  //     })
  //     return;
  //   }
  //   //检测用户名是否存在
  //   var that = this
  //   wx.showLoading({
  //     title: '提交中',
  //     mask: true
  //   })
  //   wx.request({
  //     url: app.conf.host + '/user/check/name',
  //     data: {
  //       username: that.data.username
  //     },
  //     header: {},
  //     method: 'POST',
  //     dataType: 'json',
  //     responseType: 'text',
  //     success: function (res) {
  //       if (res.data.code == 20000) {
  //         that.data.userInfo.USERNAME = that.data.username
  //         that.setData({
  //           hiddenmodalput: true,
  //           userInfo: that.data.userInfo
  //         })
  //       } else {
  //         wx.showToast({
  //           title: res.data.message,
  //           icon: 'none',
  //           duration: 1500,
  //           mask: true
  //         })
  //       }

  //     },
  //     fail: function (res) { },
  //     complete: function (res) {
  //       wx.hideLoading()
  //     },
  //   })

  // },
  // editName: function (e) {
  //   this.setData({
  //     hiddenmodalput: !this.data.hiddenmodalput
  //   })
  // },
  // bindName: function (e) {
  //   this.setData({
  //     username: e.detail.value
  //   })
  // }
})