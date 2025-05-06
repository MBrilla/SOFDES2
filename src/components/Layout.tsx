import { useState } from 'react'
import { Layout, Menu, Button, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  TagsOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const menuItems = [
    {
      key: '/',
      icon: <CheckSquareOutlined />,
      label: 'Todo List',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: 'Categories',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={0}
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true)
          }
        }}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? '14px' : '18px',
          fontWeight: 'bold',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {collapsed ? 'TL' : 'T-LIST'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 24
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Add user profile, notifications, etc. here */}
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
} 