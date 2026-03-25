import axios from 'axios'

const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const login = async (account, password) => {
  const response = await apiClient.post('/auth/login/json', { account, password })
  return response.data
}

export const register = async (data) => {
  const response = await apiClient.post('/auth/register', data)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export const updateCurrentUser = async (data) => {
  const response = await apiClient.put('/auth/me', null, { params: data })
  return response.data
}

export const wechatLogin = async (code) => {
  const response = await apiClient.post('/auth/wechat/login', { code })
  return response.data
}

export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const uploadBatchFiles = async (files) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  const response = await apiClient.post('/upload/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const parseResume = async (fileId, filePath = null) => {
  const params = filePath ? { file_path: filePath } : {}
  const response = await apiClient.post(`/resume/parse/${fileId}`, null, { params })
  return response.data
}

export const getResume = async (resumeId) => {
  const response = await apiClient.get(`/resume/${resumeId}`)
  return response.data
}

export const getResumeList = async (skip = 0, limit = 10) => {
  const response = await apiClient.get('/resume', { params: { skip, limit } })
  return response.data
}

export const deleteResume = async (resumeId) => {
  const response = await apiClient.delete(`/resume/${resumeId}`)
  return response.data
}

export const updateResume = async (resumeId, data) => {
  const response = await apiClient.put(`/resume/${resumeId}`, { data })
  return response.data
}

export const exportJson = async (resumeId) => {
  const response = await apiClient.get(`/export/json/${resumeId}`, {
    responseType: 'blob',
  })
  return response.data
}

export const exportExcel = async (resumeId) => {
  const response = await apiClient.get(`/export/excel/${resumeId}`, {
    responseType: 'blob',
  })
  return response.data
}

export const exportCsv = async (resumeId) => {
  const response = await apiClient.get(`/export/csv/${resumeId}`, {
    responseType: 'blob',
  })
  return response.data
}

export const exportBatchJson = async (resumeIds) => {
  const response = await apiClient.get('/export/batch/json', {
    params: { resume_ids: resumeIds.join(',') },
    responseType: 'blob',
  })
  return response.data
}

export const exportBatchExcel = async (resumeIds) => {
  const response = await apiClient.get('/export/batch/excel', {
    params: { resume_ids: resumeIds.join(',') },
    responseType: 'blob',
  })
  return response.data
}

export const getCleanOptions = async () => {
  const response = await apiClient.get('/config/options')
  return response.data
}

export const updateCleanOptions = async (options) => {
  const response = await apiClient.put('/config/options', options)
  return response.data
}

export const getStatistics = async () => {
  const response = await apiClient.get('/config/statistics')
  return response.data
}

export const getExportTemplates = async () => {
  const response = await apiClient.get('/config/templates')
  return response.data
}

export const createExportTemplate = async (template) => {
  const response = await apiClient.post('/config/templates', template)
  return response.data
}

export const deleteExportTemplate = async (templateId) => {
  const response = await apiClient.delete(`/config/templates/${templateId}`)
  return response.data
}

export const getHistory = async (skip = 0, limit = 20) => {
  const response = await apiClient.get('/config/history', { params: { skip, limit } })
  return response.data
}

export { apiClient }
export default apiClient
