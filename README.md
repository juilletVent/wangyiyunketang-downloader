## 网易云课堂课程下载

**说明：如果失效，请issue提醒我删除此项目**

1. 需要提供登录的 Cookie 信息（修改 auto-download.js 第 54 行的 Cookie 信息为你自己的 Cookie 信息）
2. 需要提供课程 ID 号，将 auto-download.js 中所有的 1209403892 替换为你要下载的课程 ID 号即可（课程 ID 号自己去接口看咯~）
3. 需要在项目根目录放置 ffmpeg.exe，下载地址：[ffmpeg release](https://github.com/FFmpeg/FFmpeg/releases)
4. npm 执行`npm run start`，yarn 执行 `yarn start`，node 执行 `node ./auto-download.js`，即可启动下载，如果下载过程中出现中断，记得修改第39行的index初始值之后，重启下载，假设已经下载了10个视频了，那么就改成10，是什么原因导致的下载中断，懒得去找了（工作忙啊~~~），如果你有兴趣可以试试看。

## 额外说明

1. 有一个可疑字段：`httpSessionId`，如果你下载失败了，可以尝试按接口替换这个字段的值，也在 auto-download.js 这个文件中，我下载的时候，没有出现问题，如果出现问题，可以尝试替换相关接口的参数进行尝试
2. AES 的解密密码有可能会更换，如果更换了，就需要自己去到网站动态调试拿到 AES 解密密码，替换进来之后再下载咯。m3u8 的视频流使用了 AES-128 进行加密保护，这个的密码是通过一个接口下发，接口采用一次性 Token 进行保护，Token 来源于视频信息中的 k 字段，这个 k 字段采用 AES-CBC 加密，填充模式为 Pkcs7，解密密码为固定值：`3fp4xs922ouw5q72`，本说明编写时间为：2022-06-27 09:16:11，解密密码大概率会随着时间流逝而有所变动，可以根据 m3u8 解密请求接口进行逆向溯源调试（我就是这么找到解密密码的）

**Tips：仅提供相关思路，这些个网课站点属实恶心，给了钱都不让你自由的学习，尊重版权，但是也请尊重一下用户！**

## 获取所有章节信息，取得 ID 组、与章节名称

接口：https://study.163.com/dwr/call/plaincall/PlanNewBean.getPlanCourseDetail.dwr

payload：

```
callCount=1
scriptSessionId=${scriptSessionId}190
httpSessionId=6b594d59624f4148841522acca6a3ec5
c0-scriptName=PlanNewBean
c0-methodName=getPlanCourseDetail
c0-id=0
// 课程 ID
c0-param0=string:1209403892
c0-param1=number:0
c0-param2=null:null
batchId=1111
```

// 需要二次处理
idNamePattern：/id=\d+;.\*\.lessonName=/g

// 需要二次处理
namePattern: /\.lessonName="(.\*?)"/g

## 获取单章节信息

### 1.获取当前章节调用参数信息

接口：https://study.163.com/dwr/call/plaincall/LessonLearnBean.getVideoLearnInfo.dwr?1656036579571

payload：

```
callCount=1
scriptSessionId=${scriptSessionId}190
httpSessionId=6b594d59624f4148841522acca6a3ec5
c0-scriptName=LessonLearnBean
c0-methodName=getVideoLearnInfo
c0-id=0
// 章节ID
c0-param0=string:1279313014
// 课程ID
c0-param1=string:1209403892
batchId=1111111
```

### 获取视频实际下载地址信息

https://vod.study.163.com/eds/api/v1/vod/video?
videoId=1214812940&signature=6639323271364e4b766465327a4868304d4a6b452b53576c3875763130352b56486c396943746e69787779366b5a584475426463546c65514744692b41676167584f317434715944475366684d43424b67302f4b747062627a516e69706b4f702b50396f3664317a6a515848624963374e754b5a397771632f4e483778344d437a6a7a466b3152513248414b326e435a6635684235454652725a4874574971336e707858703442712b78553d&clientType=1

### m3u8 获取 AES 解密秘钥（Token 为一次性的）

https://vod.study.163.com/eds/api/v1/vod/hls/key?id=1214809797&token=fc56e95e8e4b8ab31bdb1e25bae3517ebea7195d57be49156c359fc0e196e6a567478526a7db17ae57ba7782f573668d03f231d2aa69b8aaed44b93670e0941f5880b8de1f4a48847c8b1033d448f6bacaac20628ea11e191859996f472670cf671e1bf5f8aa9769ad15bef447b747e37a42404d535868f94a5b4533c2e69801
