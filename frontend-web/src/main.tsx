import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import './index.css'

// นำเข้า Redux
import { Provider } from 'react-redux'
import { store } from './redux/Reduxindex'

import { AuthProvider } from './context/auth/AuthProvider' 

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>

      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)