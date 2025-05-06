import { useState } from 'react'
import { Card, Space, Typography, Tag, Badge, Button, Tooltip } from 'antd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import type { DropResult } from 'react-beautiful-dnd'
import { useTodo } from '../context/TodoContext'
import { motion } from 'framer-motion'
import { PlusOutlined } from '@ant-design/icons'
import AddTodoDrawer from './AddTodoDrawer'

const { Text, Title } = Typography
const MotionCard = motion(Card)

type ColumnType = 'todo' | 'in-progress' | 'completed'

interface Column {
  id: ColumnType
  title: string
  color: string
}

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: '#1890ff' },
  { id: 'in-progress', title: 'In Progress', color: '#faad14' },
  { id: 'completed', title: 'Completed', color: '#52c41a' },
]

export default function KanbanBoard() {
  const { todos, updateTodoStatus } = useTodo()
  const [drawerVisible, setDrawerVisible] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'blue'
    }
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const todoId = parseInt(draggableId)
    const newStatus = destination.droppableId as ColumnType
    updateTodoStatus(todoId, newStatus)
  }

  const getColumnTodos = (columnId: ColumnType) => {
    return todos.filter(todo => {
      if (columnId === 'completed') return todo.completed
      if (columnId === 'in-progress') return !todo.completed && todo.status === 'in-progress'
      return !todo.completed && (!todo.status || todo.status === 'todo')
    })
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>Kanban Board</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
          Add Task
        </Button>
      </Space>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '8px 0' }}>
          {COLUMNS.map(column => (
            <div
              key={column.id}
              style={{
                minWidth: '300px',
                width: '300px',
                backgroundColor: '#f0f2f5',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: '16px' }}>{column.title}</Text>
                  <Badge
                    count={getColumnTodos(column.id).length}
                    style={{ backgroundColor: column.color }}
                  />
                </Space>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: '500px' }}
                    >
                      {getColumnTodos(column.id).map((todo, index) => (
                        <Draggable
                          key={todo.id}
                          draggableId={String(todo.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <MotionCard
                                style={{
                                  marginBottom: '8px',
                                  borderLeft: `4px solid ${column.color}`,
                                }}
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  <Text strong>{todo.text}</Text>
                                  <Space wrap>
                                    {todo.priority && (
                                      <Tag color={getPriorityColor(todo.priority)}>
                                        {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                                      </Tag>
                                    )}
                                    {todo.category && (
                                      <Tag color="blue">{todo.category}</Tag>
                                    )}
                                    {todo.dueDate && (
                                      <Tooltip title="Due Date">
                                        <Tag color="purple">
                                          {todo.dueDate.format('MMM D')}
                                        </Tag>
                                      </Tooltip>
                                    )}
                                  </Space>
                                </Space>
                              </MotionCard>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Space>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AddTodoDrawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </Space>
  )
} 