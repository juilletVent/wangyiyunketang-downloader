const fs = require('fs');

//删除所有的文件(将所有文件夹置空)
function emptyDir(filePath) {
  const files = fs.readdirSync(filePath)//读取该文件夹
  files.forEach((file) => {
    const nextFilePath = `${filePath}/${file}`
    const states = fs.statSync(nextFilePath)
    if (states.isDirectory()) {
      emptyDir(nextFilePath)
    } else {
      fs.unlinkSync(nextFilePath)
    }
  })
}

//删除所有的空文件夹
function rmEmptyDir(filePath) {
  const files = fs.readdirSync(filePath)
  if (files.length === 0) {
    fs.rmdirSync(filePath)
    console.log(`删除空文件夹 ${filePath} 成功`)
  } else {
    let tempFiles = 0
    files.forEach((file) => {
      tempFiles++
      const nextFilePath = `${filePath}/${file}`
      rmEmptyDir(nextFilePath)
    })
    //删除母文件夹下的所有字空文件夹后，将母文件夹也删除
    if (tempFiles === files.length) {
      fs.rmdirSync(filePath)
      console.log(`删除空文件夹 ${filePath} 成功`)
    }
  }
}

module.exports = {
  emptyDir,
  rmEmptyDir
}