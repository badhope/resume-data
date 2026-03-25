import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Space, Tag, Card, Row, Col, Statistic, Progress } from 'antd'
import { FileSearchOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { getResumeList } from '../services/api'
import dayjs from 'dayjs'

function ReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchReports = async (page = 1, size = 10) => {
    setLoading(true)
    try {
      const result = await getResumeList((page - 1) * size, size)
      setReports(result.items || [])
      setTotal(result.total || 0)
    } catch (error) {
      console.error('获取报告列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { color: 'success', label: '高' }
    if (confidence >= 0.5) return { color: 'warning', label: '中' }
    return { color: 'error', label: '低' }
  }

  const handleViewReport = (record) => {
    navigate(`/reports/${record.resume_id}`)
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: ['data', 'basic_info', 'name'],
      key: 'name',
      render: (text) => text || <span style={{ color: '#999' }}>未识别</span>
    },
    {
      title: '手机',
      dataIndex: ['data', 'basic_info', 'phone'],
      key: 'phone',
      render: (text) => text || <span style={{ color: '#999' }}>未识别</span>
    },
    {
      title: '邮箱',
      dataIndex: ['data', 'basic_info', 'email'],
      key: 'email',
      render: (text) => text || <span style={{ color: '#999' }}>未识别</span>
    },
    {
      title: '教育',
      dataIndex: ['data', 'education'],
      key: 'education',
      render: (education) => education?.length || 0
    },
    {
      title: '工作',
      dataIndex: ['data', 'work_experience'],
      key: 'work_experience',
      render: (work) => work?.length || 0
    },
    {
      title: '技能',
      dataIndex: ['data', 'skills'],
      key: 'skills',
      render: (skills) => {
        const count = (skills?.programming_languages?.length || 0) + 
                      (skills?.frameworks?.length || 0) + 
                      (skills?.tools?.length || 0)
        return count
      }
    },
    {
      title: '可信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => {
        const level = getConfidenceLevel(confidence)
        return (
          <Tag color={level.color} style={{ borderRadius: 6 }}>
            {level.label} ({confidence})
          </Tag>
        )
      }
    },
    {
      title: '解析时间',
      dataIndex: 'parse_time',
      key: 'parse_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => handleViewReport(record)}
        >
          查看报告
        </Button>
      )
    }
  ]

  const totalReports = reports.length
  const avgConfidence = reports.length > 0 
    ? (reports.reduce((sum, r) => sum + r.confidence, 0) / reports.length).toFixed(2)
    : 0
  const highConfidenceCount = reports.filter(r => r.confidence >= 0.8).length

  return (
    <div className="reports-page">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>清洗报告</h2>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          查看每份简历的清洗详情，包括清洗前后对比和字段提取分析
        </p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="报告总数" value={total} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="平均可信度" value={avgConfidence} suffix="%" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="高可信度" value={highConfidenceCount} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <div style={{ paddingTop: 8 }}>
              <div style={{ color: '#666', marginBottom: 4 }}>高可信度占比</div>
              <Progress 
                percent={total > 0 ? Math.round((highConfidenceCount / total) * 100) : 0} 
                size="small"
                strokeColor="#52c41a"
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Table 
          dataSource={reports}
          columns={columns}
          rowKey="resume_id"
          loading={loading}
          pagination={{
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => fetchReports(page, size)
          }}
        />
      </Card>
    </div>
  )
}

export default ReportsPage
