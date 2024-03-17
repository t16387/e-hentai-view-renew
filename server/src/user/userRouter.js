const express = require('express')
const { login, validateLogin, getUserSetting } = require('./userApi')
const { getCookieString } = require('../utils/cookies')
const cache = require('../cache')
const router = express.Router()

const cookieOption = (req) => ({
  maxAge: 6 * 31 * 24 * 60 * 60 * 1000,
  path: '/',
})

router.post('/login', async (req, res) => {
  const { UserName, PassWord, method, ipb_member_id, ipb_pass_hash, igneous } =
    req.body

  let content = ''
  let userCookie = {}

  if (method === 'cookie') {
    content = await validateLogin({ ipb_member_id, ipb_pass_hash, igneous })
    userCookie = { ipb_member_id, ipb_pass_hash, igneous }
  } else {
    const { message, cookie } = await login({ UserName, PassWord })
    content = message
    userCookie = cookie
  }

  const { cookie: setingCookie } = await getUserSetting(
    getCookieString(userCookie)
  )
  Object.entries({ ...setingCookie, ...userCookie }).forEach(([key, value]) => {
    if (key === 'igneous' && value === 'mystery')
      throw new Error('[login faild] User cookie "igneous" value error')
    res.cookie(key, value, cookieOption(req))
  })
  res.send({ error: false, message: content })
})

router.post('/setting', async (req, res) => {
  const { cookie } = await getUserSetting(getCookieString(req.cookies))
  Object.entries(cookie).forEach(([key, value]) =>
    res.cookie(key, value, cookieOption(req))
  )

  cache.del(
    cache.keys().filter((v) => v.includes(`[g${req.cookies.ipb_member_id}]`))
  )
  res.send({ error: false, message: 'fresh setting success' })
})

router.post('/logout', (req, res) => {
  res.clearCookie('ipb_member_id')
  res.clearCookie('ipb_pass_hash')
  res.clearCookie('igneous')

  res.send({ error: false, message: 'Logout success' })
})

router.get('/check', async (req, res) => {
  const { ipb_member_id, ipb_pass_hash, igneous } = req.cookies
  if (!ipb_member_id || !ipb_pass_hash || !igneous) {
    return res.send({ error: true, message: 'Not login' })
  }
  const content = await validateLogin({ ipb_member_id, ipb_pass_hash, igneous })
  res.send({ error: false, message: content })
})

module.exports = router
