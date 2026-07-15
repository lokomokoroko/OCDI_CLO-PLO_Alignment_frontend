import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Layout from './pages/layout';
import Login from './pages/login_page';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import Programs from './pages/programs';
import Courses from './pages/courses';
import Alignment from './pages/alignment_matrix';
import TeachingMatrix from './pages/teaching_learning_matrix';
import Approval from './pages/approval';

export const theme = createTheme({
  palette: {
    background: { default: '#f1f3f6' },
    primary: { main: '#4f46e5' },
    success: { main: '#16a34a', light: '#f0fdf4' },
    warning: { main: '#f59e0b', light: '#fffbeb' },
    info: { main: '#3b82f6', light: '#eff6ff' },
    error: { main: '#dc2626', light: '#fef2f2' },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: ['Bricolage Grotesque', 'sans-serif'],
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          height: '100%',
          width: '100%',
          margin: 0,
          padding: 0,
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: 'small',
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

          {/* AUTH PAGES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* MAIN APP */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="programs" element={<Programs />} />
            <Route path="courses" element={<Courses />} />
            <Route path="alignment" element={<Alignment />} />
            <Route path="teaching-matrix" element={<TeachingMatrix />} />
            <Route path="approval" element={<Approval />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>

    </ThemeProvider>
  );
}