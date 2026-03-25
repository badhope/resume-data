import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Button, Space, Spin, Alert, Descriptions, Collapse, Statistic, Progress, Typography, Divider, Empty } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, FileTextOutlined, ProfileOutlined } from '@ant-design/icons'
import { getResume } from '../services/api'
import dayjs from 'dayjs'

const { Panel } = Collapse
const { Title, Text } = Typography

function CleaningReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResume()
  }, [id])

  const fetchResume = async () => {
    setLoading(true)
    try {
      const data = await getResume(id)
      setResume(data)
    } catch (error) {
      console.error('获取简历失败:', error)
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

  if (!resume) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="简历不存在" />
      </div>
    )
  }

  const { data, confidence, warnings, raw_text } = resume
  const basicInfo = data?.basic_info || {}
  const education = data?.education || []
  const workExperience = data?.work_experience || []
  const skills = data?.skills || {}

  const fieldStats = [
    { field: '姓名', key: 'name', value: basicInfo.name },
    { field: '性别', key: 'gender', value: basicInfo.gender },
    { field: '手机', key: 'phone', value: basicInfo.phone },
    { field: '邮箱', key: 'email', value: basicInfo.email },
    { field: '地址', key: 'location', value: basicInfo.location },
    { field: '出生日期', key: 'birth_date', value: basicInfo.birth_date },
    { field: '教育经历', key: 'education', value: education.length },
    { field: '工作经历', key: 'work_experience', value: workExperience.length },
    { field: '专业技能', key: 'skills', value: skills.programming_languages?.length || 0 },
  ]

  const totalFields = fieldStats.length
  const filledFields = fieldStats.filter(f => f.value).length
  const fillRate = Math.round((filledFields / totalFields) * 100)

  const getConfidenceLevel = () => {
    if (confidence >= 0.8) return { color: '#52c41a', label: '高可信度' }
    if (confidence >= 0.5) return { color: '#faad14', label: '中可信度' }
    return { color: '#ff4d4f', label: '低可信度' }
  }

  const confidenceInfo = getConfidenceLevel()

  const beforeStats = {
    rawTextLength: raw_text?.length || 0,
    linesCount: raw_text?.split('\n').length || 0,
    estimatedFields: 15,
  }

  const afterStats = {
    structuredFields: filledFields,
    totalFields,
    confidence: confidence,
    warningsCount: warnings?.length || 0,
  }

  return (
    <div className="cleaning-report">
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/resumes')}>
          返回列表
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="清洗报告概览" className="report-card">
            <Row gutter={24}>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="原始文本长度" 
                  value={beforeStats.rawTextLength} 
                  suffix="字符"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="原始文本行数" 
                  value={beforeStats.linesCount} 
                  suffix="行"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic 
                  title="结构化字段" 
                  value={afterStats.structuredFields} 
                  suffix={`/ ${afterStats.totalFields}`}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>完整度</div>
                  <Progress 
                    type="circle" 
                    percent={fillRate} 
                    size={80}
                    strokeColor={fillRate >= 80 ? '#52c41a' : fillRate >= 50 ? '#faad14' : '#ff4d4f'}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>原始数据</span>
              </Space>
            }
            className="report-card"
          >
            <Alert
              message="原始简历为非结构化文本，存在以下问题："
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <ul style={{ paddingLeft: 20, color: '#666' }}>
              <li>格式不统一，包含多种排版样式</li>
              <li>关键信息分散，难以快速提取</li>
              <li>可能包含无关广告或推广内容</li>
              <li>联系方式格式不规范</li>
              <li>日期格式不一致</li>
              <li>学校、公司名称表述不统一</li>
            </ul>
            <Divider />
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#666', margin: 0 }}>
                {raw_text?.substring(0, 1000)}{raw_text?.length > 1000 ? '...' : ''}
              </pre>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>清洗后数据</span>
              </Space>
            }
            className="report-card"
          >
            <Alert
              message="简历已标准化清洗，结果如下："
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <ul style={{ paddingLeft: 20, color: '#52c41a' }}>
              <li>格式统一为结构化JSON格式</li>
              <li>关键信息已提取并分类整理</li>
              <li>无关内容已清除</li>
              <li>联系方式格式已规范化</li>
              <li>日期格式已统一为YYYY-MM-DD</li>
              <li>学校、公司名称已标准化</li>
            </ul>
            <Divider />
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="姓名">{basicInfo.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="性别">{basicInfo.gender || '-'}</Descriptions.Item>
              <Descriptions.Item label="手机">{basicInfo.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{basicInfo.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="位置">{basicInfo.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生日期">{basicInfo.birth_date || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="字段提取详情" className="report-card">
            <Table 
              dataSource={fieldStats.map((stat, index) => ({
                key: index,
                field: stat.field,
                status: stat.value ? 'success' : 'warning',
                value: stat.value || '未识别',
                icon: stat.value ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#faad14' }} />
              }))}
              columns={[
                { title: '字段', dataIndex: 'field', key: 'field' },
                { 
                  title: '状态', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status, record) => (
                    <Space>
                      {record.icon}
                      <Text type={status === 'success' ? 'success' : 'warning'}>
                        {record.value}
                      </Text>
                    </Space>
                  )
                }
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="可信度分析" className="report-card">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Progress 
                type="circle" 
                percent={Math.round(confidence * 100)} 
                size={120}
                strokeColor={confidenceInfo.color}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: confidenceInfo.color }}>
                      {percent}%
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {confidenceInfo.label}
                    </div>
                  </div>
                )}
              />
            </div>
            <Divider />
            <Title level={5}>可信度评估因素：</Title>
            <ul style={{ paddingLeft: 20, color: '#666' }}>
              <li>基本信息完整度（姓名、手机、邮箱）</li>
              <li>教育背景识别质量</li>
              <li>工作经历识别质量</li>
              <li>技能信息识别准确度</li>
            </ul>
            {warnings && warnings.length > 0 && (
              <>
                <Divider />
                <Title level={5}>
                  <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  警告信息
                </Title>
                {warnings.map((warning, index) => (
                  <Alert
                    key={index}
                    message={warning.message}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                ))}
              </>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="详细数据对比" className="report-card">
            <Collapse defaultActiveKey={['basic', 'education', 'work', 'skills']}>
              <Panel header="基本信息" key="basic">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>字段</th>
                          <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>清洗后</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>姓名</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>
                            {basicInfo.name ? (
                              <Tag color="green">{basicInfo.name}</Tag>
                            ) : (
                              <Tag color="orange">未识别</Tag>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>性别</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>
                            {basicInfo.gender ? (
                              <Tag color="green">{basicInfo.gender}</Tag>
                            ) : (
                              <Tag color="orange">未识别</Tag>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>手机</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>
                            {basicInfo.phone ? (
                              <Tag color="green">{basicInfo.phone}</Tag>
                            ) : (
                              <Tag color="orange">未识别</Tag>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>邮箱</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>
                            {basicInfo.email ? (
                              <Tag color="green">{basicInfo.email}</Tag>
                            ) : (
                              <Tag color="orange">未识别</Tag>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Col>
                </Row>
              </Panel>

              <Panel header={`教育背景 (${education.length}条)`} key="education">
                {education.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>学校</th>
                        <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>学历</th>
                        <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>专业</th>
                        <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {education.map((edu, index) => (
                        <tr key={index}>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>{edu.school || '-'}</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>{edu.degree || '-'}</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>{edu.major || '-'}</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>{edu.start_date || '-'} - {edu.end_date || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Empty description="未识别到教育背景" />
                )}
              </Panel>

              <Panel header={`工作经历 (${workExperience.length}条)`} key="work">
                {workExperience.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>公司</th>
                        <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>职位</th>
                        <th style={{ padding: 12, textAlign: 'left', border: '1px solid #e8e8e8' }}>时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workExperience.map((work, index) => (
                        <tr key={index}>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>{work.company || '-'}</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>{work.position || '-'}</td>
                          <td style={{ padding: 12, border: '1px solid #e8e8e8' }}>{work.start_date || '-'} - {work.end_date || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Empty description="未识别到工作经历" />
                )}
              </Panel>

              <Panel header="专业技能" key="skills">
                <Row gutter={[8, 8]}>
                  {skills.programming_languages?.length > 0 && (
                    <>
                      <Col span={24}><Text strong>编程语言：</Text></Col>
                      <Col span={24}>
                        {skills.programming_languages.map((skill, index) => (
                          <Tag key={index} color="blue">
                            {typeof skill === 'object' ? `${skill.name} (${skill.level})` : skill}
                          </Tag>
                        ))}
                      </Col>
                    </>
                  )}
                  {skills.frameworks?.length > 0 && (
                    <>
                      <Col span={24}><Text strong>框架：</Text></Col>
                      <Col span={24}>
                        {skills.frameworks.map((fw, index) => (
                          <Tag key={index} color="green">{fw}</Tag>
                        ))}
                      </Col>
                    </>
                  )}
                  {skills.tools?.length > 0 && (
                    <>
                      <Col span={24}><Text strong>工具：</Text></Col>
                      <Col span={24}>
                        {skills.tools.map((tool, index) => (
                          <Tag key={index} color="orange">{tool}</Tag>
                        ))}
                      </Col>
                    </>
                  )}
                  {(!skills.programming_languages?.length && !skills.frameworks?.length && !skills.tools?.length) && (
                    <Col span={24}><Empty description="未识别到技能信息" /></Col>
                  )}
                </Row>
              </Panel>
            </Collapse>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CleaningReportPage
