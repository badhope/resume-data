import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, Table, Spin, Empty, Tag } from 'antd'
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { getStatistics } from '../services/api'
import dayjs from 'dayjs'

function StatisticsPage() {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const data = await getStatistics()
      setStatistics(data)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!statistics) {
    return <Empty description="暂无统计数据" />
  }

  const { overview, field_stats, trend_data } = statistics

  const fieldColumns = [
    {
      title: '字段名称',
      dataIndex: 'field_name',
      key: 'field_name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '识别成功率',
      dataIndex: 'success_rate',
      key: 'success_rate',
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate >= 80 ? 'success' : rate >= 50 ? 'normal' : 'exception'}
          style={{ width: 120 }}
        />
      )
    },
    {
      title: '成功/总数',
      key: 'count',
      render: (_, record) => `${record.success_count}/${record.total_count}`
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        if (record.success_rate >= 80) {
          return <Tag color="success">优秀</Tag>
        } else if (record.success_rate >= 50) {
          return <Tag color="warning">良好</Tag>
        } else {
          return <Tag color="error">待优化</Tag>
        }
      }
    }
  ]

  return (
    <div className="statistics-page">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>数据统计</h2>
        <p style={{ color: '#6B7280', marginTop: 4 }}>简历解析质量与系统使用情况分析</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="简历总数"
              value={overview.total_resumes}
              prefix={<FileTextOutlined style={{ color: '#6366F1' }} />}
              valueStyle={{ color: '#1F2937', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="解析成功"
              value={overview.success_count}
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ color: '#10B981', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="平均可信度"
              value={overview.avg_confidence}
              precision={2}
              prefix={<TrophyOutlined style={{ color: '#F59E0B' }} />}
              valueStyle={{ color: '#F59E0B', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="今日上传"
              value={overview.today_uploads}
              prefix={<RiseOutlined style={{ color: '#3B82F6' }} />}
              valueStyle={{ color: '#3B82F6', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="字段识别率分析" className="analysis-card">
            {field_stats && field_stats.length > 0 ? (
              <Table
                columns={fieldColumns}
                dataSource={field_stats}
                rowKey="field_name"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="近期上传趋势" className="analysis-card">
            {trend_data && trend_data.length > 0 ? (
              <div className="trend-list">
                {trend_data.map((item, index) => (
                  <div key={index} className="trend-item">
                    <div className="trend-date">
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#6B7280' }} />
                      {dayjs(item.date).format('MM月DD日')}
                    </div>
                    <div className="trend-count">
                      <span style={{ fontWeight: 600, color: '#6366F1' }}>{item.count}</span>
                      <span style={{ color: '#9CA3AF', marginLeft: 4 }}>份</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="系统概览" className="overview-card">
            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <div className="overview-item">
                  <div className="overview-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                    <TeamOutlined style={{ fontSize: 24, color: '#6366F1' }} />
                  </div>
                  <div className="overview-content">
                    <div className="overview-value">{overview.week_uploads}</div>
                    <div className="overview-label">本周上传</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="overview-item">
                  <div className="overview-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#10B981' }} />
                  </div>
                  <div className="overview-content">
                    <div className="overview-value">
                      {overview.total_resumes > 0 
                        ? Math.round(overview.success_count / overview.total_resumes * 100) 
                        : 0}%
                    </div>
                    <div className="overview-label">成功率</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="overview-item">
                  <div className="overview-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                    <CloseCircleOutlined style={{ fontSize: 24, color: '#EF4444' }} />
                  </div>
                  <div className="overview-content">
                    <div className="overview-value">{overview.failed_count}</div>
                    <div className="overview-label">解析失败</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default StatisticsPage
