const CryptoJS = require('crypto-js');
const aesKey = '3fp4xs922ouw5q72';

function p(e) {
  var t = atob(e);
  var i = new Uint8Array(t.length);
  Array.prototype.forEach.call(t, function (e, t) {
    i[t] = e.charCodeAt(0)
  });
  return i
}
function h(e) {
  var t = new ArrayBuffer(e.length);
  var i = new Uint8Array(t);
  for (var n = 0, a = e.length; n < a; n++)
    i[n] = e.charCodeAt(n);
  return i
}
function m(e) {
  var t = Array.prototype.map.call(e, function (e) {
    return String.fromCharCode(e)
  }).join("");
  return btoa(t)
}

function p(e) {
  var t = atob(e);
  var i = new Uint8Array(t.length);
  Array.prototype.forEach.call(t, function (e, t) {
    i[t] = e.charCodeAt(0)
  });
  return i
}
function f(e) {
  var t = [], i, n, a;
  for (n = 0; n < e.length; ++n) {
    i = e[n];
    for (a = 3; a >= 0; --a)
      t.push(i >> 8 * a & 255)
  }
  return t
}
function _(e) {
  return String.fromCharCode.apply(null, e)
}

/**
 * @param {*} e url
 * @param {*} t key
 * @returns 
 */
function g(e, t) {
  if (e) {
    var i = window.location.protocol;
    t = t.replace(/(^\/\/)|(^http:\/\/)|(^https:\/\/)/, i + "//");
    var n = "token=" + encodeURIComponent(t) + "&t=" + (new Date).getTime();
    if (e.indexOf("?") != -1)
      return e + "&" + n;
    else
      return e + "?" + n
  }
}

function decrupyAES(content) {
  // 数据
  var a = p(content);
  var o = new Uint8Array(a.buffer, 0, 16);
  // aes key
  const n = CryptoJS.enc.Base64.parse(m(h(aesKey)));
  o = CryptoJS.enc.Base64.parse(m(o));
  let e = new Uint8Array(a.buffer, 16, a.length - 16);
  e = CryptoJS.enc.Base64.parse(m(e));
  var s = CryptoJS.AES.decrypt({
    ciphertext: e
  }, n, {
    iv: o,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const plaintext = _(f(s.words));
  return JSON.parse(plaintext);
}

module.exports = { decrupyAES }

