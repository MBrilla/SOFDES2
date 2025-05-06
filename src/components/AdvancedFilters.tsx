import { Card, Space, DatePicker, Select, Button } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

interface AdvancedFiltersProps {
  onFilter: (filters: {
    dateRange: [Dayjs | null, Dayjs | null] | null
    priority: string | null
  }) => void
}

export default function AdvancedFilters({ onFilter }: AdvancedFiltersProps) {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [priority, setPriority] = useState<string | null>(null)

  const handleFilter = () => {
    onFilter({ dateRange, priority })
  }

  const handleClear = () => {
    setDateRange(null)
    setPriority(null)
    onFilter({ dateRange: null, priority: null })
  }

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (!dates) {
                setDateRange(null)
                return
              }
              setDateRange([dates[0], dates[1]])
            }}
          />
          <Select
            placeholder="Priority"
            allowClear
            style={{ width: 120 }}
            value={priority}
            onChange={setPriority}
          >
            <Select.Option value="high">High</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="low">Low</Select.Option>
          </Select>
          <Button type="primary" icon={<FilterOutlined />} onClick={handleFilter}>
            Apply Filters
          </Button>
          <Button onClick={handleClear}>Clear</Button>
        </Space>
      </Space>
    </Card>
  )
} 