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
        message.error('不支持的文件类型，请上传 PDF、Word、TXT 或 HTML 格式')
        return Upload.LIST_IGNORE
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB')
        return Upload.LIST_IGNORE
      }

      setLoading(true)
      try {
        const uploadResult = await uploadFile(file)
        message.success('文件上传成功，正在解析...')

        const parsed = await parseResume(uploadResult.file_id)
        message.success('简历解析完成！')

        setCurrentResumeId(parsed.resume_id)
        setUploadSuccess(true)
      } catch (error) {
        message.error(error.response?.data?.detail || '处理失败，请稍后重试')
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
      <div style={{
        textAlign: 'center',
        padding: '100px 0',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <Spin size="large" />
        <div style={{
          marginTop: 24,
          color: '#6B7280',
          fontSize: '15px'
        }}>
          正在上传并解析简历，请稍候...
        </div>
      </div>
    )
  }

  if (uploadSuccess) {
    return (
      <div className="upload-container fade-in">
        <Result
          className="result-card"
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#10B981', fontSize: '64px' }} />}
          title="简历上传并解析成功！"
          subTitle="您的简历已完成数据清洗和结构化处理，可以查看详细结果或继续上传更多简历"
          extra={[
            <Button
              type="primary"
              key="view"
              onClick={handleViewResume}
              style={{
                height: '44px',
                paddingLeft: '32px',
                paddingRight: '32px',
                fontSize: '15px'
              }}
            >
              查看解析结果
            </Button>,
            <Button
              key="more"
              onClick={handleUploadMore}
              style={{
                height: '44px',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontSize: '15px'
              }}
            >
              继续上传
            </Button>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="upload-container fade-in">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#1F2937',
          marginBottom: '8px'
        }}>
          上传简历
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#6B7280'
        }}>
          支持批量上传，系统将自动进行解析和清洗
        </p>
      </div>

      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: '56px' }} />
        </p>
        <p className="ant-upload-text" style={{ fontSize: '17px', marginTop: '16px' }}>
          点击或拖拽简历文件到此区域上传
        </p>
        <p className="ant-upload-hint">
          支持 PDF、Word、TXT、HTML 格式，单个文件不超过 10MB
        </p>
      </Dragger>

      <div className="file-format-cards">
        <div className="file-format-card">
          <FileTextOutlined style={{ fontSize: '24px', color: '#EF4444' }} />
          <span>PDF</span>
        </div>
        <div className="file-format-card">
          <FileTextOutlined style={{ fontSize: '24px', color: '#3B82F6' }} />
          <span>Word (.docx)</span>
        </div>
        <div className="file-format-card">
          <FileTextOutlined style={{ fontSize: '24px', color: '#3B82F6' }} />
          <span>Word (.doc)</span>
        </div>
        <div className="file-format-card">
          <FileTextOutlined style={{ fontSize: '24px', color: '#6B7280' }} />
          <span>TXT</span>
        </div>
        <div className="file-format-card">
          <FileTextOutlined style={{ fontSize: '24px', color: '#F59E0B' }} />
          <span>HTML</span>
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h4 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#1F2937',
          marginBottom: '12px'
        }}>
          智能简历解析系统
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.6
        }}>
          自动提取姓名、联系方式、教育背景、工作经历、技能证书等信息，<br />
          并进行标准化清洗和脱敏处理，确保数据安全。
        </p>
      </div>
    </div>
  )
}

export default UploadPage
