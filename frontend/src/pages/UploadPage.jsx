import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, message, Spin, Result, Button, Progress, List, Tag, Space } from 'antd'
import { InboxOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { uploadFile, uploadBatchFiles, parseResume } from '../services/api'

const { Dragger } = Upload

function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [currentResumeId, setCurrentResumeId] = useState(null)
  const [batchMode, setBatchMode] = useState(false)
  const [batchResults, setBatchResults] = useState([])
  const [batchProgress, setBatchProgress] = useState(0)
  const [processingFiles, setProcessingFiles] = useState([])

  const processSingleFile = async (file) => {
    try {
      const uploadResult = await uploadFile(file)
      const parsed = await parseResume(uploadResult.file_id)
      return {
        success: true,
        filename: file.name,
        resumeId: parsed.resume_id,
        confidence: parsed.confidence,
        name: parsed.data?.basic_info?.name || '未知'
      }
    } catch (error) {
      return {
        success: false,
        filename: file.name,
        error: error.response?.data?.detail || '处理失败'
      }
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.docx,.doc,.txt,.html',
    beforeUpload: async (file, fileList) => {
      const isAllowed = ['.pdf', '.docx', '.doc', '.txt', '.html'].some(ext =>
        file.name.toLowerCase().endsWith(ext)
      )
      if (!isAllowed) {
        message.error(`${file.name} 不支持的文件类型`)
        return Upload.LIST_IGNORE
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error(`${file.name} 文件大小超过 10MB`)
        return Upload.LIST_IGNORE
      }

      return false
    },
    onChange: async (info) => {
      const { file, fileList } = info
      
      if (file.status === 'done' || file.status === 'error') {
        return
      }
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      if (batchMode) {
        return
      }
      
      setLoading(true)
      try {
        const uploadResult = await uploadFile(file)
        message.success('文件上传成功，正在解析...')

        const parsed = await parseResume(uploadResult.file_id)
        message.success('简历解析完成！')

        setCurrentResumeId(parsed.resume_id)
        setUploadSuccess(true)
        onSuccess(parsed, file)
      } catch (error) {
        message.error(error.response?.data?.detail || '处理失败，请稍后重试')
        onError(error)
      } finally {
        setLoading(false)
      }
    },
    showUploadList: false,
  }

  const handleBatchUpload = async (files) => {
    if (!files || files.length === 0) {
      message.warning('请选择要上传的文件')
      return
    }

    setLoading(true)
    setBatchResults([])
    setBatchProgress(0)
    setProcessingFiles(files.map(f => ({ name: f.name, status: 'pending' })))

    const results = []
    const total = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      setProcessingFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' } : f
      ))

      const result = await processSingleFile(file)
      results.push(result)
      
      setBatchProgress(Math.round(((i + 1) / total) * 100))
      
      setProcessingFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: result.success ? 'success' : 'error' } : f
      ))
      
      setBatchResults([...results])
    }

    const successCount = results.filter(r => r.success).length
    if (successCount === total) {
      message.success(`全部 ${total} 个文件处理成功！`)
    } else if (successCount > 0) {
      message.warning(`成功 ${successCount} 个，失败 ${total - successCount} 个`)
    } else {
      message.error('所有文件处理失败')
    }

    setLoading(false)
    setUploadSuccess(true)
  }

  const handleViewResume = () => {
    if (currentResumeId) {
      navigate(`/resumes/${currentResumeId}`)
    }
  }

  const handleViewBatchResult = (resumeId) => {
    navigate(`/resumes/${resumeId}`)
  }

  const handleUploadMore = () => {
    setUploadSuccess(false)
    setCurrentResumeId(null)
    setBatchResults([])
    setBatchProgress(0)
    setProcessingFiles([])
    setBatchMode(false)
  }

  const toggleBatchMode = () => {
    setBatchMode(!batchMode)
    setBatchResults([])
    setBatchProgress(0)
    setProcessingFiles([])
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
          {batchMode ? (
            <>
              <Progress 
                percent={batchProgress} 
                style={{ maxWidth: 300, margin: '0 auto' }}
                status="active"
              />
              <div style={{ marginTop: 16 }}>
                正在处理 {processingFiles.filter(f => f.status === 'processing' || f.status === 'success' || f.status === 'error').length} / {processingFiles.length} 个文件...
              </div>
              <List
                style={{ maxWidth: 400, margin: '16px auto 0', textAlign: 'left' }}
                dataSource={processingFiles}
                renderItem={item => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Space>
                      {item.status === 'processing' && <LoadingOutlined spin style={{ color: '#6366F1' }} />}
                      {item.status === 'success' && <CheckCircleOutlined style={{ color: '#10B981' }} />}
                      {item.status === 'error' && <CloseCircleOutlined style={{ color: '#EF4444' }} />}
                      {item.status === 'pending' && <ClockCircleOutlined style={{ color: '#9CA3AF' }} />}
                      <span>{item.name}</span>
                    </Space>
                  </List.Item>
                )}
              />
            </>
          ) : (
            '正在上传并解析简历，请稍候...'
          )}
        </div>
      </div>
    )
  }

  if (uploadSuccess) {
    if (batchMode && batchResults.length > 0) {
      const successCount = batchResults.filter(r => r.success).length
      return (
        <div className="upload-container fade-in">
          <Result
            className="result-card"
            status={successCount === batchResults.length ? 'success' : 'warning'}
            icon={successCount === batchResults.length ? 
              <CheckCircleOutlined style={{ color: '#10B981', fontSize: '64px' }} /> :
              <FileTextOutlined style={{ color: '#F59E0B', fontSize: '64px' }} />
            }
            title={`批量处理完成！成功 ${successCount}/${batchResults.length} 个`}
            subTitle="以下是处理结果，点击可查看详情"
            extra={[
              <Button
                key="list"
                onClick={() => navigate('/resumes')}
                style={{ height: '44px', fontSize: '15px' }}
              >
                查看全部简历
              </Button>,
              <Button
                type="primary"
                key="more"
                onClick={handleUploadMore}
                style={{ height: '44px', fontSize: '15px' }}
              >
                继续上传
              </Button>,
            ]}
          />
          <div style={{ marginTop: 24 }}>
            <List
              bordered
              dataSource={batchResults}
              renderItem={item => (
                <List.Item
                  actions={item.success ? [
                    <Button type="link" onClick={() => handleViewBatchResult(item.resumeId)}>
                      查看
                    </Button>
                  ] : []}
                >
                  <List.Item.Meta
                    avatar={
                      item.success ? 
                        <CheckCircleOutlined style={{ color: '#10B981', fontSize: 20 }} /> :
                        <CloseCircleOutlined style={{ color: '#EF4444', fontSize: 20 }} />
                    }
                    title={item.filename}
                    description={item.success ? 
                      `姓名: ${item.name} | 可信度: ${(item.confidence * 100).toFixed(1)}%` :
                      <span style={{ color: '#EF4444' }}>{item.error}</span>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      )
    }

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

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Button 
          type={batchMode ? 'primary' : 'default'}
          onClick={toggleBatchMode}
          style={{ marginRight: 8 }}
        >
          {batchMode ? '批量上传模式' : '切换批量上传'}
        </Button>
        {batchMode && (
          <Tag color="blue">可选择多个文件一次性上传</Tag>
        )}
      </div>

      {batchMode ? (
        <Dragger 
          {...uploadProps}
          customRequest={undefined}
          beforeUpload={() => false}
          onChange={async (info) => {
            const files = info.fileList
              .filter(f => f.originFileObj)
              .map(f => f.originFileObj)
            
            if (files.length > 0 && info.file.status !== 'uploading') {
              await handleBatchUpload(files)
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: '56px' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: '17px', marginTop: '16px' }}>
            点击或拖拽多个简历文件到此区域上传
          </p>
          <p className="ant-upload-hint">
            支持 PDF、Word、TXT、HTML 格式，可同时选择多个文件
          </p>
        </Dragger>
      ) : (
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
      )}

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
          系统将自动识别简历中的关键信息，包括基本信息、教育背景、工作经历、专业技能等，
          并进行数据清洗和标准化处理，确保数据质量。
        </p>
      </div>
    </div>
  )
}

export default UploadPage
