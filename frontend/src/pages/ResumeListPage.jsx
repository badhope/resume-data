import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Tag, Modal, message, Empty } from 'antd'
import { EyeOutlined, DeleteOutlined, ExportOutlined, FileTextOutlined } from '@ant-design/icons'
import { getResumeList, deleteResume, exportJson, exportExcel, exportCsv } from '../services/api'
import dayjs from 'dayjs'

function ResumeListPage() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [currentExportId, setCurrentExportId] = useState(null)

  const fetchResumes = async (page = 1, size = 10) => {
    setLoading(true)
    try {
      const result = await getResumeList((page - 1) * size, size)
      setResumes(result.items || [])
      setTotal(result.total || 0)
      setCurrentPage(page)
      setPageSize(size)
    } catch (error) {
      message.error('获取简历列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleView = (record) => {
    navigate(`/resumes/${record.resume_id}`)
  }

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这份简历吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteResume(record.resume_id)
          message.success('删除成功')
          fetchResumes(currentPage, pageSize)
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleExport = (record) => {
    setCurrentExportId(record.resume_id)
    setExportModalVisible(true)
  }

  const handleExportFormat = async (format) => {
    if (!currentExportId) return

    try {
      let blob, filename
      switch (format) {
        case 'json':
          blob = await exportJson(currentExportId)
          filename = `resume_${currentExportId}.json`
          break
        case 'excel':
          blob = await exportExcel(currentExportId)
          filename = `resume_${currentExportId}.xlsx`
          break
        case 'csv':
          blob = await exportCsv(currentExportId)
          filename = `resume_${currentExportId}.csv`
          break
        default:
          return
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    } finally {
      setExportModalVisible(false)
      setCurrentExportId(null)
    }
  }

  const getConfidenceTag = (confidence) => {
    if (confidence >= 0.8) {
      return <Tag color="success" style={{ borderRadius: '6px', fontWeight: 500 }}>高 ({confidence})</Tag>
    } else if (confidence >= 0.5) {
      return <Tag color="warning" style={{ borderRadius: '6px', fontWeight: 500 }}>中 ({confidence})</Tag>
    } else {
      return <Tag color="error" style={{ borderRadius: '6px', fontWeight: 500 }}>低 ({confidence})</Tag>
    }
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      render: (text) => (
        <Space>
          <FileTextOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '姓名',
      dataIndex: ['data', 'basic_info', 'name'],
      key: 'name',
      render: (text) => text || '-',
    },
    {
      title: '解析可信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => getConfidenceTag(confidence),
    },
    {
      title: '解析时间',
      dataIndex: 'parse_time',
      key: 'parse_time',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<ExportOutlined />}
            onClick={() => handleExport(record)}
          >
            导出
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>简历列表</h2>
        <p style={{ color: '#999' }}>共 {total} 份简历</p>
      </div>

      {resumes.length === 0 && !loading ? (
        <Empty description="暂无简历，请先上传" />
      ) : (
        <Table
          columns={columns}
          dataSource={resumes}
          rowKey="resume_id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: fetchResumes,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      )}

      <Modal
        title="选择导出格式"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            block
            onClick={() => handleExportFormat('json')}
            style={{ textAlign: 'left' }}
          >
            📄 JSON 格式
          </Button>
          <Button
            block
            onClick={() => handleExportFormat('excel')}
            style={{ textAlign: 'left' }}
          >
            📊 Excel 格式
          </Button>
          <Button
            block
            onClick={() => handleExportFormat('csv')}
            style={{ textAlign: 'left' }}
          >
            📋 CSV 格式
          </Button>
        </Space>
      </Modal>
    </div>
  )
}

export default ResumeListPage
