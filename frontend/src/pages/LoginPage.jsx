import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Tabs, message, Divider, Checkbox, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, WechatOutlined } from '@ant-design/icons'
import { login, register, wechatLogin } from '../services/api'

const { TabPane } = Tabs

function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const result = await login(values.account, values.password)
      localStorage.setItem('token', result.access_token)
      localStorage.setItem('user', JSON.stringify(result.user))
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      message.error(error.detail || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      const result = await register(values)
      localStorage.setItem('token', result.access_token)
      localStorage.setItem('user', JSON.stringify(result.user))
      message.success('注册成功')
      navigate('/')
    } catch (error) {
      message.error(error.detail || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  const handleWechatLogin = () => {
    const appId = 'your_wechat_appid'
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/wechat/callback')
    const state = Math.random().toString(36).substring(7)
    localStorage.setItem('wechat_state', state)
    
    const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`
    window.location.href = url
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <h1 style={{ margin: 0, fontSize: 24 }}>简历清洗系统</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>智能简历处理平台</p>
        </div>

        <Tabs defaultActiveKey="login" centered>
          <TabPane tab="登录" key="login">
            <Form form={loginForm} onFinish={handleLogin} layout="vertical">
              <Form.Item
                name="account"
                rules={[{ required: true, message: '请输入邮箱或手机号' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="邮箱 / 手机号" 
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="密码" 
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Checkbox>记住我</Checkbox>
                  <a href="#">忘记密码？</a>
                </div>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="注册" key="register">
            <Form form={registerForm} onFinish={handleRegister} layout="vertical">
              <Form.Item
                name="email"
                rules={[
                  { required: false },
                  { type: 'email', message: '邮箱格式不正确' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="邮箱（选填）" size="large" />
              </Form.Item>
              <Form.Item
                name="phone"
                rules={[
                  { required: false },
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="手机号（选填）" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
              </Form.Item>
              <Form.Item
                name="nickname"
              >
                <Input prefix={<UserOutlined />} placeholder="昵称（选填）" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        <Divider>其他登录方式</Divider>

        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button 
              icon={<WechatOutlined />} 
              size="large"
              style={{ width: 150 }}
              onClick={handleWechatLogin}
            >
              微信登录
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
