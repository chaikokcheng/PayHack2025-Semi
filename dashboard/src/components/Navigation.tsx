import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  QrCode as QrCodeIcon,
  Payment as PaymentIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactElement;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/qr', label: 'QR Generator', icon: <QrCodeIcon />, badge: 'New' },
  { path: '/payment-tester', label: 'Payment Tester', icon: <PaymentIcon /> },
  { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Logo and Brand */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2 
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
              mr: 2,
            }}
          >
            <WalletIcon sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              PinkPay
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Payment Switch
            </Typography>
          </Box>
        </Box>
        <Chip
          label="Demo Dashboard"
          size="small"
          sx={{
            background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      <Divider sx={{ borderColor: '#E5E7EB' }} />

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: '#FF6B6B08',
                  borderLeft: '3px solid #FF6B6B',
                  '&:hover': {
                    backgroundColor: '#FF6B6B10',
                  },
                },
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : '#6B7280',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? 'primary.main' : '#374151',
                  },
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    height: 20,
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: '#E5E7EB', mt: 2 }} />

      {/* System Status */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SpeedIcon sx={{ color: '#10B981', mr: 1, fontSize: 16 }} />
            <Typography variant="caption" color="#059669" fontWeight={600}>
              System Status
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
            All services operational
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                mr: 1,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography variant="caption" color="#10B981">
              Online
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Navigation; 