import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { UploadOutlined, FileTextOutlined, HomeOutlined } from '@ant-design/icons'

const { Sider } = Layout

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: '上传简历',
    },
    {
      key: '/resumes',
      icon: <FileTextOutlined />,
      label: '简历列表',
    },
  ]

  return (
    <Sider width={200} style={{ background: '#001529' }}>
      <div className="logo">
        简历清洗系统
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ background: '#001529', color: '#fff' }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  )
}

export default Sidebar
