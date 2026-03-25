import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { UploadOutlined, FileTextOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons'

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
      label: '简历管理',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ]

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/resumes/')) {
      return '/resumes'
    }
    return path
  }

  return (
    <Sider width={220} style={{ background: '#001529' }}>
      <div className="logo">
        <div className="logo-icon">📋</div>
        <div className="logo-text">简历清洗系统</div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ 
          background: '#001529', 
          color: '#fff',
          borderRight: 'none'
        }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
      <div className="sidebar-footer">
        <div className="version">v2.0.0</div>
        <div className="copyright">© 2024 Resume Cleaner</div>
      </div>
    </Sider>
  )
}

export default Sidebar
