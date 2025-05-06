import { useMemo, useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Space, Typography } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, FireOutlined } from '@ant-design/icons'
import { useTodo } from '../context/TodoContext'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import { supabase } from '../supabaseClient'

const { Title } = Typography
const MotionCard = motion(Card)

export default function Dashboard() {
  const { todos } = useTodo()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      setUserName(user?.user_metadata?.full_name || user?.email || user?.id || null)
    })
  }, [])

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter(todo => todo.completed).length
    const active = total - completed
    const highPriority = todos.filter(todo => todo.priority === 'high').length
    const dueToday = todos.filter(todo => {
      if (!todo.dueDate) return false
      return dayjs(todo.dueDate).isSame(dayjs(), 'day')
    }).length

    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)
    const highPriorityRate = total === 0 ? 0 : Math.round((highPriority / total) * 100)

    return {
      total,
      completed,
      active,
      highPriority,
      dueToday,
      completionRate,
      highPriorityRate
    }
  }, [todos])

  // Sort todos by priority: high > medium > low
  const priorityOrder = { high: 1, medium: 2, low: 3 }
  const sortedTodos = [...todos].sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'low']
    const bPriority = priorityOrder[b.priority || 'low']
    return aPriority - bPriority
  })
  const topTodos = sortedTodos.slice(0, 5)

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        {userName ? `Welcome, ${userName}` : 'Welcome'}
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Statistic title="Total Tasks" value={stats.total} />
          </MotionCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Statistic title="Active Tasks" value={stats.active} />
          </MotionCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Statistic title="High Priority" value={stats.highPriority} />
          </MotionCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Statistic title="Due Today" value={stats.dueToday} />
          </MotionCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Title level={4}>Completion Rate</Title>
            <Progress
              type="circle"
              percent={stats.completionRate}
              format={percent => `${percent}%`}
              status={stats.completionRate === 100 ? 'success' : 'active'}
            />
          </MotionCard>
        </Col>
        <Col xs={24} md={12}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Title level={4}>High Priority Tasks</Title>
            <Progress
              type="circle"
              percent={stats.highPriorityRate}
              format={percent => `${percent}%`}
              status="exception"
            />
          </MotionCard>
        </Col>
      </Row>

      <Card title="Top 5 Priority Tasks" style={{ marginTop: 24 }}>
        {topTodos.length === 0 ? (
          <Typography.Text type="secondary">No tasks available.</Typography.Text>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {topTodos.map(todo => (
              <li key={todo.id} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{todo.text}</span>
                {todo.priority && (
                  <span style={{
                    marginLeft: 8,
                    color:
                      todo.priority === 'high' ? '#f5222d' :
                      todo.priority === 'medium' ? '#faad14' : '#52c41a',
                    fontWeight: 500
                  }}>
                    [{todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}]
                  </span>
                )}
                {todo.dueDate && (
                  <span style={{ marginLeft: 8, color: '#888' }}>
                    Due: {dayjs(todo.dueDate).format('MMM D, YYYY')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Space>
  )
} 