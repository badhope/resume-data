import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, message, Spin, Result, Button } from 'antd'
import { InboxOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { uploadFile, parseResume } from '../services/api'

const { Dragger } = Upload

function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [currentResumeId, setCurrentResumeId] = useState(null)

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.docx,.doc,.txt,.html',
    beforeUpload: async (file) => {
      const isAllowed = ['.pdf', '.docx', '.doc', '.txt', '.html'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
      if (!isAllowed) {
        message.error('不支持的文件类型')
        return Upload.LIST_IGNORE
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('文件大小不能超过10MB')
        return Upload.LIST_IGNORE
      }

      setLoading(true)
      try {
        const uploadResult = await uploadFile(file)
        message.success('文件上传成功，开始解析...')

        const parsed = await parseResume(uploadResult.file_id)
        message.success('简历解析完成')

        setCurrentResumeId(parsed.resume_id)
        setUploadSuccess(true)
      } catch (error) {
        message.error(error.response?.data?.detail || '处理失败，请重试')
      } finally {
        setLoading(false)
      }

      return false
    },
    showUploadList: false,
  }

  const handleViewResume = () => {
    if (currentResumeId) {
      navigate(`/resumes/${currentResumeId}`)
    }
  }

  const handleUploadMore = () => {
    setUploadSuccess(false)
    setCurrentResumeId(null)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 24, color: '#999' }}>
          正在上传并解析简历，请稍候...
        </div>
      </div>
    )
  }

  if (uploadSuccess) {
    return (
      <div className="upload-container">
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="简历上传并解析成功！"
          subTitle="您的简历已完成数据清洗和结构化处理"
          extra={[
            <Button type="primary" key="view" onClick={handleViewResume}>
              查看解析结果
            </Button>,
            <Button key="more" onClick={handleUploadMore}>
              继续上传
            </Button>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="upload-container">
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">点击或拖拽简历文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持 PDF、Word、TXT、HTML 格式，单个文件不超过10MB
        </p>
      </Dragger>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16 }}>支持的文件格式</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '12px 24px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FileTextOutlined /> PDF
          </div>
          <div style={{ 
            padding: '12px 24px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FileTextOutlined /> Word (.docx)
          </div>
          <div style={{ 
            padding: '12px 24px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FileTextOutlined /> Word (.doc)
          </div>
          <div style={{ 
            padding: '12px 24px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FileTextOutlined /> TXT
          </div>
          <div style={{ 
            padding: '12px 24px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FileTextOutlined /> HTML
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
