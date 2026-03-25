import { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Button, Space, DatePicker, Select, Statistic, Progress, Tabs, Empty, Spin } from 'antd'
import { DownloadOutlined, ReloadOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { apiClient } from '../services/api'

const { RangePicker } = DatePicker
const { TabPane } = Tabs

function LogsPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [statistics, setStatistics] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 20,
    action: null,
    status: null,
    start_date: null,
    end_date: null
  })

  useEffect(() => {
    if (activeTab === 'list') {
      fetchLogs()
    } else {
      fetchStatistics()
    }
  }, [activeTab, filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = { ...filters }
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      
      const response = await apiClient.get('/logs', { params })
      setLogs(response.data.items)
      setTotal(response.data.total)
    } catch (error) {
      console.error('获取日志失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/logs/statistics', { params: { days: 7 } })
      setStatistics(response.data)
    } catch (error) {
      console.error('获取统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const params = {}
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      
      const response = await apiClient.get('/logs/export', { 
        params: { ...params, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      })
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs_${dayjs().format('YYYYMMDD')}.json`
        a.click()
      } else {
        const url = URL.createObjectURL(response.data)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs_${dayjs().format('YYYYMMDD')}.csv`
        a.click()
      }
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  const getStatusTag = (status) => {
    const colors = {
      success: 'success',
      failed: 'error',
      pending: 'processing'
    }
    const labels = {
      success: '成功',
      failed: '失败',
      pending: '处理中'
    }
    return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
  }

  const getActionLabel = (action) => {
    const labels = {
      'user.login': '用户登录',
      'user.logout': '用户登出',
      'user.register': '用户注册',
      'resume.upload': '上传简历',
      'resume.parse': '解析简历',
      'resume.update': '更新简历',
      'resume.delete': '删除简历',
      'resume.export': '导出简历',
      'config.save': '保存配置',
      'shipping.create': '创建邮寄'
    }
    return labels[action] || action
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time) => dayjs(time).format('MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action) => getActionLabel(action)
    },
    {
      title: '资源',
      key: 'resource',
      width: 150,
      render: (_, record) => {
        if (record.resource_type && record.resource_id) {
          return `${record.resource_type} #${record.resource_id}`
        }
        return '-'
      }
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => {
        if (!details) return '-'
        try {
          const data = JSON.parse(details)
          return Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(', ')
        } catch {
          return details
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 120,
      render: (ip) => ip || '-'
    }
  ]

  return (
    <div className="logs-page">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>操作日志</h2>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          查看系统操作记录，支持筛选和导出
        </p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><FileTextOutlined /> 日志列表</span>} key="list">
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <Space wrap>
                <Select
                  placeholder="操作类型"
                  allowClear
                  style={{ width: 150 }}
                  onChange={(v) => setFilters({ ...filters, action: v })}
                >
                  <Select.Option value="user.login">用户登录</Select.Option>
                  <Select.Option value="user.logout">用户登出</Select.Option>
                  <Select.Option value="resume.upload">上传简历</Select.Option>
                  <Select.Option value="resume.parse">解析简历</Select.Option>
                  <Select.Option value="resume.export">导出简历</Select.Option>
                </Select>
                <Select
                  placeholder="状态"
                  allowClear
                  style={{ width: 120 }}
                  onChange={(v) => setFilters({ ...filters, status: v })}
                >
                  <Select.Option value="success">成功</Select.Option>
                  <Select.Option value="failed">失败</Select.Option>
                </Select>
                <RangePicker
                  onChange={(dates) => {
                    if (dates) {
                      setFilters({
                        ...filters,
                        start_date: dates[0].format('YYYY-MM-DD'),
                        end_date: dates[1].format('YYYY-MM-DD')
                      })
                    } else {
                      setFilters({ ...filters, start_date: null, end_date: null })
                    }
                  }}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
                  刷新
                </Button>
              </Space>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={() => handleExport('json')}>
                  导出JSON
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => handleExport('csv')}>
                  导出CSV
                </Button>
              </Space>
            </div>

            <Table
              dataSource={logs}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                total,
                pageSize: filters.limit,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, size) => {
                  setFilters({ ...filters, skip: (page - 1) * size, limit: size })
                }
              }}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><BarChartOutlined /> 统计分析</span>} key="statistics">
          {loading ? (
            <Spin />
          ) : statistics ? (
            <div>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic title="总操作数" value={statistics.total_operations} />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic 
                      title="成功率" 
                      value={statistics.total_operations > 0 
                        ? Math.round((statistics.status_distribution.success / statistics.total_operations) * 100)
                        : 0
                      } 
                      suffix="%" 
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic 
                      title="成功操作" 
                      value={statistics.status_distribution.success} 
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic 
                      title="失败操作" 
                      value={statistics.status_distribution.failed} 
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="操作类型分布">
                    {Object.entries(statistics.action_distribution).length > 0 ? (
                      Object.entries(statistics.action_distribution).map(([action, count]) => (
                        <div key={action} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span>{getActionLabel(action)}</span>
                            <span>{count}</span>
                          </div>
                          <Progress 
                            percent={Math.round((count / statistics.total_operations) * 100)} 
                            size="small"
                            showInfo={false}
                          />
                        </div>
                      ))
                    ) : (
                      <Empty description="暂无数据" />
                    )}
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="资源类型分布">
                    {Object.entries(statistics.resource_distribution).length > 0 ? (
                      Object.entries(statistics.resource_distribution).map(([resource, count]) => (
                        <div key={resource} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span>{resource}</span>
                            <span>{count}</span>
                          </div>
                          <Progress 
                            percent={Math.round((count / statistics.total_operations) * 100)} 
                            size="small"
                            showInfo={false}
                            strokeColor="#1890ff"
                          />
                        </div>
                      ))
                    ) : (
                      <Empty description="暂无数据" />
                    )}
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="每日趋势">
                    {Object.entries(statistics.daily_trend).length > 0 ? (
                      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }}>
                        {Object.entries(statistics.daily_trend)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([date, count]) => (
                            <div 
                              key={date} 
                              style={{ 
                                textAlign: 'center', 
                                minWidth: 60,
                                background: '#f5f5f5',
                                padding: 12,
                                borderRadius: 8
                              }}
                            >
                              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                {dayjs(date).format('MM-DD')}
                              </div>
                              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                                {count}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <Empty description="暂无数据" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <Empty description="暂无统计数据" />
          )}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default LogsPage
