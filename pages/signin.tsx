import React, { useState } from 'react'
import { login, UserPayload } from 'apis'
import message from 'components/message'
import { useRouter } from 'next/router'
import { NextPage } from 'next'
import Layout from 'components/Layout'
import Link from 'components/Link'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import {
  Tabs,
  Tab,
  Container,
  Typography,
  Avatar,
  CircularProgress,
  Backdrop,
  AppBar,
  Button,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import Login from '@/signin/login'
import CookieLogin from '@/signin/cookieLogin'
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    padding: theme.spacing(0.25),
    backgroundColor: theme.palette.common.white,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  appBar: {
    margin: theme.spacing(1, 0),
  },
}))

const TabPanel: React.FC<{ value: any; index: any }> = ({
  value,
  index,
  children,
}) => {
  return <div hidden={value !== index}>{children}</div>
}
const SignIn: NextPage = () => {
  const classes = useStyles()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const onSubmit = async (payload: UserPayload) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 5000)
    payload.method = index === 1 ? 'cookie' : undefined
    let res = await login(payload)
    setLoading(false)
    if (!res.error) {
      message.success(res.message)
      router.replace('/index?page=0')
    } else {
      message.error(res.message)
    }
  }
  return (
    <Layout title="sign in">
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <Avatar className={classes.avatar} src="/static/favicon.ico">
            E
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Alert severity="warning">
            由于浏览器安全限制，您必须在当前浏览器里登录过
            <Link
              prefetch={false}
              href="https://forums.e-hentai.org/index.php"
              target="_blank"
            >
              exhentai
            </Link>
            站点，才能正常查看图片
          </Alert>
          <AppBar
            position="static"
            color="transparent"
            className={classes.appBar}
          >
            <Tabs
              variant="fullWidth"
              value={index}
              onChange={(_e, v) => setIndex(v)}
            >
              <Tab label="email" />
              <Tab label="cookie" />
            </Tabs>
          </AppBar>
          <TabPanel index={0} value={index}>
            <Login onSubmit={onSubmit} />
          </TabPanel>
          <TabPanel index={1} value={index}>
            <CookieLogin onSubmit={onSubmit} />
          </TabPanel>

          <Backdrop open={loading} className={classes.backdrop}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </div>
      </Container>
    </Layout>
  )
}

export default SignIn
