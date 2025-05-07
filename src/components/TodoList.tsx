import { useState, useMemo, useEffect } from 'react'
import { Input, Button, List, Checkbox, Space, Card, Radio, Empty, DatePicker, Tag, Select, Row, Col, Statistic, Dropdown, Menu, Typography, Drawer, theme, Form } from 'antd'
import { DeleteOutlined, SearchOutlined, PlusOutlined, DownOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined, CommentOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import type { DropResult } from 'react-beautiful-dnd'
import { useTodo } from '../context/TodoContext'
import AddTodoDrawer from './AddTodoDrawer'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import TaskComments from './TaskComments'
import { useTheme } from '../context/ThemeContext'
import type { Todo } from '../context/TodoContext'

const { Option } = Select
const { Text } = Typography
const { useToken } = theme
const { TextArea } = Input

type FilterType = 'all' | 'active' | 'completed'
type PriorityType = 'low' | 'medium' | 'high'
type SortType = 'priority' | 'dueDate' | 'createdAt' | 'alphabetical'
type SortOrder = 'asc' | 'desc'

const MotionCard = motion(Card)

interface EditFormValues {
  text: string
  description?: string
  category?: string
  priority?: PriorityType
  dueDate?: dayjs.Dayjs
}

interface TodoWithCreatedAt extends Todo {
  created_at?: string;
}

export default function TodoList() {
  const { 
    todos, 
    categories,
    deleteTodo,
    toggleTodo,
    updateTodo,
    addComment
  } = useTodo()
  const { isDarkMode } = useTheme()
  const { token } = useToken()
  const [form] = Form.useForm<EditFormValues>()

  const [filter, setFilter] = useState<FilterType>('all')
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [sortBy, setSortBy] = useState<SortType>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set())
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(dayjs().format('hh:mm:ss A'))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('hh:mm:ss A'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(todos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
  }

  const visibleTodos = useMemo(() => {
    let result = [...(todos as TodoWithCreatedAt[])]

    if (searchText.trim()) {
      result = result.filter(todo =>
        todo.text.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    if (selectedCategory) {
      result = result.filter(todo => todo.category === selectedCategory)
    }

    if (filter === 'active') {
      result = result.filter(todo => !todo.completed)
    } else if (filter === 'completed') {
      result = result.filter(todo => todo.completed)
    }

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { high: 1, medium: 2, low: 3 }
        return (order[a.priority || 'low'] - order[b.priority || 'low']) * (sortOrder === 'asc' ? 1 : -1)
      }
      if (sortBy === 'dueDate') {
        const aDate = a.dueDate ? dayjs(a.dueDate) : dayjs(0)
        const bDate = b.dueDate ? dayjs(b.dueDate) : dayjs(0)
        return (aDate.isAfter(bDate) ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1)
      }
      if (sortBy === 'alphabetical') {
        return (a.text.localeCompare(b.text)) * (sortOrder === 'asc' ? 1 : -1)
      }
      if (sortBy === 'createdAt') {
        const aDate = a.created_at ? dayjs(a.created_at) : dayjs(0)
        const bDate = b.created_at ? dayjs(b.created_at) : dayjs(0)
        return (aDate.isAfter(bDate) ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1)
      }
      return 0
    })

    return result
  }, [todos, searchText, selectedCategory, filter, sortBy, sortOrder])

  const handleComment = (todoId: string) => {
    setSelectedTodo(todoId)
  }

  const handleAddComment = (text: string) => {
    if (selectedTodo) {
      addComment(selectedTodo, text)
      setSelectedTodo(null)
    }
  }

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter(todo => todo.completed).length
    const active = total - completed
    const highPriority = todos.filter(todo => todo.priority === 'high').length
    const dueToday = todos.filter(todo => {
      if (!todo.dueDate) return false
      const today = dayjs()
      return todo.dueDate.isSame(today, 'day')
    }).length

    return { total, completed, active, highPriority, dueToday }
  }, [todos])

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'blue'
    }
  }

  const handleBulkAction = (action: 'complete' | 'delete' | 'priority') => {
    if (selectedTodos.size === 0) return

    switch (action) {
      case 'complete':
        selectedTodos.forEach(id => {
          const todo = todos.find(t => t.id === id)
          if (todo && !todo.completed) {
            toggleTodo(id)
          }
        })
        break
      case 'delete':
        selectedTodos.forEach(id => deleteTodo(id))
        break
      case 'priority':
        break
    }
    setSelectedTodos(new Set())
  }

  const sortMenu = (
    <Menu>
      <Menu.Item key="priority" onClick={() => setSortBy('priority')}>
        Priority
      </Menu.Item>
      <Menu.Item key="dueDate" onClick={() => setSortBy('dueDate')}>
        Due Date
      </Menu.Item>
      <Menu.Item key="alphabetical" onClick={() => setSortBy('alphabetical')}>
        Alphabetical
      </Menu.Item>
      <Menu.Item key="createdAt" onClick={() => setSortBy('createdAt')}>
        Created Date
      </Menu.Item>
    </Menu>
  )

  const handleEdit = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId)
    if (todo) {
      setEditingTodo(todoId)
      form.setFieldsValue({
        text: todo.text,
        description: todo.description,
        category: todo.category,
        priority: todo.priority,
        dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined
      })
    }
  }

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields()
      if (editingTodo) {
        updateTodo(editingTodo, {
          ...values,
          dueDate: values.dueDate
        })
        setEditingTodo(null)
        form.resetFields()
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingTodo(null)
    form.resetFields()
  }

  const renderEditForm = (todo: any) => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        text: todo.text,
        description: todo.description,
        category: todo.category,
        priority: todo.priority,
        dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined
      }}
    >
      <Form.Item
        name="text"
        rules={[{ required: true, message: 'Please enter task text' }]}
      >
        <Input placeholder="Task text" />
      </Form.Item>
      <Form.Item name="description">
        <TextArea
          placeholder="Add description"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="category">
            <Select placeholder="Category" allowClear>
              {categories.map(category => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="priority">
            <Select placeholder="Priority" allowClear>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="dueDate">
        <DatePicker
          style={{ width: '100%' }}
          placeholder="Due date"
          allowClear
        />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveEdit}
          >
            Save
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ textAlign: 'right', marginBottom: 16, fontWeight: 'bold', fontSize: 18 }}>
        Current Time: {currentTime}
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setDrawerVisible(true)}
              size="large"
              block
            >
              Add Todo
            </Button>
          </Col>
        </Row>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Search todos..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Filter by category"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  allowClear
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.name}>{category.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Radio.Group value={filter} onChange={e => setFilter(e.target.value)}>
                  <Radio.Button value="all">All</Radio.Button>
                  <Radio.Button value="active">Active</Radio.Button>
                  <Radio.Button value="completed">Completed</Radio.Button>
                </Radio.Group>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space>
                  <Dropdown overlay={sortMenu}>
                    <Button>
                      Sort by <DownOutlined />
                    </Button>
                  </Dropdown>
                  <Button
                    icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  />
                </Space>
              </Col>
            </Row>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {visibleTodos.length === 0 ? (
                      <Empty description="No todos found" />
                    ) : (
                      <List
                        dataSource={visibleTodos}
                        renderItem={(todo, index) => (
                          <Draggable key={todo.id} draggableId={todo.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Card
                                  style={{
                                    marginBottom: 16,
                                    backgroundColor: todo.completed 
                                      ? (isDarkMode ? token.colorBgContainerDisabled : '#f5f5f5')
                                      : (isDarkMode ? token.colorBgContainer : 'white')
                                  }}
                                >
                                  {editingTodo === todo.id ? (
                                    renderEditForm(todo)
                                  ) : (
                                    <Row gutter={[16, 16]} align="middle">
                                      <Col xs={24} sm={24} md={2}>
                                        <Checkbox
                                          checked={todo.completed}
                                          onChange={() => toggleTodo(todo.id)}
                                        />
                                      </Col>
                                      <Col xs={24} sm={24} md={14}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                          <Text delete={todo.completed}>{todo.text}</Text>
                                          {todo.description && (
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                              {todo.description}
                                            </Text>
                                          )}
                                          {todo.startDate && (
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                              Start: {dayjs(todo.startDate).format('MMM D, YYYY h:mm A')}
                                            </Text>
                                          )}
                                          {todo.dueDate && (
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                              Due: {dayjs(todo.dueDate).format('MMM D, YYYY h:mm A')}
                                            </Text>
                                          )}
                                          <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Created: {todo.created_at ? dayjs(todo.created_at).format('MMM D, YYYY h:mm A') : 'N/A'}
                                          </Text>
                                          <Space wrap>
                                            {todo.category && (
                                              <Tag color="blue">{todo.category}</Tag>
                                            )}
                                            {todo.priority && (
                                              <Tag color={getPriorityColor(todo.priority)}>
                                                {todo.priority}
                                              </Tag>
                                            )}
                                          </Space>
                                        </Space>
                                      </Col>
                                      <Col xs={24} sm={24} md={8}>
                                        <Space wrap>
                                          <Button
                                            type="text"
                                            icon={<CommentOutlined />}
                                            onClick={() => handleComment(todo.id)}
                                          />
                                          <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEdit(todo.id)}
                                          />
                                          <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteTodo(todo.id)}
                                          />
                                        </Space>
                                      </Col>
                                    </Row>
                                  )}
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        )}
                      />
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Space>
        </Card>
      </motion.div>

      <AddTodoDrawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      <Drawer
        title="Comments"
        placement="right"
        onClose={() => setSelectedTodo(null)}
        open={selectedTodo !== null}
        width={window.innerWidth <= 768 ? '100%' : 400}
      >
        {selectedTodo && (
          <TaskComments
            taskId={selectedTodo.toString()}
            comments={todos.find(t => t.id === selectedTodo)?.comments || []}
            activities={todos.find(t => t.id === selectedTodo)?.activities || []}
            onAddComment={handleAddComment}
          />
        )}
      </Drawer>
    </Space>
  )
} 