var app = getApp()
const token = 'token'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconUrl: '../../img/icon_upload.png',
    backUrl: '../../img/icon_upload.png',
    introduction: '',
    title: '',
    type: '0',
    radioItems: [
      { name: '足球', value: '0', checked: true },
      { name: '影视', value: '1' },
      { name: '音乐', value: '2' },
      { name: '二次元', value: '3' },
      { name: '三次元', vaue: '4' },
      { name: '游戏', value: '5' },
      { name: '学习', value: '6' },
      { name: '体育', value: '7' },
      { name: '搞笑', value: '8' },
      { name: '高校', value: '9' },
      { name: '其他', value: '10' }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  titleInput: function (e) {
    this.setData({
      title: e.detail.value
    })
  },
  introductionBlur(e) {
    console.log(e)
  },
  introductionInput(e) {
    var introduction = e.detail.value
    this.setData({
      introduction: e.detail.value
    })
  },
  selectImg: function (e) {
    var type = e.currentTarget.dataset.img
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
                if (type == 'icon') {
                  that.setData({
                    iconUrl: data.data[0]
                  })
                } else {
                  that.setData({
                    backUrl: data.data[0]
                  })
                }
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
  }
  ,
  submit: function (e) {
    //提交信息
    //没有登录
    if (wx.getStorageSync(token) == '') {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return ;
    }
    if (this.data.title == '') {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.iconUrl == '') {
      wx.showToast({
        title: '图标不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.introduction == '') {
      wx.showToast({
        title: '简介不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (this.data.backUrl == '') {
      wx.showToast({
        title: '背景图不能为空',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    var that = this
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    wx.request({
      url: app.conf.host + '/football/api/circle/ccsubmit',
      data: {
        title: that.data.title,
        introduction: that.data.introduction,
        img: that.data.iconUrl,
        background: that.data.backUrl,
        type: parseInt(that.data.type)
      },
      header: {
        'X-AUTH-TOKEN': wx.getStorageSync(token)
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data.code === 20000) {
          wx.showToast({
            title: '提交成功',
            duration: 1000,
          })
          wx.switchTab({
            url: '/pages/circle/circle'
          })
        } else if (res.data.code === 40001) {
          //小黑屋
          wx.showToast({
            title: '你当前为小黑屋状态,不能进行相关操作',
            icon: 'none',
            duration: 1500
          })
        } else {
          wx.showToast({
            title: '发表失败,请重试',
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
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);

    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }

    this.setData({
      radioItems: radioItems,
      type: e.detail.value
    });
  },
})