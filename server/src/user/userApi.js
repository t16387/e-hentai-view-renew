const { loginURL, configURL } = require('../config/api')
const axios = require('../axios')
const qs = require('qs')
const { getCookieString, parseCookieToJSON } = require('../utils/cookies')
const { parseLogin, parseCookieLogin } = require('./userPrser')

async function login(payload) {
  console.log("Payload for login: ", payload);
  const res = await axios(`${loginURL}?act=Login&CODE=01`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    maxRedirects: 0,
    data: qs.stringify({
      referer: loginURL,
      b: '',
      bt: '',
      CookieDate: 1,
      ...payload,
    }),
  })
  console.log("Response from login: ", res);
  return {
    message: parseLogin(res.data),
    cookie: parseCookieToJSON(res.headers['set-cookie']),
  }
}

async function validateLogin({ ipb_member_id, ipb_pass_hash, igneous }) {
  console.log("Validating login for: ", { ipb_member_id, ipb_pass_hash, igneous });
  const res = await axios.get(loginURL, {
    headers: {
      Cookie: getCookieString({ ipb_member_id, ipb_pass_hash, igneous }),
    },
  })
  console.log("Response from validateLogin: ", res);
  return parseCookieLogin(res.data)
}

async function getUserSetting(cookie) {
  console.log("Getting user setting for cookie: ", cookie);
  const res = await axios.get(configURL, { headers: { Cookie: cookie } })
  console.log("Response from getUserSetting: ", res);
  return { cookie: parseCookieToJSON(res.headers['set-cookie']) }
}

module.exports = { login, validateLogin, getUserSetting }