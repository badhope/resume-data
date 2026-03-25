import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Tag, Modal, message, Empty, Alert, Popconfirm } from 'antd'
import { EyeOutlined, DeleteOutlined, ExportOutlined, FileTextOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import { getResumeList, deleteResume, exportJson, exportExcel, exportCsv, exportBatchJson, exportBatchExcel } from '../services/api'
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [batchExportModalVisible, setBatchExportModalVisible] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

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

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的简历')
      return
    }

    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 份简历吗？此操作不可恢复。`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setBatchLoading(true)
        try {
          let successCount = 0
          for (const id of selectedRowKeys) {
            try {
              await deleteResume(id)
              successCount++
            } catch (e) {
              console.error(`删除 ${id} 失败:`, e)
            }
          }
          message.success(`成功删除 ${successCount} 份简历`)
          setSelectedRowKeys([])
          fetchResumes(currentPage, pageSize)
        } catch (error) {
          message.error('批量删除失败')
        } finally {
          setBatchLoading(false)
        }
      },
    })
  }

  const handleBatchExport = async (format) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要导出的简历')
      return
    }

    setBatchLoading(true)
    try {
      let blob, filename
      switch (format) {
        case 'json':
          blob = await exportBatchJson(selectedRowKeys)
          filename = `resumes_batch_${dayjs().format('YYYYMMDD_HHmmss')}.json`
          break
        case 'excel':
          blob = await exportBatchExcel(selectedRowKeys)
          filename = `resumes_batch_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
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
      message.success(`成功导出 ${selectedRowKeys.length} 份简历`)
    } catch (error) {
      message.error('批量导出失败')
    } finally {
      setBatchLoading(false)
      setBatchExportModalVisible(false)
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
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
      width: 200,
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
    <div className="resume-list-page">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>简历管理</h2>
            <p style={{ color: '#6B7280', marginTop: 4 }}>共 {total} 份简历</p>
          </div>
          <Button icon={<ReloadOutlined />} onClick={() => fetchResumes(currentPage, pageSize)}>
            刷新
          </Button>
        </div>
      </div>

      {selectedRowKeys.length > 0 && (
        <Alert
          message={`已选择 ${selectedRowKeys.length} 份简历`}
          action={
            <Space>
              <Button size="small" onClick={() => setSelectedRowKeys([])}>
                取消选择
              </Button>
              <Button 
                size="small" 
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => setBatchExportModalVisible(true)}
              >
                批量导出
              </Button>
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 份简历？`}
                onConfirm={handleBatchDelete}
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  批量删除
                </Button>
              </Popconfirm>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {resumes.length === 0 && !loading ? (
        <Empty description="暂无简历，请先上传" />
      ) : (
        <Table
          columns={columns}
          dataSource={resumes}
          rowKey="resume_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: fetchResumes,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          style={{ borderRadius: 8 }}
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
            style={{ textAlign: 'left', height: 48 }}
          >
            📄 JSON 格式 - 结构化数据
          </Button>
          <Button
            block
            onClick={() => handleExportFormat('excel')}
            style={{ textAlign: 'left', height: 48 }}
          >
            📊 Excel 格式 - 表格数据
          </Button>
          <Button
            block
            onClick={() => handleExportFormat('csv')}
            style={{ textAlign: 'left', height: 48 }}
          >
            📋 CSV 格式 - 通用格式
          </Button>
        </Space>
      </Modal>

      <Modal
        title="批量导出"
        open={batchExportModalVisible}
        onCancel={() => setBatchExportModalVisible(false)}
        footer={null}
      >
        <p style={{ marginBottom: 16, color: '#6B7280' }}>
          将导出选中的 {selectedRowKeys.length} 份简历
        </p>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            block
            size="large"
            onClick={() => handleBatchExport('json')}
            style={{ textAlign: 'left', height: 56 }}
          >
            📄 JSON 格式 - 结构化数据
          </Button>
          <Button
            block
            size="large"
            onClick={() => handleBatchExport('excel')}
            style={{ textAlign: 'left', height: 56 }}
          >
            📊 Excel 格式 - 表格数据
          </Button>
        </Space>
      </Modal>
    </div>
  )
}

export default ResumeListPage
