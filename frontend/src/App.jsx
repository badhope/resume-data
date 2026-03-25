import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import { lazy, Suspense, useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import LoadingSpinner from './components/LoadingSpinner'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const UploadPage = lazy(() => import('./pages/UploadPage'))
const ResumeListPage = lazy(() => import('./pages/ResumeListPage'))
const ResumeDetailPage = lazy(() => import('./pages/ResumeDetailPage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const CleaningReportPage = lazy(() => import('./pages/CleaningReportPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const CleaningConfigPage = lazy(() => import('./pages/CleaningConfigPage'))
const LogsPage = lazy(() => import('./pages/LogsPage'))

const { Content, Header } = Layout

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AppLayout() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>
              {user?.nickname || '用户'}
            </span>
            <a 
              onClick={handleLogout}
              style={{ fontSize: '14px', color: '#1890ff', cursor: 'pointer' }}
            >
              退出
            </a>
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
          <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/resumes" element={<ResumeListPage />} />
            <Route path="/resumes/:id" element={<ResumeDetailPage />} />
            <Route path="/config" element={<CleaningConfigPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<CleaningReportPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/wechat/callback" element={<LoginPage />} />
        <Route path="/*" element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        } />
      </Routes>
    </Suspense>
  )
}

export default App
