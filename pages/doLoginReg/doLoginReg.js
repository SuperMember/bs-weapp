var app = getApp()
const token = "token"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
    usernameReg: '',
    passwordReg: '',
    passwordReg2: '',
    id: '',
    phone: '',
    codeMsg: '发送验证码',
    code: '',
    next: false,
    sex: '男',
    forget: false,
    show: true,
    secret: false,
    type: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var type = options.type
    wx.setNavigationBarTitle({
      title: id
    })
    this.setData({
      id: id,
      type: type
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
  userNameInput: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  passWdInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  //登录
  submit: function () {
    if (this.data.username == '') {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
      return;
    }
    if (this.data.password == '') {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }
    var that = this
    wx.showLoading({
      title: '登录中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/user/login',
      data: {
        username: that.data.username,
        password: that.data.password
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.hideLoading()
          wx.showToast({
            title: '登录成功'
          })
          //保存token
          wx.setStorageSync('token', res.data.message)
          //设置全局状态
          app.globalData.clear = false
          if (that.data.type != undefined) {
            wx.switchTab({
              url: '/pages/my/my',
            })
          } else {
            wx.navigateBack({
              delta: 2,
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }

      },
      fail: function (res) {
        wx.showToast({
          title: '登录失败'
        })
      },
      complete: function (res) {
      },
    })
  },
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  codeInput: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  register: function (e) {
    //注册按钮
    if (this.data.phone == '') {
      wx.showToast({
        title: '手机号不能为空',
        duration: 1000,
        icon: 'none'
      })
      return;
    }
    if (this.data.code == '') {
      wx.showToast({
        title: '验证码不能为空',
        duration: 1000,
        icon: 'none'
      })
      return;
    }
    var that = this
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
            duration: 1000
          })
          that.setData({
            next: true
          })
        } else {
          wx.showToast({
            title: '验证失败,请重试',
            duration: 1000,
            icon: 'none'
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  getCode: function (e) {
    var id = e.currentTarget.dataset.id
    var url = ''
    if (id == 'forget') {
      url = app.conf.host + '/user/phone/secret'
    } else {
      url = app.conf.host + '/user/phone'
    }
    this.getCodeByPhone(url)
  },
  getCodeByPhone: function (url) {
    //获取验证码
    if (this.data.phone == '') {
      wx.showToast({
        title: '手机号不能为空',
        duration: 1000
      })
      return;
    }
    var that = this
    var time = 60
    var interval = setInterval(function () {
      time--
      this.setData({
        codeMsg: time + 'S后重新发送'
      })
      if (time <= 0) {
        clearInterval(interval)
        this.setData({
          codeMsg: '发送验证码'
        })
      }
    }.bind(this), 1000)

    wx.request({
      url: url,
      data: {
        phone: that.data.phone
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 50000) {
          wx.showToast({
            title: '手机号已经被占用'
          })
        } else {
          wx.showToast({
            title: '发送成功'
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  userNameRegInput: function (e) {
    this.setData({
      usernameReg: e.detail.value
    })
  },
  passwordRegInput1: function (e) {
    this.setData({
      passwordReg: e.detail.value
    })
  },
  passwordRegInput2: function (e) {
    this.setData({
      passwordReg2: e.detail.value
    })
  },
  submitReg: function (e) {
    //提交注册信息
    if (this.data.usernameReg == '') {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    } else if (this.data.usernameReg.length >= 10) {
      wx.showToast({
        title: '用户名长度不超过10',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.passwordReg == '') {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.passwordReg != this.data.passwordReg2) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none',
        duration: 1000,
      })
      return;
    }
    wx.showNavigationBarLoading()
    var that = this
    wx.request({
      url: app.conf.host + '/user/info',
      data: {
        username: that.data.usernameReg,
        password: that.data.passwordReg,
        sex: that.data.sex == '男' ? 0 : 1,
        phone: that.data.phone,
      },
      header: {},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        wx.hideNavigationBarLoading()
        if (res.data.code == 20000) {
          wx.showToast({
            title: '注册成功',
            duration: 1000,
            success: function (res) {
              //跳转
              wx.redirectTo({
                url: '/pages/login/login'
              })
            },
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '注册失败,请重试',
          icon: 'none',
          duration: 1000,
        })
      },
      complete: function (res) {
        wx.hideNavigationBarLoading()
      },
    })
  },
  switchChange: function (e) {
    //选择性别
    if (e.detail.value) {
      this.setData({
        sex: '女'
      })
    } else {
      this.setData({
        sex: '男'
      })
    }
  },
  forget: function (e) {
    wx.setNavigationBarTitle({
      title: '找回密码'
    })
    this.setData({
      forget: true,
      show: false
    })
  },
  editSecret: function (e) {
    this.setData({
      forget: false,
      secret: true
    })
  },
  submitSecret: function (e) {
    //提交密码修改
    if (this.data.passwordReg == '') {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.passwordReg != this.data.passwordReg2) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none',
        duration: 1000,
      })
      return;
    }
    var that = this
    wx.showLoading({
      title: '提交中'
    })
    wx.request({
      url: app.conf.host + '/user/secret',
      data: {
        password: that.data.passwordReg2,
        phone: that.data.phone
      },
      header: {},
      method: 'PUT',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code == 20000) {
          wx.showToast({
            title: '修改成功',
            duration: 1000,
          })
          //清空缓存重新登陆
          wx.clearStorageSync(token)
          wx.redirectTo({
            url: '/pages/login/login'
          })
        } else {
          wx.showToast({
            title: '修改失败,请重试',
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
  }
})