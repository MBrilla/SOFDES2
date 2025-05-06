import { useState } from 'react'
import { Card, Input, Button, List, Avatar, Space, Typography, Divider } from 'antd'
import { SendOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { TextArea } = Input
const { Text } = Typography
const MotionCard = motion(Card)

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
  taskId: number
  comments: Comment[]
  activities: Activity[]
  onAddComment: (text: string) => void
}

export default function TaskComments({ comments, activities, onAddComment }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment('')
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'status_change':
        return '🔄'
      case 'priority_change':
        return '⭐'
      case 'category_change':
        return '🏷️'
      case 'assignment_change':
        return '👤'
      default:
        return '📝'
    }
  }

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text strong style={{ fontSize: '16px' }}>Comments</Text>
          <List
            dataSource={comments}
            renderItem={comment => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Text strong>{comment.author}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(comment.timestamp).fromNow()}
                      </Text>
                    </Space>
                  }
                  description={comment.text}
                />
              </List.Item>
            )}
          />
          <Space.Compact style={{ width: '100%', marginTop: '16px' }}>
            <TextArea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              onPressEnter={e => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              disabled={!newComment.trim()}
            />
          </Space.Compact>
        </div>

        <Divider />

        <div>
          <Text strong style={{ fontSize: '16px' }}>Activity History</Text>
          <List
            dataSource={activities}
            renderItem={activity => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#f0f2f5' }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text>{activity.description}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        by {activity.user}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space>
                      <ClockCircleOutlined />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(activity.timestamp).fromNow()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Space>
    </MotionCard>
  )
} 