import { useState } from 'react'
import { Card, Typography, Space, ColorPicker, Collapse } from 'antd'
import { motion } from 'framer-motion'
import { CheckOutlined} from '@ant-design/icons'

const { Title, Text } = Typography
const MotionCard = motion(Card)
const { Panel } = Collapse

interface ColorPalette {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    navbar: string
    sidebar: string
    card: string
    border: string
    accent: string
  }
}

const PREDEFINED_PALETTES: ColorPalette[] = [
  {
    name: 'Ocean',
    colors: {
      primary: '#1890ff',
      secondary: '#13c2c2',
      background: '#f0f5ff',
      text: '#000000',
      navbar: '#1890ff',
      sidebar: '#13c2c2',
      card: '#ffffff',
      border: '#d9d9d9',
      accent: '#40a9ff'
    }
  },
  {
    name: 'Forest',
    colors: {
      primary: '#52c41a',
      secondary: '#389e0d',
      background: '#f6ffed',
      text: '#000000',
      navbar: '#52c41a',
      sidebar: '#389e0d',
      card: '#ffffff',
      border: '#d9d9d9',
      accent: '#73d13d'
    }
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#fa8c16',
      secondary: '#f5222d',
      background: '#fff7e6',
      text: '#000000',
      navbar: '#fa8c16',
      sidebar: '#f5222d',
      card: '#ffffff',
      border: '#d9d9d9',
      accent: '#ffa940'
    }
  },
  {
    name: 'Royal',
    colors: {
      primary: '#722ed1',
      secondary: '#531dab',
      background: '#f9f0ff',
      text: '#000000',
      navbar: '#722ed1',
      sidebar: '#531dab',
      card: '#ffffff',
      border: '#d9d9d9',
      accent: '#9254de'
    }
  },
  {
    name: 'Midnight',
    colors: {
      primary: '#141414',
      secondary: '#434343',
      background: '#000000',
      text: '#ffffff',
      navbar: '#141414',
      sidebar: '#434343',
      card: '#1f1f1f',
      border: '#303030',
      accent: '#595959'
    }
  }
]

interface ColorCustomizerProps {
  onColorChange: (colors: ColorPalette['colors']) => void
  currentColors: ColorPalette['colors']
}

export function ColorCustomizer({ onColorChange, currentColors }: ColorCustomizerProps) {
  const [selectedPalette, setSelectedPalette] = useState<string>('custom')
  const [customColors, setCustomColors] = useState<ColorPalette['colors']>(currentColors)

  const handlePaletteSelect = (paletteName: string) => {
    setSelectedPalette(paletteName)
    if (paletteName !== 'custom') {
      const palette = PREDEFINED_PALETTES.find(p => p.name === paletteName)
      if (palette) {
        setCustomColors(palette.colors)
        onColorChange(palette.colors)
      }
    }
  }

  const handleCustomColorChange = (colorType: keyof ColorPalette['colors'], value: string) => {
    const newColors = { ...customColors, [colorType]: value }
    setCustomColors(newColors)
    onColorChange(newColors)
  }

  const renderColorPicker = (label: string, colorKey: keyof ColorPalette['colors']) => (
    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
      <Text>{label}</Text>
      <ColorPicker
        value={customColors[colorKey]}
        onChange={(color) => handleCustomColorChange(colorKey, color.toHexString())}
      />
    </Space>
  )

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={3}>Color Customization</Title>

      <Card title="Predefined Palettes">
        <Space wrap>
          {PREDEFINED_PALETTES.map((palette) => (
            <MotionCard
              key={palette.name}
              hoverable
              style={{
                width: 200,
                border: selectedPalette === palette.name ? '2px solid #1890ff' : '1px solid #d9d9d9',
                cursor: 'pointer'
              }}
              onClick={() => handlePaletteSelect(palette.name)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>{palette.name}</Text>
                <Space wrap>
                  {Object.entries(palette.colors).map(([key, color]) => (
                    <div
                      key={key}
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: color,
                        borderRadius: 4,
                        border: '1px solid #d9d9d9'
                      }}
                      title={`${key}: ${color}`}
                    />
                  ))}
                </Space>
                {selectedPalette === palette.name && (
                  <CheckOutlined style={{ color: '#1890ff', position: 'absolute', top: 8, right: 8 }} />
                )}
              </Space>
            </MotionCard>
          ))}
        </Space>
      </Card>

      <Collapse defaultActiveKey={['1']}>
        <Panel header="Main Colors" key="1">
          <Space direction="vertical" style={{ width: '100%' }}>
            {renderColorPicker('Primary Color', 'primary')}
            {renderColorPicker('Secondary Color', 'secondary')}
            {renderColorPicker('Background Color', 'background')}
            {renderColorPicker('Text Color', 'text')}
          </Space>
        </Panel>
        <Panel header="UI Elements" key="2">
          <Space direction="vertical" style={{ width: '100%' }}>
            {renderColorPicker('Navbar Color', 'navbar')}
            {renderColorPicker('Sidebar Color', 'sidebar')}
            {renderColorPicker('Card Background', 'card')}
            {renderColorPicker('Border Color', 'border')}
            {renderColorPicker('Accent Color', 'accent')}
          </Space>
        </Panel>
      </Collapse>

      <Card title="Preview">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div
            style={{
              padding: 16,
              backgroundColor: customColors.background,
              borderRadius: 8,
              border: `1px solid ${customColors.border}`
            }}
          >
            <div
              style={{
                padding: 16,
                backgroundColor: customColors.navbar,
                color: customColors.text,
                borderRadius: 4,
                marginBottom: 8
              }}
            >
              Navbar Preview
            </div>
            <div
              style={{
                display: 'flex',
                gap: 16
              }}
            >
              <div
                style={{
                  width: 200,
                  padding: 16,
                  backgroundColor: customColors.sidebar,
                  color: customColors.text,
                  borderRadius: 4
                }}
              >
                Sidebar Preview
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: customColors.card,
                  color: customColors.text,
                  borderRadius: 4,
                  border: `1px solid ${customColors.border}`
                }}
              >
                <div style={{ color: customColors.accent, marginBottom: 8 }}>Accent Text</div>
                <div>Content Area</div>
              </div>
            </div>
          </div>
        </Space>
      </Card>
    </Space>
  )
} 