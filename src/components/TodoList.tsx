import { useState, useMemo } from 'react'
import { Input, Button, List, Checkbox, Space, Card, Radio, Empty, Tooltip, DatePicker, Tag, Select, Row, Col, Statistic, Dropdown, Menu, Typography, Drawer } from 'antd'
import { DeleteOutlined, SearchOutlined, ClearOutlined, DragOutlined, PlusOutlined, DownOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import type { DropResult } from 'react-beautiful-dnd'
import { useTodo } from '../context/TodoContext'
import AddTodoDrawer from './AddTodoDrawer'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import AdvancedFilters from './AdvancedFilters'
import TaskComments from './TaskComments'

const { Option } = Select
const { Text } = Typography

type FilterType = 'all' | 'active' | 'completed'
type PriorityType = 'low' | 'medium' | 'high'
type SortType = 'priority' | 'dueDate' | 'createdAt' | 'alphabetical'
type SortOrder = 'asc' | 'desc'

const MotionCard = motion(Card)

export default function TodoList() {
  const { 
    todos, 
    categories,
    deleteTodo,
    toggleTodo,
    updateDueDate,
    updateCategory,
    updatePriority,
    addComment,
    assignTodo,
    getFilteredTodos
  } = useTodo()

  const [filter, setFilter] = useState<FilterType>('all')
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<PriorityType | ''>('')
  const [sortBy, setSortBy] = useState<SortType>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedTodos, setSelectedTodos] = useState<Set<number>>(new Set())
  const [editingTodo, setEditingTodo] = useState<number | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    dateRange: null as [Date, Date] | null,
    categories: [] as string[],
    priorities: [] as string[]
  })

  const clearCompleted = () => {
    todos.filter(todo => todo.completed).forEach(todo => deleteTodo(todo.id))
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(todos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update todos order in context
    items.forEach(() => {
      // You might want to add a reorder function to the context
      // For now, we'll just update the local state
    })
  }

  const filteredTodos = getFilteredTodos(filters)

  const handleFilterChange = (newFilters: {
    dateRange: [Date, Date] | null
    categories: string[]
    priorities: string[]
  }) => {
    setFilters(newFilters)
  }

  const handleComment = (todoId: number) => {
    setSelectedTodo(todoId)
  }

  const handleAddComment = (text: string) => {
    if (selectedTodo) {
      addComment(selectedTodo, text, 'Current User') // Replace with actual user
      setSelectedTodo(null)
    }
  }

  const handleAssign = (todoId: number, assignee: string) => {
    assignTodo(todoId, assignee)
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
        // You might want to add a bulk priority update feature
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

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Row gutter={[16, 16]} justify="center">
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setDrawerVisible(true)}
              size="large"
              style={{ width: '200px' }}
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
            <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space wrap>
                <Input
                  placeholder="Search todos..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                  size="large"
                />
                <Select
                  placeholder="Filter by category"
                  value={selectedCategory || undefined}
                  onChange={setSelectedCategory}
                  style={{ width: 150 }}
                  allowClear
                  size="large"
                >
                  {categories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="Priority"
                  value={priorityFilter || undefined}
                  onChange={setPriorityFilter}
                  style={{ width: 120 }}
                  allowClear
                  size="large"
                >
                  <Option value="high">High</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="low">Low</Option>
                </Select>
                <Dropdown overlay={sortMenu}>
                  <Button size="large">
                    Sort by <DownOutlined />
                  </Button>
                </Dropdown>
                <Button
                  icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  size="large"
                />
              </Space>
              <Space>
                {selectedTodos.size > 0 && (
                  <>
                    <Button
                      onClick={() => handleBulkAction('complete')}
                      size="large"
                    >
                      Complete Selected
                    </Button>
                    <Button
                      danger
                      onClick={() => handleBulkAction('delete')}
                      size="large"
                    >
                      Delete Selected
                    </Button>
                  </>
                )}
                <Tooltip title="Clear completed">
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearCompleted}
                    disabled={stats.completed === 0}
                    size="large"
                  />
                </Tooltip>
              </Space>
            </Space>

            <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)} size="large">
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="active">Active</Radio.Button>
              <Radio.Button value="completed">Completed</Radio.Button>
            </Radio.Group>
          </Space>
        </Card>
      </motion.div>

      <AdvancedFilters onFilterChange={handleFilterChange} />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <List
                dataSource={filteredTodos}
                locale={{
                  emptyText: <Empty description="No todos found" />
                }}
                renderItem={(todo, index) => (
                  <Draggable key={todo.id} draggableId={String(todo.id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <List.Item style={{ marginBottom: '16px' }}>
                          <MotionCard 
                            style={{ 
                              width: '100%',
                              borderLeft: todo.priority ? `4px solid ${getPriorityColor(todo.priority)}` : undefined,
                              opacity: selectedTodos.has(todo.id) ? 0.7 : 1
                            }}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                              <Space>
                                <Checkbox
                                  checked={selectedTodos.has(todo.id)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedTodos)
                                    if (e.target.checked) {
                                      newSelected.add(todo.id)
                                    } else {
                                      newSelected.delete(todo.id)
                                    }
                                    setSelectedTodos(newSelected)
                                  }}
                                />
                                <DragOutlined style={{ cursor: 'grab', fontSize: '18px' }} />
                                <Checkbox
                                  checked={todo.completed}
                                  onChange={() => toggleTodo(todo.id)}
                                />
                                <Space direction="vertical" size={0}>
                                  <span style={{ 
                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                    color: todo.completed ? '#999' : 'inherit',
                                    fontSize: '16px'
                                  }}>
                                    {todo.text}
                                  </span>
                                  <Space size={4}>
                                    {todo.category && (
                                      <Tag color="blue">{todo.category}</Tag>
                                    )}
                                    {todo.priority && (
                                      <Tag color={getPriorityColor(todo.priority)}>
                                        {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                                      </Tag>
                                    )}
                                  </Space>
                                </Space>
                              </Space>
                              <Space wrap>
                                <DatePicker
                                  value={todo.dueDate}
                                  onChange={(date) => updateDueDate(todo.id, date)}
                                  placeholder="Due date"
                                  allowClear
                                  size="large"
                                />
                                <Select
                                  value={todo.category}
                                  onChange={(value) => updateCategory(todo.id, value)}
                                  style={{ width: 120 }}
                                  allowClear
                                  size="large"
                                >
                                  {categories.map(category => (
                                    <Option key={category} value={category}>{category}</Option>
                                  ))}
                                </Select>
                                <Select
                                  value={todo.priority}
                                  onChange={(value) => updatePriority(todo.id, value)}
                                  style={{ width: 120 }}
                                  allowClear
                                  size="large"
                                >
                                  <Option value="high">High</Option>
                                  <Option value="medium">Medium</Option>
                                  <Option value="low">Low</Option>
                                </Select>
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => deleteTodo(todo.id)}
                                  size="large"
                                />
                              </Space>
                            </Space>
                          </MotionCard>
                        </List.Item>
                      </div>
                    )}
                  </Draggable>
                )}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AddTodoDrawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      <Drawer
        title="Task Details"
        placement="right"
        onClose={() => setSelectedTodo(null)}
        open={selectedTodo !== null}
        width={400}
      >
        {selectedTodo && (
          <TaskComments
            taskId={selectedTodo}
            comments={todos.find(t => t.id === selectedTodo)?.comments || []}
            activities={todos.find(t => t.id === selectedTodo)?.activities || []}
            onAddComment={handleAddComment}
          />
        )}
      </Drawer>
    </Space>
  )
} 