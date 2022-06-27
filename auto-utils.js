const unraw = require('unraw');

function getSectionInfo(str) {
  const idNamePattern = /id=\d+;.*\.lessonName=".*";/g
  const idPattern = /id=(\d+);/
  const namePattern = /lessonName="(.*?)";/
  const idNameMatched = str.match(idNamePattern);

  const result = idNameMatched.map(i => {
    const temp = {};
    temp.id = i.match(idPattern)[1]
    temp.name = decodeURIComponent(unraw.default(i.match(namePattern)[1]));
    return temp
  })

  return result;
}

function getVideoInfoParams(str) {
  const videoIdPattern = /videoId=(\d+)/;
  const signaturePattern = /signature="(.*?)"/;
  const temp = { clientType: 1 };

  temp.videoId = str.match(videoIdPattern)[1];
  temp.signature = str.match(signaturePattern)[1];

  return temp;
}

module.exports = {
  getSectionInfo, getVideoInfoParams
}