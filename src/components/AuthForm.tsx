import { useState } from 'react'
import { Card, Input, Button, Typography, Space, message } from 'antd'
import { supabase } from '../supabaseClient'

const { Title, Text } = Typography

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    let error
    if (isLogin) {
      const res = await supabase.auth.signInWithPassword({ email, password })
      error = res.error
    } else {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      error = res.error
    }
    setLoading(false)
    if (error) setError(error.message)
    else message.success(isLogin ? 'Logged in!' : 'Check your email to confirm sign up!')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f2f5 100%)',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      transition: 'background 0.3s',
    }}>
      <Card style={{ width: 370, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', borderRadius: 16 }}>
        <form onSubmit={handleSubmit}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 0 }}>{isLogin ? 'Login' : 'Sign Up'}</Title>
            {!isLogin && (
              <Input
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                size="large"
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              size="large"
              required
            />
            <Input.Password
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              size="large"
              required
            />
            {error && <Text type="danger">{error}</Text>}
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
            <Button type="link" block onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </Button>
          </Space>
        </form>
      </Card>
    </div>
  )
} 