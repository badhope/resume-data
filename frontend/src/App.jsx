import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar'
import UploadPage from './pages/UploadPage'
import ResumeListPage from './pages/ResumeListPage'
import ResumeDetailPage from './pages/ResumeDetailPage'

const { Content, Header } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#FAFBFC' }}>
      <Sidebar />
      <Layout style={{ background: '#FAFBFC' }}>
        <Header style={{
          background: '#fff',
          padding: '0 32px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: '#1F2937',
            letterSpacing: '-0.01em'
          }}>
            简历数据清洗系统
          </h1>
          <div style={{
            fontSize: '14px',
            color: '#6B7280',
            fontWeight: 400
          }}>
            智能 · 高效 · 专业
          </div>
        </Header>
        <Content style={{
          margin: '24px 32px',
          padding: '28px 32px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          minHeight: 'calc(100vh - 112px)'
        }}>
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
