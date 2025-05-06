import { useState, useCallback } from 'react'
import { Card, Typography, Space, Alert, Progress, List, Tag } from 'antd'
import { InboxOutlined, FileOutlined, LoadingOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import JSZip from 'jszip'
import type { UploadFile } from 'antd/es/upload/interface'

const { Title, Text } = Typography
const MotionCard = motion(Card)

interface FileCategory {
  name: string
  extensions: string[]
  color: string
}

const FILE_CATEGORIES: FileCategory[] = [
  {
    name: 'images',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
    color: '#1890ff'
  },
  {
    name: 'documents',
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    color: '#52c41a'
  },
  {
    name: 'audio',
    extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
    color: '#722ed1'
  },
  {
    name: 'video',
    extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv'],
    color: '#eb2f96'
  },
  {
    name: 'archives',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz'],
    color: '#fa8c16'
  },
  {
    name: 'code',
    extensions: ['js', 'html', 'css', 'py', 'java', 'cpp', 'php'],
    color: '#13c2c2'
  }
]

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export function FileOrganizer() {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizedFiles, setOrganizedFiles] = useState<Record<string, File[]>>({})
  const [progress, setProgress] = useState(0)

  const preventDefaults = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    preventDefaults(e)
    setIsDragging(true)
  }, [preventDefaults])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    preventDefaults(e)
    setIsDragging(false)
  }, [preventDefaults])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    preventDefaults(e)
    setIsDragging(false)
    setError(null)
    setProgress(0)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) {
      setError('No files were dropped. Please try again.')
      return
    }

    // Validate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_FILE_SIZE) {
      setError('Total file size exceeds 100MB limit')
      return
    }

    setIsProcessing(true)
    try {
      const organized = await organizeFiles(files)
      setOrganizedFiles(organized)
      await createAndDownloadZip(organized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while organizing files')
    } finally {
      setIsProcessing(false)
    }
  }, [preventDefaults])

  const organizeFiles = async (files: File[]): Promise<Record<string, File[]>> => {
    const organized: Record<string, File[]> = {}
    let processed = 0

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      let category = 'others'

      for (const { name, extensions } of FILE_CATEGORIES) {
        if (extensions.includes(extension)) {
          category = name
          break
        }
      }

      if (!organized[category]) {
        organized[category] = []
      }
      organized[category].push(file)
      processed++
      setProgress((processed / files.length) * 100)
    }

    return organized
  }

  const createAndDownloadZip = async (organizedFiles: Record<string, File[]>) => {
    const zip = new JSZip()

    for (const [category, files] of Object.entries(organizedFiles)) {
      const folder = zip.folder(category)
      if (!folder) continue

      for (const file of files) {
        try {
          const content = await file.arrayBuffer()
          folder.file(file.name, content)
        } catch (err) {
          throw new Error(`Failed to process file: ${file.name}`)
        }
      }
    }

    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `organized_files_${new Date().toISOString().slice(0, 10)}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>File Organizer</Title>

      <MotionCard
        className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={preventDefaults}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: '2px dashed',
          borderColor: isDragging ? '#1890ff' : '#d9d9d9',
          backgroundColor: isDragging ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
          transition: 'all 0.3s'
        }}
      >
        <Space direction="vertical" align="center" style={{ width: '100%', padding: '40px 0' }}>
          <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={4}>Drag and drop files here</Title>
          <Text type="secondary">or click to select files</Text>
        </Space>
      </MotionCard>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      )}

      {isProcessing && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress percent={Math.round(progress)} status="active" />
          <Text type="secondary">Processing files...</Text>
        </Space>
      )}

      {Object.entries(organizedFiles).length > 0 && (
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={4}>Organized Files</Title>
          <List
            dataSource={Object.entries(organizedFiles)}
            renderItem={([category, files]) => (
              <List.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Tag color={FILE_CATEGORIES.find(c => c.name === category)?.color || 'default'}>
                      {category.toUpperCase()}
                    </Tag>
                    <Text>{files.length} files</Text>
                  </Space>
                  <List
                    size="small"
                    dataSource={files}
                    renderItem={file => (
                      <List.Item>
                        <Space>
                          <FileOutlined />
                          <Text>{file.name}</Text>
                          <Text type="secondary">({(file.size / 1024).toFixed(1)} KB)</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Space>
              </List.Item>
            )}
          />
        </MotionCard>
      )}
    </Space>
  )
} 