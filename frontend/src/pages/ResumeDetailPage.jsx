import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Descriptions, Tag, Button, Space, Spin, message, Modal, Form, Input, Select, Empty } from 'antd'
import { ArrowLeftOutlined, ExportOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { getResume, updateResume, exportJson, exportExcel, exportCsv } from '../services/api'
import dayjs from 'dayjs'

function ResumeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchResume()
  }, [id])

  const fetchResume = async () => {
    setLoading(true)
    try {
      const data = await getResume(id)
      setResume(data)
      form.setFieldsValue(data.data)
    } catch (error) {
      message.error('获取简历详情失败')
      navigate('/resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format) => {
    const doExport = async () => {
      try {
        let blob, filename
        switch (format) {
          case 'json':
            blob = await exportJson(id)
            filename = `resume_${id}.json`
            break
          case 'excel':
            blob = await exportExcel(id)
            filename = `resume_${id}.xlsx`
            break
          case 'csv':
            blob = await exportCsv(id)
            filename = `resume_${id}.csv`
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
      }
    }

    doExport()
    setExportModalVisible(false)
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      await updateResume(id, { data: values })
      message.success('保存成功')
      setEditing(false)
      fetchResume()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleCancel = () => {
    form.setFieldsValue(resume?.data)
    setEditing(false)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!resume) {
    return null
  }

  const { data, confidence } = resume
  const basicInfo = data?.basic_info || {}
  const education = data?.education || []
  const workExperience = data?.work_experience || []
  const skills = data?.skills || {}
  const certificates = data?.certificates || []
  const projects = data?.projects || []

  const getConfidenceClass = () => {
    if (confidence >= 0.8) return 'confidence-high'
    if (confidence >= 0.5) return 'confidence-medium'
    return 'confidence-low'
  }

  return (
    <div className="resume-detail">
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/resumes')}>
            返回列表
          </Button>
          {!editing ? (
            <>
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                编辑
              </Button>
              <Button icon={<ExportOutlined />} onClick={() => setExportModalVisible(true)}>
                导出
              </Button>
            </>
          ) : (
            <>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                保存
              </Button>
              <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
                取消
              </Button>
            </>
          )}
        </Space>

        <div style={{ float: 'right' }}>
          <span className={`confidence-badge ${getConfidenceClass()}`}>
            解析可信度: {confidence}
          </span>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={24} lg={8}>
            <Card title="基本信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="姓名">
                  {editing ? (
                    <Form.Item name={['basic_info', 'name']} noStyle>
                      <Input />
                    </Form.Item>
                  ) : (
                    basicInfo.name || '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="性别">
                  {editing ? (
                    <Form.Item name={['basic_info', 'gender']} noStyle>
                      <Select options={[{ value: '男', label: '男' }, { value: '女', label: '女' }]} />
                    </Form.Item>
                  ) : (
                    basicInfo.gender || '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="手机">
                  {editing ? (
                    <Form.Item name={['basic_info', 'phone']} noStyle>
                      <Input />
                    </Form.Item>
                  ) : (
                    basicInfo.phone || '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {editing ? (
                    <Form.Item name={['basic_info', 'email']} noStyle>
                      <Input />
                    </Form.Item>
                  ) : (
                    basicInfo.email || '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="地址">
                  {editing ? (
                    <Form.Item name={['basic_info', 'location']} noStyle>
                      <Input />
                    </Form.Item>
                  ) : (
                    basicInfo.location || '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="出生日期">
                  {editing ? (
                    <Form.Item name={['basic_info', 'birth_date']} noStyle>
                      <Input />
                    </Form.Item>
                  ) : (
                    basicInfo.birth_date || '-'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24} lg={16}>
            <Card title="教育背景" style={{ marginBottom: 24 }}>
              {education.length > 0 ? (
                education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: index < education.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <strong>{edu.school}</strong>
                        <div style={{ color: '#666' }}>{edu.degree} | {edu.major}</div>
                      </Col>
                      <Col span={12} style={{ textAlign: 'right', color: '#999' }}>
                        {edu.start_date} - {edu.end_date}
                      </Col>
                    </Row>
                  </div>
                ))
              ) : (
                <Empty description="未识别到教育背景" />
              )}
            </Card>
          </Col>

          <Col span={24}>
            <Card title="工作经历" style={{ marginBottom: 24 }}>
              {workExperience.length > 0 ? (
                workExperience.map((work, index) => (
                  <div key={index} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: index < workExperience.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <strong>{work.company}</strong>
                        <div style={{ color: '#666' }}>{work.position}</div>
                      </Col>
                      <Col span={12} style={{ textAlign: 'right', color: '#999' }}>
                        {work.start_date} - {work.end_date}
                      </Col>
                    </Row>
                    {work.description && (
                      <div style={{ marginTop: 8, color: '#666' }}>{work.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <Empty description="未识别到工作经历" />
              )}
            </Card>
          </Col>

          <Col span={24} lg={12}>
            <Card title="专业技能" style={{ marginBottom: 24 }}>
              {skills?.programming_languages?.length > 0 || skills?.frameworks?.length > 0 || skills?.tools?.length > 0 ? (
                <div>
                  {skills?.programming_languages?.map((skill, index) => (
                    <Tag key={index} color="blue" className="skill-tag">
                      {typeof skill === 'object' ? skill.name : skill}
                      {typeof skill === 'object' && skill.level && ` (${skill.level})`}
                    </Tag>
                  ))}
                  {skills?.frameworks?.map((framework, index) => (
                    <Tag key={index} color="green" className="skill-tag">{framework}</Tag>
                  ))}
                  {skills?.tools?.map((tool, index) => (
                    <Tag key={index} color="orange" className="skill-tag">{tool}</Tag>
                  ))}
                </div>
              ) : (
                <Empty description="未识别到技能信息" />
              )}
            </Card>
          </Col>

          <Col span={24} lg={12}>
            <Card title="语言能力" style={{ marginBottom: 24 }}>
              {skills?.languages?.length > 0 ? (
                skills.languages.map((lang, index) => (
                  <Tag key={index} className="skill-tag">
                    {typeof lang === 'object' ? `${lang.name} - ${lang.level}` : lang}
                  </Tag>
                ))
              ) : (
                <Empty description="未识别到语言能力" />
              )}
            </Card>
          </Col>

          <Col span={24}>
            <Card title="项目经验" style={{ marginBottom: 24 }}>
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <div key={index} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: index < projects.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <strong>{project.name}</strong>
                        {project.role && <div style={{ color: '#666' }}>角色: {project.role}</div>}
                      </Col>
                      <Col span={12} style={{ textAlign: 'right', color: '#999' }}>
                        {project.start_date} - {project.end_date}
                      </Col>
                    </Row>
                    {project.tech_stack?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {project.tech_stack.map((tech, i) => (
                          <Tag key={i}>{tech}</Tag>
                        ))}
                      </div>
                    )}
                    {project.description && (
                      <div style={{ marginTop: 8, color: '#666' }}>{project.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <Empty description="未识别到项目经验" />
              )}
            </Card>
          </Col>

          <Col span={24}>
            <Card title="证书资质" style={{ marginBottom: 24 }}>
              {certificates.length > 0 ? (
                certificates.map((cert, index) => (
                  <Tag key={index} className="skill-tag">
                    {cert.name} {cert.issue_date && `(${cert.issue_date})`}
                  </Tag>
                ))
              ) : (
                <Empty description="未识别到证书信息" />
              )}
            </Card>
          </Col>
        </Row>
      </Form>

      <Modal
        title="选择导出格式"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block onClick={() => handleExport('json')} style={{ textAlign: 'left' }}>
            📄 JSON 格式
          </Button>
          <Button block onClick={() => handleExport('excel')} style={{ textAlign: 'left' }}>
            📊 Excel 格式
          </Button>
          <Button block onClick={() => handleExport('csv')} style={{ textAlign: 'left' }}>
            📋 CSV 格式
          </Button>
        </Space>
      </Modal>
    </div>
  )
}

export default ResumeDetailPage
