import { useState, useEffect } from 'react'
import { Card, Switch, Select, Button, Divider, message, Spin, Row, Col, Tabs, Table, Tag, Modal, Input, Space, Popconfirm } from 'antd'
import { SettingOutlined, FileTextOutlined, HistoryOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCleanOptions, updateCleanOptions, getExportTemplates, createExportTemplate, deleteExportTemplate, getHistory } from '../services/api'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { TextArea } = Input

function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [options, setOptions] = useState(null)
  const [templates, setTemplates] = useState([])
  const [history, setHistory] = useState({ total: 0, items: [] })
  const [templateModalVisible, setTemplateModalVisible] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', fields: [], format: 'json' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [optionsData, templatesData, historyData] = await Promise.all([
        getCleanOptions(),
        getExportTemplates(),
        getHistory()
      ])
      setOptions(optionsData.options)
      setTemplates(templatesData)
      setHistory(historyData)
    } catch (error) {
      message.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOptions = async () => {
    setSaving(true)
    try {
      await updateCleanOptions(options)
      message.success('配置已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.name) {
      message.warning('请输入模板名称')
      return
    }
    try {
      await createExportTemplate(newTemplate)
      message.success('模板创建成功')
      setTemplateModalVisible(false)
      setNewTemplate({ name: '', description: '', fields: [], format: 'json' })
      fetchData()
    } catch (error) {
      message.error('创建失败')
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteExportTemplate(templateId)
      message.success('模板已删除')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  const fieldOptions = [
    { label: '姓名', value: 'extract_name' },
    { label: '性别', value: 'extract_gender' },
    { label: '出生日期', value: 'extract_birth_date' },
    { label: '手机', value: 'extract_phone' },
    { label: '邮箱', value: 'extract_email' },
    { label: '地址', value: 'extract_location' },
    { label: '教育经历', value: 'extract_education' },
    { label: '工作经历', value: 'extract_work' },
    { label: '专业技能', value: 'extract_skills' },
    { label: '证书资质', value: 'extract_certificates' },
    { label: '项目经验', value: 'extract_projects' },
    { label: '自我评价', value: 'extract_self_evaluation' },
  ]

  const templateColumns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {text}
          {record.is_default && <Tag color="blue">默认</Tag>}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-'
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      render: (text) => <Tag>{text.toUpperCase()}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        !record.is_default && (
          <Popconfirm
            title="确定删除此模板？"
            onConfirm={() => handleDeleteTemplate(record.template_id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        )
      )
    }
  ]

  const historyColumns = [
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      render: (text) => {
        const actionMap = {
          'update_options': '更新配置',
          'upload': '上传简历',
          'parse': '解析简历',
          'export': '导出数据',
          'delete': '删除简历',
        }
        return actionMap[text] || text
      }
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      render: (details) => details?.message || '-'
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss')
    }
  ]

  return (
    <div className="settings-page">
      <Tabs defaultActiveKey="options">
        <TabPane
          tab={<span><SettingOutlined />清洗选项</span>}
          key="options"
        >
          <Card title="字段提取设置" className="settings-card">
            <Row gutter={[16, 16]}>
              {fieldOptions.map(field => (
                <Col xs={24} sm={12} md={8} lg={6} key={field.value}>
                  <div className="option-item">
                    <span>{field.label}</span>
                    <Switch
                      checked={options?.[field.value] ?? true}
                      onChange={(checked) => {
                        setOptions({ ...options, [field.value]: checked })
                      }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          <Card title="数据处理设置" className="settings-card" style={{ marginTop: 16 }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="option-group">
                  <label>敏感信息处理</label>
                  <Select
                    value={options?.sensitive_mode || 'mask'}
                    onChange={(value) => setOptions({ ...options, sensitive_mode: value })}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'keep', label: '保留原始数据' },
                      { value: 'mask', label: '脱敏处理（推荐）' },
                      { value: 'remove', label: '完全移除' },
                    ]}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="option-group">
                  <label>日期格式</label>
                  <Select
                    value={options?.date_format || 'standard'}
                    onChange={(value) => setOptions({ ...options, date_format: value })}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'standard', label: '标准格式 (2020-09)' },
                      { value: 'chinese', label: '中文格式 (2020年9月)' },
                      { value: 'slash', label: '斜杠格式 (09/2020)' },
                    ]}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="option-item">
                  <span>学历名称标准化</span>
                  <Switch
                    checked={options?.normalize_degree ?? true}
                    onChange={(checked) => setOptions({ ...options, normalize_degree: checked })}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="option-item">
                  <span>公司名称标准化</span>
                  <Switch
                    checked={options?.normalize_company ?? true}
                    onChange={(checked) => setOptions({ ...options, normalize_company: checked })}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button type="primary" size="large" onClick={handleSaveOptions} loading={saving}>
              保存配置
            </Button>
          </div>
        </TabPane>

        <TabPane
          tab={<span><FileTextOutlined />导出模板</span>}
          key="templates"
        >
          <Card 
            title="导出模板管理" 
            className="settings-card"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTemplateModalVisible(true)}>
                新建模板
              </Button>
            }
          >
            <Table
              columns={templateColumns}
              dataSource={templates}
              rowKey="template_id"
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={<span><HistoryOutlined />操作历史</span>}
          key="history"
        >
          <Card title="操作历史记录" className="settings-card">
            <Table
              columns={historyColumns}
              dataSource={history.items}
              rowKey="record_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新建导出模板"
        open={templateModalVisible}
        onOk={handleCreateTemplate}
        onCancel={() => setTemplateModalVisible(false)}
        okText="创建"
        cancelText="取消"
      >
        <div style={{ padding: '16px 0' }}>
          <div className="form-item">
            <label>模板名称</label>
            <Input
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="请输入模板名称"
            />
          </div>
          <div className="form-item">
            <label>描述</label>
            <TextArea
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              placeholder="请输入模板描述"
              rows={2}
            />
          </div>
          <div className="form-item">
            <label>导出格式</label>
            <Select
              value={newTemplate.format}
              onChange={(value) => setNewTemplate({ ...newTemplate, format: value })}
              style={{ width: '100%' }}
              options={[
                { value: 'json', label: 'JSON' },
                { value: 'excel', label: 'Excel' },
                { value: 'csv', label: 'CSV' },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsPage
