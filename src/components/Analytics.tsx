import { Card, Row, Col, Statistic, Progress, List, Typography } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { useTodo } from '../context/TodoContext'

const { Title } = Typography

export default function Analytics() {
  const { todos } = useTodo()

  const totalTodos = todos.length
  const completedTodos = todos.filter(todo => todo.completed).length
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const categoryStats = todos.reduce((acc, todo) => {
    const category = todo.category || 'Uncategorized'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <Title level={2}>Analytics</Title>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Todos"
              value={totalTodos}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completed Todos"
              value={completedTodos}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={completionRate}
              precision={1}
              suffix="%"
              prefix={<Progress type="circle" percent={completionRate} size={20} />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Category Distribution</Title>
        <List
          dataSource={Object.entries(categoryStats)}
          renderItem={([category, count]) => (
            <List.Item>
              <Typography.Text>{category}</Typography.Text>
              <Progress
                percent={Math.round((count / totalTodos) * 100)}
                size="small"
                style={{ width: 200 }}
              />
              <Typography.Text type="secondary">{count} todos</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
} 