import { useState, useEffect } from 'react'
import { Card, Row, Col, Form, Input, Select, Switch, Slider, Button, Space, Divider, Collapse, Tag, message, Tabs, Checkbox, InputNumber, Alert } from 'antd'
import { SaveOutlined, ReloadOutlined, SettingOutlined, FilterOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Panel } = Collapse
const { TabPane } = Tabs

const universities985 = [
  '清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学', 
  '中国科学技术大学', '南京大学', '武汉大学', '华中科技大学', '中山大学',
  '西安交通大学', '哈尔滨工业大学', '北京航空航天大学', '北京师范大学', '同济大学',
  '南开大学', '天津大学', '山东大学', '四川大学', '厦门大学', '东南大学',
  '中南大学', '吉林大学', '大连理工大学', '重庆大学', '兰州大学',
  '西北工业大学', '华南理工大学', '华东师范大学', '电子科技大学', '中国农业大学',
  '湖南大学', '东北大学', '北京理工大学', '中国海洋大学', '中央民族大学',
  '西北农林科技大学', '国防科技大学'
]

const universities211 = [
  '北京交通大学', '北京工业大学', '北京科技大学', '北京化工大学', '北京邮电大学',
  '北京林业大学', '北京中医药大学', '北京外国语大学', '中国传媒大学', '中央财经大学',
  '对外经济贸易大学', '北京体育大学', '中央音乐学院', '中国政法大学', '华北电力大学',
  '中国矿业大学', '中国石油大学', '中国地质大学', '南京航空航天大学', '南京理工大学',
  '河海大学', '江南大学', '南京师范大学', '苏州大学', '上海财经大学',
  '西南交通大学', '西南财经大学', '四川农业大学', '西南大学',
  '武汉理工大学', '华中农业大学', '华中师范大学', '中南财经政法大学',
  '暨南大学', '华南师范大学', '陕西师范大学', '西安电子科技大学', '长安大学',
  '东北师范大学', '延边大学', '哈尔滨工程大学', '东北农业大学', '东北林业大学',
  '辽宁大学', '大连海事大学', '安徽大学', '合肥工业大学', '福州大学',
  '南昌大学', '郑州大学', '湖南师范大学', '广西大学', '贵州大学',
  '云南大学', '西藏大学', '西北大学', '青海大学', '宁夏大学', '新疆大学',
  '海南大学', '石河子大学'
]

function CleaningConfigPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('education')

  useEffect(() => {
    loadDefaultConfig()
  }, [])

  const loadDefaultConfig = () => {
    const savedConfig = localStorage.getItem('cleaningConfig')
    if (savedConfig) {
      form.setFieldsValue(JSON.parse(savedConfig))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      localStorage.setItem('cleaningConfig', JSON.stringify(values))
      message.success('配置已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    localStorage.removeItem('cleaningConfig')
    message.success('配置已重置')
  }

  const educationOptions = [
    { label: '博士', value: 'doctor' },
    { label: '硕士', value: 'master' },
    { label: '本科', value: 'bachelor' },
    { label: '大专', value: 'college' },
  ]

  const gpaOptions = [
    { label: '前5%', value: 5 },
    { label: '前10%', value: 10 },
    { label: '前20%', value: 20 },
    { label: '前30%', value: 30 },
    { label: '前50%', value: 50 },
  ]

  const projectTypes = [
    { label: '企业项目', value: 'enterprise' },
    { label: '科研项目', value: 'research' },
    { label: '开源项目', value: 'opensource' },
    { label: '个人项目', value: 'personal' },
    { label: '课程项目', value: 'course' },
  ]

  const projectRoles = [
    { label: '项目负责人', value: 'leader' },
    { label: '核心成员', value: 'core' },
    { label: '普通成员', value: 'member' },
  ]

  const skillLevels = [
    { label: '精通', value: 'expert' },
    { label: '熟练', value: 'proficient' },
    { label: '熟悉', value: 'familiar' },
    { label: '了解', value: 'basic' },
  ]

  return (
    <div className="cleaning-config-page">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>清洗配置</h2>
          <p style={{ margin: '8px 0 0', color: '#666' }}>
            配置简历清洗的细粒度筛选条件，系统将根据您的配置自动筛选符合条件的候选人
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
            保存配置
          </Button>
        </Space>
      </div>

      <Alert
        message="配置说明"
        description="开启的筛选条件将在简历清洗时生效。未开启的条件将被忽略，不会影响清洗结果。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabPosition="left" style={{ minHeight: 600 }}>
          <TabPane
            tab={<span><SettingOutlined /> 学历筛选</span>}
            key="education"
          >
            <Card title="学历要求" className="config-card">
              <Form.Item name={['education', 'enabled']} valuePropName="checked" label="启用学历筛选">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name={['education', 'minDegree']} label="最低学历要求">
                <Select mode="multiple" placeholder="选择接受的学历层次" style={{ width: '100%' }}>
                  {educationOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider orientation="left">院校筛选</Divider>

              <Form.Item name={['education', 'schoolTypes']} label="院校类型">
                <Checkbox.Group>
                  <Row>
                    <Col span={8}><Checkbox value="985">985院校</Checkbox></Col>
                    <Col span={8}><Checkbox value="211">211院校</Checkbox></Col>
                    <Col span={8}><Checkbox value="double_first_class">双一流</Checkbox></Col>
                    <Col span={8}><Checkbox value="overseas">海外院校</Checkbox></Col>
                    <Col span={8}><Checkbox value="other">其他院校</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item name={['education', 'specificSchools']} label="指定院校">
                <Select
                  mode="multiple"
                  placeholder="选择或输入院校名称"
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {[...universities985, ...universities211].map(school => (
                    <Select.Option key={school} value={school}>{school}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name={['education', 'excludeSchools']} label="排除院校">
                <Select
                  mode="multiple"
                  placeholder="选择要排除的院校"
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {[...universities985, ...universities211].map(school => (
                    <Select.Option key={school} value={school}>{school}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider orientation="left">专业筛选</Divider>

              <Form.Item name={['education', 'majorCategories']} label="专业类别">
                <Checkbox.Group>
                  <Row>
                    <Col span={6}><Checkbox value="cs">计算机/软件</Checkbox></Col>
                    <Col span={6}><Checkbox value="ee">电子/通信</Checkbox></Col>
                    <Col span={6}><Checkbox value="math">数学/统计</Checkbox></Col>
                    <Col span={6}><Checkbox value="physics">物理</Checkbox></Col>
                    <Col span={6}><Checkbox value="chemistry">化学/药学</Checkbox></Col>
                    <Col span={6}><Checkbox value="biology">生物/医学</Checkbox></Col>
                    <Col span={6}><Checkbox value="finance">金融/经济</Checkbox></Col>
                    <Col span={6}><Checkbox value="management">管理/商科</Checkbox></Col>
                    <Col span={6}><Checkbox value="language">语言/文学</Checkbox></Col>
                    <Col span={6}><Checkbox value="law">法学</Checkbox></Col>
                    <Col span={6}><Checkbox value="other">其他</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item name={['education', 'specificMajors']} label="指定专业">
                <Select mode="tags" placeholder="输入专业名称，按回车添加" style={{ width: '100%' }}>
                </Select>
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane
            tab={<span><FilterOutlined /> GPA筛选</span>}
            key="gpa"
          >
            <Card title="GPA/成绩筛选" className="config-card">
              <Form.Item name={['gpa', 'enabled']} valuePropName="checked" label="启用GPA筛选">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name={['gpa', 'minRanking']} label="最低排名要求">
                <Select placeholder="选择排名要求">
                  {gpaOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name={['gpa', 'minGpa']} label="最低GPA (4.0制)">
                <Slider min={0} max={4} step={0.1} marks={{ 0: '0', 2: '2.0', 3: '3.0', 3.5: '3.5', 4: '4.0' }} />
              </Form.Item>

              <Form.Item name={['gpa', 'minScore']} label="最低平均分 (100分制)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 80" />
              </Form.Item>

              <Form.Item name={['gpa', 'requireTranscript']} valuePropName="checked" label="要求提供成绩单">
                <Switch />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane
            tab={<span><SettingOutlined /> 工作经历</span>}
            key="experience"
          >
            <Card title="工作经历筛选" className="config-card">
              <Form.Item name={['experience', 'enabled']} valuePropName="checked" label="启用工作经历筛选">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name={['experience', 'minYears']} label="最低工作年限">
                <InputNumber min={0} max={30} style={{ width: '100%' }} addonAfter="年" />
              </Form.Item>

              <Form.Item name={['experience', 'companyTypes']} label="公司类型">
                <Checkbox.Group>
                  <Row>
                    <Col span={8}><Checkbox value="fortune500">世界500强</Checkbox></Col>
                    <Col span={8}><Checkbox value="china500">中国500强</Checkbox></Col>
                    <Col span={8}><Checkbox value="listed">上市公司</Checkbox></Col>
                    <Col span={8}><Checkbox value="state_owned">国企</Checkbox></Col>
                    <Col span={8}><Checkbox value="foreign">外企</Checkbox></Col>
                    <Col span={8}><Checkbox value="startup">创业公司</Checkbox></Col>
                    <Col span={8}><Checkbox value="internet">互联网大厂</Checkbox></Col>
                    <Col span={8}><Checkbox value="pharmaceutical">医药企业</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item name={['experience', 'industries']} label="行业要求">
                <Select mode="multiple" placeholder="选择行业" style={{ width: '100%' }}>
                  <Select.Option value="pharmaceutical">医药/医疗</Select.Option>
                  <Select.Option value="internet">互联网/IT</Select.Option>
                  <Select.Option value="finance">金融</Select.Option>
                  <Select.Option value="manufacturing">制造业</Select.Option>
                  <Select.Option value="consulting">咨询</Select.Option>
                  <Select.Option value="education">教育</Select.Option>
                  <Select.Option value="other">其他</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name={['experience', 'positions']} label="职位关键词">
                <Select mode="tags" placeholder="输入职位关键词" style={{ width: '100%' }}>
                </Select>
              </Form.Item>

              <Form.Item name={['experience', 'requireRelated']} valuePropName="checked" label="要求相关工作经验">
                <Switch />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane
            tab={<span><SettingOutlined /> 项目经验</span>}
            key="project"
          >
            <Card title="项目经验筛选" className="config-card">
              <Form.Item name={['project', 'enabled']} valuePropName="checked" label="启用项目经验筛选">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name={['project', 'minCount']} label="最少项目数量">
                <InputNumber min={0} max={20} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name={['project', 'types']} label="项目类型">
                <Checkbox.Group>
                  <Row>
                    {projectTypes.map(opt => (
                      <Col span={8} key={opt.value}>
                        <Checkbox value={opt.value}>{opt.label}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item name={['project', 'roles']} label="项目角色">
                <Checkbox.Group>
                  <Row>
                    {projectRoles.map(opt => (
                      <Col span={8} key={opt.value}><Checkbox value={opt.value}>{opt.label}</Checkbox></Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item name={['project', 'minDuration']} label="项目最短周期(月)">
                <InputNumber min={1} max={36} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name={['project', 'techKeywords']} label="技术关键词">
                <Select mode="tags" placeholder="输入技术关键词" style={{ width: '100%' }}>
                </Select>
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane
            tab={<span><SettingOutlined /> 专业技能</span>}
            key="skill"
          >
            <Card title="专业技能筛选" className="config-card">
              <Form.Item name={['skill', 'enabled']} valuePropName="checked" label="启用技能筛选">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Form.Item name={['skill', 'minLevel']} label="最低技能水平">
                <Select placeholder="选择最低技能水平">
                  {skillLevels.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name={['skill', 'requiredSkills']} label="必备技能">
                <Select mode="tags" placeholder="输入必备技能" style={{ width: '100%' }}>
                </Select>
              </Form.Item>

              <Form.Item name={['skill', 'preferredSkills']} label="优先技能">
                <Select mode="tags" placeholder="输入优先技能" style={{ width: '100%' }}>
                </Select>
              </Form.Item>

              <Form.Item name={['skill', 'certifications']} label="证书要求">
                <Select mode="tags" placeholder="输入证书名称" style={{ width: '100%' }}>
                  <Select.Option value="cet4">CET-4</Select.Option>
                  <Select.Option value="cet6">CET-6</Select.Option>
                  <Select.Option value="toefl">TOEFL</Select.Option>
                  <Select.Option value="ielts">IELTS</Select.Option>
                  <Select.Option value="gre">GRE</Select.Option>
                  <Select.Option value="gmat">GMAT</Select.Option>
                  <Select.Option value="cpa">CPA</Select.Option>
                  <Select.Option value="cfa">CFA</Select.Option>
                  <Select.Option value="pmp">PMP</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name={['skill', 'languages']} label="语言能力">
                <Select mode="multiple" placeholder="选择语言要求" style={{ width: '100%' }}>
                  <Select.Option value="chinese_native">中文(母语)</Select.Option>
                  <Select.Option value="english_fluent">英语(流利)</Select.Option>
                  <Select.Option value="english_working">英语(工作能力)</Select.Option>
                  <Select.Option value="japanese">日语</Select.Option>
                  <Select.Option value="korean">韩语</Select.Option>
                  <Select.Option value="french">法语</Select.Option>
                  <Select.Option value="german">德语</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane
            tab={<span><SettingOutlined /> 其他筛选</span>}
            key="other"
          >
            <Card title="其他筛选条件" className="config-card">
              <Form.Item name={['other', 'enabled']} valuePropName="checked" label="启用其他筛选">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Divider orientation="left">年龄要求</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['other', 'minAge']} label="最小年龄">
                    <InputNumber min={18} max={60} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['other', 'maxAge']} label="最大年龄">
                    <InputNumber min={18} max={60} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">地域要求</Divider>

              <Form.Item name={['other', 'locations']} label="期望工作地点">
                <Select mode="multiple" placeholder="选择城市" style={{ width: '100%' }}>
                  <Select.Option value="beijing">北京</Select.Option>
                  <Select.Option value="shanghai">上海</Select.Option>
                  <Select.Option value="guangzhou">广州</Select.Option>
                  <Select.Option value="shenzhen">深圳</Select.Option>
                  <Select.Option value="hangzhou">杭州</Select.Option>
                  <Select.Option value="chengdu">成都</Select.Option>
                  <Select.Option value="wuhan">武汉</Select.Option>
                  <Select.Option value="nanjing">南京</Select.Option>
                  <Select.Option value="suzhou">苏州</Select.Option>
                  <Select.Option value="xian">西安</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name={['other', 'acceptRelocation']} valuePropName="checked" label="接受异地">
                <Switch />
              </Form.Item>

              <Divider orientation="left">其他要求</Divider>

              <Form.Item name={['other', 'availability']} label="到岗时间">
                <Select placeholder="选择到岗时间要求">
                  <Select.Option value="immediately">随时到岗</Select.Option>
                  <Select.Option value="1week">一周内</Select.Option>
                  <Select.Option value="2weeks">两周内</Select.Option>
                  <Select.Option value="1month">一个月内</Select.Option>
                  <Select.Option value="negotiable">可协商</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name={['other', 'keywords']} label="简历关键词">
                <Select mode="tags" placeholder="输入关键词，包含任一关键词的简历将被优先" style={{ width: '100%' }}>
                </Select>
              </Form.Item>

              <Form.Item name={['other', 'excludeKeywords']} label="排除关键词">
                <Select mode="tags" placeholder="包含这些关键词的简历将被排除" style={{ width: '100%' }}>
                </Select>
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>
      </Form>
    </div>
  )
}

export default CleaningConfigPage
