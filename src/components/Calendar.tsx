import { useState } from 'react'
import { Calendar, Badge, Card, List, Tag, Space, Typography, Tooltip, Row, Col } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useTodo } from '../context/TodoContext'
import { motion } from 'framer-motion'
import type { CalendarProps } from 'antd'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const { Text, Title } = Typography
const MotionCard = motion(Card)

type PriorityType = 'low' | 'medium' | 'high'

export default function CalendarView() {
  const { todos } = useTodo()
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'blue'
    }
  }

  const getDateListData = (value: Dayjs) => {
    return todos.filter(todo => {
      if (!todo.startDate && !todo.dueDate) return false
      
      const start = todo.startDate ? dayjs(todo.startDate) : null
      const due = todo.dueDate ? dayjs(todo.dueDate) : null
      
      if (!start && !due) return false
      
      // If only start date exists
      if (start && !due) {
        return start.isSame(value, 'day')
      }
      
      // If only due date exists
      if (!start && due) {
        return due.isSame(value, 'day')
      }
      
      // If both dates exist, check if the value is between them
      if (start && due) {
        return value.isSameOrAfter(start, 'day') && value.isSameOrBefore(due, 'day')
      }
      
      return false
    })
  }

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type !== 'date') return null
    
    const todosForDay = todos.filter(todo => {
      const dueDate = todo.dueDate
      return dueDate && dueDate.isSame(current, 'day')
    })

    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todosForDay.map(todo => (
          <li key={todo.id}>
            <Badge
              status={todo.completed ? 'success' : 'processing'}
              text={todo.text}
            />
          </li>
        ))}
      </ul>
    )
  }

  const getTimelineItems = () => {
    const currentMonth = selectedDate.month()
    const currentYear = selectedDate.year()
    
    return todos
      .filter(todo => {
        if (!todo.startDate && !todo.dueDate) return false
        
        const start = todo.startDate ? dayjs(todo.startDate) : null
        const due = todo.dueDate ? dayjs(todo.dueDate) : null
        
        if (!start && !due) return false
        
        // Check if either date falls within the current month
        return (
          (start && start.month() === currentMonth && start.year() === currentYear) ||
          (due && due.month() === currentMonth && due.year() === currentYear)
        )
      })
      .sort((a, b) => {
        const aStart = a.startDate ? dayjs(a.startDate) : null
        const bStart = b.startDate ? dayjs(b.startDate) : null
        
        if (!aStart && !bStart) return 0
        if (!aStart) return 1
        if (!bStart) return -1
        
        return aStart.valueOf() - bStart.valueOf()
      })
  }

  const renderTimeline = () => {
    const timelineItems = getTimelineItems()
    
    return (
      <List
        dataSource={timelineItems}
        renderItem={(todo) => {
          const start = todo.startDate ? dayjs(todo.startDate) : null
          const due = todo.dueDate ? dayjs(todo.dueDate) : null
          
          if (!start && !due) return null
          
          const startDay = start ? start.date() : null
          const dueDay = due ? due.date() : null
          
          return (
            <MotionCard
              key={todo.id}
              style={{ marginBottom: 16 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Text strong>{todo.text}</Text>
                  {todo.priority && (
                    <Tag color={getPriorityColor(todo.priority)}>
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                    </Tag>
                  )}
                </Space>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 0'
                }}>
                  {startDay && (
                    <Badge
                      count={startDay}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  )}
                  <div style={{ 
                    flex: 1,
                    height: 2,
                    background: `linear-gradient(to right, 
                      ${startDay ? '#1890ff' : '#d9d9d9'} 0%, 
                      ${dueDay ? '#1890ff' : '#d9d9d9'} 100%)`
                  }} />
                  {dueDay && (
                    <Badge
                      count={dueDay}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  )}
                </div>
                <Space>
                  {todo.category && (
                    <Tag color="blue">{todo.category}</Tag>
                  )}
                  {todo.completed && (
                    <Tag color="success">Completed</Tag>
                  )}
                </Space>
              </Space>
            </MotionCard>
          )
        }}
      />
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Calendar View</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              cellRender={cellRender}
              mode="month"
            />
          </MotionCard>
        </Col>
        
        <Col xs={24} md={8}>
          <MotionCard
            title={`Timeline - ${selectedDate.format('MMMM YYYY')}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {renderTimeline()}
          </MotionCard>
        </Col>
      </Row>
    </Space>
  )
} 