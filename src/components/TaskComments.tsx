import { useState } from 'react'
import { Card, Input, Button, List, Typography, Space, Avatar } from 'antd'
import { SendOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, TagOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useTodo } from '../context/TodoContext'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Text } = Typography

interface Comment {
  id: string
  text: string
  author: string
  timestamp: Date
}

interface Activity {
  id: string
  type: 'status_change' | 'priority_change' | 'category_change' | 'assignment_change'
  description: string
  timestamp: Date
  user: string
}

interface TaskCommentsProps {
  taskId: string
  comments: Comment[]
  activities: Activity[]
  onAddComment: (text: string) => void
}

const MotionCard = motion(Card)

export default function TaskComments({ taskId, comments, activities, onAddComment }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const { todos } = useTodo()
  const todo = todos.find(t => t.id === taskId)

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment('')
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'status_change':
        return <CheckCircleOutlined style={{ color: '#1890ff' }} />
      case 'priority_change':
        return <TagOutlined style={{ color: '#faad14' }} />
      case 'category_change':
        return <TagOutlined style={{ color: '#52c41a' }} />
      case 'assignment_change':
        return <UserSwitchOutlined style={{ color: '#722ed1' }} />
      default:
        return <ClockCircleOutlined />
    }
  }

  const formatAuthor = (author: string) => {
    return author === 'Profile' ? 'Profile' : author
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <TextArea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </Space>
      </MotionCard>

      <MotionCard
        title="Comments"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <List
          dataSource={comments}
          renderItem={comment => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <Text strong>{formatAuthor(comment.author)}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {dayjs(comment.timestamp).format('MMM D, YYYY h:mm A')}
                    </Text>
                  </Space>
                }
                description={comment.text}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No comments yet' }}
        />
      </MotionCard>

      <MotionCard
        title="Activity History"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <List
          dataSource={activities}
          renderItem={activity => (
            <List.Item>
              <List.Item.Meta
                avatar={getActivityIcon(activity.type)}
                title={
                  <Space>
                    <Text strong>{formatAuthor(activity.user)}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {dayjs(activity.timestamp).format('MMM D, YYYY h:mm A')}
                    </Text>
                  </Space>
                }
                description={activity.description}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No activity yet' }}
        />
      </MotionCard>
    </Space>
  )
} 