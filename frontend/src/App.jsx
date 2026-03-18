import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar'
import UploadPage from './pages/UploadPage'
import ResumeListPage from './pages/ResumeListPage'
import ResumeDetailPage from './pages/ResumeDetailPage'

const { Content, Header } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            简历数据清洗系统
          </h1>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/resumes" element={<ResumeListPage />} />
            <Route path="/resumes/:id" element={<ResumeDetailPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
