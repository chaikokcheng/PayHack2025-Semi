import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import QRGenerator from './components/QRGenerator';
import PaymentTester from './components/PaymentTester';
import Analytics from './components/Analytics';
import Navigation from './components/Navigation';

// Create a modern light theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B6B', // PinkPay brand color
      light: '#FF8A8A',
      dark: '#E04848',
    },
    secondary: {
      main: '#4ECDC4',
      light: '#6FD9D2',
      dark: '#35A3A1',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#1A202C',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#1A202C',
    },
    h3: {
      fontWeight: 600,
      color: '#1A202C',
    },
    h4: {
      fontWeight: 500,
      color: '#1A202C',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box 
          sx={{ 
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
          }}
        >
          <Navigation />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              padding: 3,
              marginLeft: '280px', // Account for fixed sidebar
              overflow: 'auto',
              backgroundColor: '#F8FAFC',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/qr" element={<QRGenerator />} />
              <Route path="/payment-tester" element={<PaymentTester />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
