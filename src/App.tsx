import { useEffect, useState } from 'react'
import { Layout, Menu, Button, Space } from 'antd'
import { BulbOutlined, DashboardOutlined, CheckSquareOutlined, SettingOutlined, BarChartOutlined, FolderOutlined, ClockCircleOutlined } from '@ant-design/icons'
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

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
            }
          : {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDarkMode ? '#181818' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
              borderBottom: isDarkMode ? '1px solid #222' : '1px solid #eee',
            }
        }
      >
        <h1
          style={useCustomColors
            ? { margin: 0, color: colors.text, fontSize: '1.5rem' }
            : { margin: 0, color: isDarkMode ? '#fff' : '#000', fontSize: '1.5rem' }
          }
        >
          Todo App
        </h1>
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
            items={[
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
            ]}
            onClick={({ key }) => setSelectedKey(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={appliedColors ? {
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: appliedColors.card,
            color: appliedColors.text,
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
            border: `1px solid ${appliedColors.border}`
          } : {
            padding: 24,
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
