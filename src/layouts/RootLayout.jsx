import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

const RootLayout = () => (
  <ThemeProvider>
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  </ThemeProvider>
);

export default RootLayout;