const fs = require('fs');
const qs = require('qs');
const path = require('path');
const download = require('download');
const axios = require('axios');
const autoUtils = require('./auto-utils');
const lodash = require('lodash');
const child_process = require("child_process");
const aesUtils = require('./aesDecryptUtils');
const fileUtils = require('./utils');

function clearDir() {
  fileUtils.emptyDir(path.resolve(__dirname, 'download'))
  console.log('文件夹清空完成！');
}

(async () => {
  // 获取所有章节信息，取得ID组、与章节名称 c0-param0=string 为 课程ID
  const planNewBeanPayload = `callCount=1
scriptSessionId=\${scriptSessionId}190
httpSessionId=6b594d59624f4148841522acca6a3ec5
c0-scriptName=PlanNewBean
c0-methodName=getPlanCourseDetail
c0-id=0
c0-param0=string:1209403892
c0-param1=number:0
c0-param2=null:null
batchId=1656038942505`;
  const { data } = await axios.post('https://study.163.com/dwr/call/plaincall/PlanNewBean.getPlanCourseDetail.dwr', planNewBeanPayload, {
    headers: { 'Content-Type': 'text/plain', 'content-length': planNewBeanPayload.length }
  })

  // 获取所有章节信息，取得 ID、章节名称组
  const sectionInfos = autoUtils.getSectionInfo(data);
  console.log('sectionInfos: ', sectionInfos);

  // 循环处理每个章节，如果下载过程出现中断，修改此处的index初始值后，继续下载
  // 中断原因不明，懒得找了，反正已经下载完了，嘿嘿
  for (let index = 0; index < sectionInfos.length; index++) {

    const sectionInfo = sectionInfos[index];
    // 1.获取当前章节调用参数信息
    const getVideoLearnInfoPayload = `callCount=1
scriptSessionId=\${scriptSessionId}190
httpSessionId=6b594d59624f4148841522acca6a3ec5
c0-scriptName=LessonLearnBean
c0-methodName=getVideoLearnInfo
c0-id=0
c0-param0=string:${sectionInfo.id}
c0-param1=string:1209403892
batchId=11111111112`;

    const { data } = await axios.post('https://study.163.com/dwr/call/plaincall/LessonLearnBean.getVideoLearnInfo.dwr', getVideoLearnInfoPayload, {
      headers: { 'Content-Type': 'text/plain', 'content-length': getVideoLearnInfoPayload.length, 'Cookie': `你的Cookie` },
      withCredentials: true,
    })

    const videoInfoParams = autoUtils.getVideoInfoParams(data);
    const { data: videoAllInfo } = await axios.get(`https://vod.study.163.com/eds/api/v1/vod/video?${qs.stringify(videoInfoParams)}`, {
      headers: {}
    })


    const videoInfo = lodash.get(videoAllInfo, 'result.videos', []).find(v => v.quality === 3);
    const fileName = lodash.get(videoAllInfo, 'result.name', [])

    if (!videoInfo.k) {
      // 试看章节，直接下载
      const { data: freeVideo } = await axios.get(videoInfo.videoUrl, {
        responseType: 'arraybuffer'
      })
      await fs.promises.writeFile(path.join(__dirname, `./target/${fileName}`), freeVideo, 'binary');
      continue;
    }

    // 解密当次调用Token，AES解密密码 3fp4xs922ouw5q72 （版本 v1）
    // 解密之后拼接上协议头，以及参数 "token=" + encodeURIComponent(t) + "&t=" + (new Date).getTime();
    const token = aesUtils.decrupyAES(videoInfo.k).k

    const { data: m3u8Content } = await axios.get(`${videoInfo.videoUrl}&${qs.stringify({
      token
    })}`);

    clearDir();
    const keyName = './key';
    const regex = /.*\.ts/g;
    const urlPrefix = 'https://jdvodluwytr3t.vod.126.net/jdvodluwytr3t/nos/ept/hls/2019/06/29/'
    const keyUrl = m3u8Content.match(/URI="(.*)"/i);
    const { data: keyContent } = await axios.get(`https:${keyUrl[1].trim()}`, {
      responseType: 'stream'
    });
    const keyFileStream = fs.createWriteStream(path.resolve(__dirname, './download', keyName))
    keyContent.pipe(keyFileStream)
    const downloadFileUrls = m3u8Content.match(regex).map(i => ({ url: `${urlPrefix}${i}`, fileName: i }))
    await Promise.all(downloadFileUrls.map(item => download(item.url, 'download', { filename: item.fileName })));
    console.log('下载完成！');

    // 执行合并
    const tempM3u8File = './download/temp.m3u8';
    fs.writeFileSync(path.join(__dirname, tempM3u8File), m3u8Content.replace(/URI="(.*)"/i, `URI="${keyName}"`))

    child_process.execSync(`ffmpeg.exe -allowed_extensions ALL -i ${tempM3u8File} -vcodec copy -acodec copy ./target/${fileName}`, {
      maxBuffer: 1024 * 2000
    });

    console.log(`${fileName} -- done`);
    fs.unlinkSync(path.resolve(__dirname, tempM3u8File));
  }
})();