var app = getApp()
const token = "token"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [],
    title: '',
    content: '',
    hidden: true,
    cid: null,
    top: 0,
    isOwner:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cid = options.cid
    this.setData({
      cid: cid
    })
    this.checkRole()
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

  }
  ,
  checkRole: function (e) {
    var that = this
    //检测用户角色
    wx.request({
      url: app.conf.host + '/user/check/role?cId=' + that.data.cid,
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) { 
        if(res.data.code==20000){
          that.setData({
            isOwner:true
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  selectImg: function (e) {
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
            for (var i = 0; i < data.data.length; i++) {
              that.data.imgs.push(data.data[i])
            }
            that.setData({
              imgs: that.data.imgs
            })
            wx.hideLoading()
            wx.showToast({
              title: '上传成功',
              duration: 500
            })
          }
        })
      }
    })
  }
  ,
  submit: function (e) {
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
    //提交
    //检查字段
    if (this.data.title == '') {
      this.setData({
        hidden: false
      })
      wx.showToast({
        title: '标题不能为空',
        duration: 1000
      })
      return;
    }
    if (this.data.imgs.length == 0 && this.data.content == '') {
      wx.showToast({
        title: '内容不能为空',
        duration: 1000
      })
      return;
    }
    if (this.data.imgs.length != 0) {
      if (this.data.content == '') {
        this.setData({
          content: '分享图片'
        })
      }
    }
    var that = this
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/arsubmit',
      data: {
        title: that.data.title,
        content: that.data.content,
        imgs: that.data.imgs.join(","),
        cId: that.data.cid,
        top: that.data.top
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
            duration: 500
          })
          wx.navigateBack({
            delta: 1,
          })
        }
      },
      fail: function (res) { },
      complete: function (res) {
        wx.hideLoading()
      },
    })
  }
  ,
  bindChange: function (e) {
    this.setData({
      hidden: true
    })
  }
  ,
  bindTitle: function (e) {
    this.setData({ title: e.detail.value })
  }
  ,
  bindContent: function (e) {
    this.setData({ content: e.detail.value })
  },
  bindchange: function (e) {
    if (e.detail.value) {
      this.setData({
        top: 1
      })
    } else {
      this.setData({
        top: 0
      })
    }
  }
})