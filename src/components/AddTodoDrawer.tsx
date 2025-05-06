import { Drawer, Form, Input, Button, DatePicker, Select, ColorPicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { useTodo } from '../context/TodoContext'

const { TextArea } = Input

interface AddTodoDrawerProps {
  open: boolean
  onClose: () => void
}

const DEFAULT_COLORS = [
  '#1890ff', // blue
  '#52c41a', // green
  '#faad14', // yellow
  '#f5222d', // red
  '#722ed1', // purple
  '#13c2c2', // cyan
  '#eb2f96', // pink
  '#fa8c16', // orange
]

export default function AddTodoDrawer({ open, onClose }: AddTodoDrawerProps) {
  const { addTodo, categories } = useTodo()
  const [form] = Form.useForm()

  const handleSubmit = (values: {
    text: string
    description?: string
    category?: string
    startDate?: Dayjs
    dueDate?: Dayjs
    priority?: 'low' | 'medium' | 'high'
    color?: string
  }) => {
    addTodo(
      values.text,
      values.category,
      values.startDate,
      values.dueDate,
      values.priority,
      values.color
    )
    form.resetFields()
    onClose()
  }

 

  return (
    <Drawer
      title="Add New Todo"
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      extra={
        <Button type="primary" onClick={() => form.submit()}>
          Add Todo
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ 
          category: undefined,
          color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
        }}
      >
        <Form.Item
          name="text"
          label="Todo Text"
          rules={[{ required: true, message: 'Please enter todo text' }]}
        >
          <Input placeholder="What needs to be done?" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            placeholder="Add more details..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
        >
          <Select
            placeholder="Select a category"
            allowClear
          >
            {categories.map(category => (
              <Select.Option key={category.id} value={category.name}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
        >
          <Select
            placeholder="Select priority"
            allowClear
          >
            <Select.Option value="high">High</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="low">Low</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="color"
          label="Color"
        >
          <ColorPicker
            presets={[
              {
                label: 'Recommended',
                colors: DEFAULT_COLORS,
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Select start date"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Due Date"
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Select due date"
            allowClear
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            block
          >
            Add Todo
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
} 