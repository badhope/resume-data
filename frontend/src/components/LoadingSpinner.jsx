import { Spin } from 'antd'

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      width: '100%'
    }}>
      <Spin size="large" />
    </div>
  )
}

export default LoadingSpinner
