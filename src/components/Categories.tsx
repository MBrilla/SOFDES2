import { useState } from 'react'
import { Card, Input, Button, Space, List, Typography, Popconfirm, message } from 'antd'
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useTodo } from '../context/TodoContext'
import type { Category } from '../types'

const { Title } = Typography

export default function Categories() {
  const { categories, addCategory, deleteCategory, updateCategoryName } = useTodo()
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      message.error('Category name cannot be empty')
      return
    }
    await addCategory(newCategory.trim())
    setNewCategory('')
  }

  const handleUpdateCategory = async (id: string) => {
    if (!editName.trim()) {
      message.error('Category name cannot be empty')
      return
    }
    await updateCategoryName(id, editName.trim())
    setEditingId(null)
    setEditName('')
  }

  const startEditing = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Categories</Title>
        
        <Space>
          <Input
            placeholder="New Category"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onPressEnter={handleAddCategory}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleAddCategory}>
            Add Category
          </Button>
        </Space>

        <List
          dataSource={categories}
          renderItem={category => (
            <List.Item
              actions={[
                editingId === category.id ? (
                  <Space>
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      onClick={() => handleUpdateCategory(category.id)}
                    />
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setEditingId(null)
                        setEditName('')
                      }}
                    />
                  </Space>
                ) : (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => startEditing(category)}
                  />
                ),
                <Popconfirm
                  title="Delete this category?"
                  onConfirm={() => deleteCategory(category.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              {editingId === category.id ? (
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onPressEnter={() => handleUpdateCategory(category.id)}
                  style={{ width: 200 }}
                />
              ) : (
                <Typography.Text>{category.name}</Typography.Text>
              )}
            </List.Item>
          )}
        />
      </Space>
    </Card>
  )
} 