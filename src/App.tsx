import { useEffect, useState } from 'react'
import { Layout, Menu, Button, Space, Drawer } from 'antd'
import { BulbOutlined, DashboardOutlined, CheckSquareOutlined, SettingOutlined, BarChartOutlined, FolderOutlined, ClockCircleOutlined, MenuOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { TodoProvider } from './context/TodoContext'
import Dashboard from './components/Dashboard'
import TodoList from './components/TodoList'
import { Settings } from './components/Settings'
import Analytics from './components/Analytics'
import { FileOrganizer } from './components/FileOrganizer'
import { ColorCustomizer } from './components/ColorCustomizer'
import AuthForm from './components/AuthForm'
import { supabase } from './supabaseClient'
import CalendarView from './components/Calendar'
import type { Session } from '@supabase/supabase-js'

const { Header, Sider, Content } = Layout

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

function AppContent() {
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [colors, setColors] = useState<AppColors>({
    primary: '#1890ff',
    secondary: '#13c2c2',
    background: '#ffffff',
    text: '#000000',
    navbar: '#1890ff',
    sidebar: '#13c2c2',
    card: '#ffffff',
    border: '#d9d9d9',
    accent: '#40a9ff'
  })
  const [useCustomColors, setUseCustomColors] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [drawerVisible, setDrawerVisible] = useState(false)

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  if (!user) return <AuthForm />

  const appliedColors = useCustomColors ? colors : undefined

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />
      case 'calendar':
        return <CalendarView />
      case 'todos':
        return <TodoList />
      case 'organizer':
        return <FileOrganizer />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <Settings 
          onColorChange={setColors} 
          currentColors={colors} 
          useCustomColors={useCustomColors}
          setUseCustomColors={setUseCustomColors}
        />
      case 'colors':
        return <ColorCustomizer onColorChange={setColors} currentColors={colors} />
      default:
        return <Dashboard />
    }
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'calendar',
      icon: <ClockCircleOutlined />,
      label: 'Calendar',
    },
    {
      key: 'todos',
      icon: <CheckSquareOutlined />,
      label: 'Todo List',
    },
    {
      key: 'organizer',
      icon: <FolderOutlined />,
      label: 'File Organizer',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />, 
      label: 'Analytics',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key)
    if (isMobile) {
      setDrawerVisible(false)
    }
  }

  const renderMenu = () => (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      style={useCustomColors
        ? {
            height: '100%',
            borderRight: 0,
            background: colors.sidebar,
            color: colors.text
          }
        : {
            height: '100%',
            borderRight: 0,
            background: isDarkMode ? '#181818' : '#fff',
            color: isDarkMode ? '#fff' : '#000'
          }
      }
      theme={isDarkMode ? 'dark' : 'light'}
      items={menuItems}
      onClick={handleMenuClick}
    />
  )

  return (
    <Layout style={appliedColors ? {
      minHeight: '100vh',
      background: appliedColors.background,
      color: appliedColors.text
    } : { minHeight: '100vh' }}>
      <Header
        style={useCustomColors
          ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: colors.navbar,
              color: colors.text,
              borderBottom: `1px solid ${colors.border}`,
              padding: isMobile ? '0 16px' : '0 24px',
            }
          : {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDarkMode ? '#181818' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
              borderBottom: isDarkMode ? '1px solid #222' : '1px solid #eee',
              padding: isMobile ? '0 16px' : '0 24px',
            }
        }
      >
        <Space>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={useCustomColors ? { color: colors.text } : { color: isDarkMode ? '#fff' : '#000' }}
            />
          )}
          <h1
            style={useCustomColors
              ? { margin: 0, color: colors.text, fontSize: isMobile ? '1.2rem' : '1.5rem' }
              : { margin: 0, color: isDarkMode ? '#fff' : '#000', fontSize: isMobile ? '1.2rem' : '1.5rem' }
            }
          >
            Focus
          </h1>
        </Space>
        <Space>
          <Button
            type="text"
            icon={<BulbOutlined />}
            onClick={toggleDarkMode}
            style={useCustomColors ? { color: colors.text } : { color: isDarkMode ? '#fff' : '#000' }}
          />
        </Space>
      </Header>
      <Layout>
        {!isMobile && (
          <Sider
            width={200}
            style={useCustomColors
              ? {
                  background: colors.sidebar,
                  borderRight: `1px solid ${colors.border}`
                }
              : {
                  background: isDarkMode ? '#181818' : '#fff',
                  color: isDarkMode ? '#fff' : '#000',
                  borderRight: isDarkMode ? '1px solid #222' : '1px solid #eee'
                }
            }
          >
            {renderMenu()}
          </Sider>
        )}
        <Layout style={{ padding: isMobile ? '16px' : '24px' }}>
          <Content style={appliedColors ? {
            padding: isMobile ? 16 : 24,
            margin: 0,
            minHeight: 280,
            background: appliedColors.card,
            color: appliedColors.text,
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
            border: `1px solid ${appliedColors.border}`
          } : {
            padding: isMobile ? 16 : 24,
            margin: 0,
            minHeight: 280,
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </Content>
        </Layout>
      </Layout>
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={useCustomColors ? {
            padding: 0,
            background: colors.sidebar,
            color: colors.text
          } : {
            padding: 0,
            background: isDarkMode ? '#181818' : '#fff',
            color: isDarkMode ? '#fff' : '#000'
          }}
          headerStyle={useCustomColors ? {
            background: colors.sidebar,
            color: colors.text,
            borderBottom: `1px solid ${colors.border}`
          } : {
            background: isDarkMode ? '#181818' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
            borderBottom: isDarkMode ? '1px solid #222' : '1px solid #eee'
          }}
        >
          {renderMenu()}
        </Drawer>
      )}
    </Layout>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <AppContent />
      </TodoProvider>
    </ThemeProvider>
  )
}
