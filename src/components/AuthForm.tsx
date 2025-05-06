import { useState } from 'react'
import { Card, Input, Button, Typography, Space, message, Row, Col } from 'antd'
import { supabase } from '../supabaseClient'
import { motion } from 'framer-motion'
import { CheckSquareOutlined, CalendarOutlined, CommentOutlined, FolderOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const MotionCard = motion(Card)

const features = [
  {
    icon: <CheckSquareOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    title: 'Task Management',
    description: 'Organize your tasks with ease using our intuitive interface'
  },
  {
    icon: <CalendarOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    title: 'Calendar View',
    description: 'Visualize your schedule with our powerful calendar'
  },
  {
    icon: <CommentOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    title: 'Task Comments',
    description: 'Add comments and track activity for each task'
  },
  {
    icon: <FolderOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    title: 'File Organization',
    description: 'Keep your files organized and easily accessible'
  }
]

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
      background: '#000000',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      transition: 'background 0.3s',
    }}>
      <Row style={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <Col xs={0} md={12} style={{ 
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title level={1} style={{ marginBottom: 24, fontSize: '3.5rem', color: '#ffffff' }}>
              Task Management Made Simple
            </Title>
            <Paragraph style={{ fontSize: '1.2rem', marginBottom: 48, color: '#a6a6a6' }}>
              Organize your tasks, collaborate with your team, and boost your productivity with our powerful task management platform.
            </Paragraph>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Space size="large">
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      {feature.icon}
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#ffffff' }}>{feature.title}</Title>
                      <Text style={{ color: '#a6a6a6' }}>{feature.description}</Text>
                    </div>
                  </Space>
                </motion.div>
              ))}
            </Space>
          </motion.div>
        </Col>

        {/* Auth Form Section */}
        <Col xs={24} md={12} style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#000000'
        }}>
          <MotionCard
            style={{ 
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
              borderRadius: 16,
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={3} style={{ textAlign: 'center', marginBottom: 0, color: '#ffffff' }}>
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </Title>
                <Text style={{ textAlign: 'center', display: 'block', color: '#a6a6a6' }}>
                  {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
                </Text>

                {!isLogin && (
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    size="large"
                    required
                    style={{ background: '#000000', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  size="large"
                  required
                  style={{ background: '#000000', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
                />
                <Input.Password
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  size="large"
                  required
                  style={{ background: '#000000', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
                />
                {error && <Text type="danger">{error}</Text>}
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading} 
                  size="large"
                  style={{ 
                    height: 48,
                    background: '#1890ff',
                    border: 'none'
                  }}
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
                <Button 
                  type="link" 
                  block 
                  onClick={() => setIsLogin(!isLogin)}
                  style={{ 
                    height: 48,
                    color: '#1890ff'
                  }}
                >
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </Button>
              </Space>
            </form>
          </MotionCard>
        </Col>
      </Row>
    </div>
  )
} 