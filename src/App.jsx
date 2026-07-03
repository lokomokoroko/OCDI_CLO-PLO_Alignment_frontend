import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import MedrepDashboard from './pages/medrep_dashboard';
import AdminDashboard from './pages/admin_dashboard';
import ForgotPassword from './pages/forgot_password';
import ResetPasswordConfirm from './pages/reset_password_confirm';

const theme = createTheme({
  typography: {
    fontFamily: ['Bricolage Grotesque'],
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          height: '100%',
          width: '100%',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>

          {/* DEFAULT ROUTE → GO STRAIGHT TO METRICS */}
          <Route path="/" element={<Navigate to="/metrics" replace />} />

          {/* MAIN PAGES */}
          <Route path="/metrics" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<MedrepDashboard />} />

          {/* AUTH SUPPORT PAGES (optional keep) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/metrics" replace />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}