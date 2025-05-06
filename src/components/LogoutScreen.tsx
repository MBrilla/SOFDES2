import { Typography, Space } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const { Title, Text } = Typography

export default function LogoutScreen() {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      color: '#ffffff'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Space direction="vertical" align="center" size="large">
          <LogoutOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
            Logging out...
          </Title>
          <Text style={{ color: '#a6a6a6' }}>
            Please wait while we securely end your session
          </Text>
          <Text style={{ color: '#1890ff', fontSize: '1.2rem' }}>
            {countdown} seconds remaining
          </Text>
        </Space>
      </motion.div>
    </div>
  )
} 