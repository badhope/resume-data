import axios from 'axios'

const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

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

export default apiClient
