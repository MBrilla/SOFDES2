import { useState, useEffect } from 'react'
import { Card, Typography, Space, Switch, Divider, Tabs, Button, message, Modal, ColorPicker, Input } from 'antd'
import { SaveOutlined, ReloadOutlined, ExportOutlined, ImportOutlined, LogoutOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'
import { ColorCustomizer } from './ColorCustomizer'
import { supabase } from '../supabaseClient'

const { Title, Text } = Typography

interface AppColors {
  primary: string
  secondary: string
  background: string
  text: string
  navbar: string
  sidebar: string
  card: string
  border: string
  accent: string
}

interface SettingsProps {
  onColorChange: (colors: AppColors) => void
  currentColors: AppColors
  useCustomColors: boolean
  setUseCustomColors: (val: boolean) => void
}

const DEFAULT_COLORS: AppColors = {
  primary: '#1890ff',
  secondary: '#13c2c2',
  background: '#ffffff',
  text: '#000000',
  navbar: '#1890ff',
  sidebar: '#13c2c2',
  card: '#ffffff',
  border: '#d9d9d9',
  accent: '#40a9ff'
}

export function Settings({ onColorChange, currentColors, useCustomColors, setUseCustomColors }: SettingsProps) {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [name, setName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)

  // Load current name on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      setName(user?.user_metadata?.full_name || '')
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    message.success('Logged out successfully')
    window.location.reload()
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      colors: currentColors,
      notifications,
      autoSave,
      compactMode,
      isDarkMode
    }
    localStorage.setItem('appSettings', JSON.stringify(settings))
    message.success('Settings saved successfully')
  }

  const handleResetSettings = () => {
    Modal.confirm({
      title: 'Reset Settings',
      content: 'Are you sure you want to reset all settings to default?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        onColorChange(DEFAULT_COLORS)
        setNotifications(true)
        setAutoSave(true)
        setCompactMode(false)
        message.success('Settings reset to default')
      }
    })
  }

  const handleExportSettings = () => {
    const settings = {
      colors: currentColors,
      notifications,
      autoSave,
      compactMode,
      isDarkMode
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `settings_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('Settings exported successfully')
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const settings = JSON.parse(event.target?.result as string)
            onColorChange(settings.colors)
            setNotifications(settings.notifications)
            setAutoSave(settings.autoSave)
            setCompactMode(settings.compactMode)
            message.success('Settings imported successfully')
          } catch (error) {
            message.error('Failed to import settings')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleColorChange = (colorType: keyof AppColors, value: string) => {
    const newColors = { ...currentColors, [colorType]: value }
    onColorChange(newColors)
  }

  const handleResetColors = () => {
    onColorChange(DEFAULT_COLORS)
  }

  const handleUpdateName = async () => {
    setNameLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    setNameLoading(false)
    if (error) message.error('Failed to update name')
    else message.success('Name updated!')
  }

  const items = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Appearance">
          <Input
                placeholder="Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ maxWidth: 300, marginRight: 8 }}
              />
              <Button type="primary" onClick={handleUpdateName} loading={nameLoading}>
                Update Name
              </Button>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                
                <Text>Dark Mode</Text>
                <Switch checked={isDarkMode} onChange={toggleDarkMode} />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text>Compact Mode</Text>
                <Switch checked={compactMode} onChange={setCompactMode} />
              </Space>
            </Space>
          </Card>

          <Card title="Notifications">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text>Enable Notifications</Text>
                <Switch checked={notifications} onChange={setNotifications} />
              </Space>
            </Space>
          </Card>

          

          <Card title="General">
            <Space direction="vertical" style={{ width: '100%' }}>
              
              <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>
                Log Out
              </Button>
            </Space>
          </Card>
        </Space>
      )
    },
    {
      key: 'colors',
      label: 'Colors',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card 
            title="UI Colors"
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => localStorage.setItem('appColors', JSON.stringify(currentColors))}
                >
                  Save Colors
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleResetColors}
                >
                  Reset to Default
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text>Use Custom UI Colors</Text>
                <Switch checked={useCustomColors} onChange={setUseCustomColors} />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Text>Background Color</Text>
                <ColorPicker
                  value={currentColors.background}
                  onChange={(color) => handleColorChange('background', color.toHexString())}
                  disabled={!useCustomColors}
                />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Text>Navbar Color</Text>
                <ColorPicker
                  value={currentColors.navbar}
                  onChange={(color) => handleColorChange('navbar', color.toHexString())}
                  disabled={!useCustomColors}
                />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Text>Sidebar Color</Text>
                <ColorPicker
                  value={currentColors.sidebar}
                  onChange={(color) => handleColorChange('sidebar', color.toHexString())}
                  disabled={!useCustomColors}
                />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Text>Card Background</Text>
                <ColorPicker
                  value={currentColors.card}
                  onChange={(color) => handleColorChange('card', color.toHexString())}
                />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Text>Text Color</Text>
                <ColorPicker
                  value={currentColors.text}
                  onChange={(color) => handleColorChange('text', color.toHexString())}
                />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Text>Border Color</Text>
                <ColorPicker
                  value={currentColors.border}
                  onChange={(color) => handleColorChange('border', color.toHexString())}
                />
              </Space>
            </Space>
          </Card>

          <Card title="Preview">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  padding: 16,
                  backgroundColor: currentColors.background,
                  borderRadius: 8,
                  border: `1px solid ${currentColors.border}`
                }}
              >
                <div
                  style={{
                    padding: 16,
                    backgroundColor: currentColors.navbar,
                    color: currentColors.text,
                    borderRadius: 4,
                    marginBottom: 8
                  }}
                >
                  Navbar Preview
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 16
                  }}
                >
                  <div
                    style={{
                      width: 200,
                      padding: 16,
                      backgroundColor: currentColors.sidebar,
                      color: currentColors.text,
                      borderRadius: 4
                    }}
                  >
                    Sidebar Preview
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: 16,
                      backgroundColor: currentColors.card,
                      color: currentColors.text,
                      borderRadius: 4,
                      border: `1px solid ${currentColors.border}`
                    }}
                  >
                    Content Area
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Space>
      )
    },
    {
      key: 'themes',
      label: 'Themes',
      children: (
        <ColorCustomizer onColorChange={onColorChange} currentColors={currentColors} />
      )
    },
    {
      key: 'about',
      label: 'About',
      children: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={4}>Todo App</Title>
            <Text>Version 1.0.0</Text>
            <Text type="secondary">A modern task management application with customizable themes and features.</Text>
            <Divider />
          </Space>
        </Card>
      )
    }
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={2}>Settings</Title>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetSettings}
          >
            Reset to Default
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportSettings}
          >
            Export
          </Button>
          <Button
            icon={<ImportOutlined />}
            onClick={handleImportSettings}
          >
            Import
          </Button>
        </Space>
      </Space>
      <Tabs
        defaultActiveKey="general"
        items={items}
        style={{ background: 'transparent' }}
      />
    </Space>
  )
} 