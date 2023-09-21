module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('simpletex', {
      handle,
      name: 'simpletex',
      config
    })
  }
  const postOptions = (Key, fileName, image) => {
    return {
      method: 'POST',
      url: 'https://server.simpletex.cn/api/latex_ocr',
      headers: {
        'Content-Type': 'multipart/form-data',
        'User-Agent': 'PicGo',
        token: Key
      },
      formData: {
        file: {
          value: image,
          options: {
            filename: fileName
          }
        }
      }
    }
  }
  const handle = async (ctx) => {
    const ncp = require('copy-paste')

    const userConfig = ctx.getConfig('picBed.simpletex')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const Key = userConfig.Key
    const imgList = ctx.output
    for (const i in imgList) {
      let image = imgList[i].buffer
      if (!image && imgList[i].base64Image) {
        image = Buffer.from(imgList[i].base64Image, 'base64')
      }

      const postConfig = postOptions(Key, imgList[i].fileName, image)
      // ctx.log.info(postConfig)

      try {
        let body = await ctx.Request.request(postConfig)
        body = JSON.parse(body)
        ctx.log.info(body)

        if (body.status) {
          delete imgList[i].base64Image
          delete imgList[i].buffer
          imgList[i].imgUrl = 'https://z1.ax1x.com/2023/09/21/pPI4I3j.png'
          ncp.copy(body.res.latex, function () {
            console.log('latex copied to clipboard')
          })
        }
      } catch {
        ctx.emit('notification', {
          title: '上传失败',
          body: '上传失败'
        })
        throw new Error('上传失败')
      }
    }
    return ctx
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.simpletex')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'Key',
        type: 'input',
        default: userConfig.Key,
        required: true,
        message: 'API key',
        alias: 'API key'
      }
    ]
  }
  return {
    uploader: 'simpletex',
    // config: config,
    register
  }
}
