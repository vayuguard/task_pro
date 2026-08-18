import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { ProtectedRoute, GuestRoute, MfaRoute } from './router/guards';
import LoginPage from './pages/LoginPage';
import MfaPage from './pages/MfaPage';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import BoardPage from './pages/BoardPage';
import TaskDetailPage from './pages/TaskDetailPage';
import PerformancePage from './pages/PerformancePage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import TimesheetPage from './pages/TimesheetPage';
import ActivityPage from './pages/ActivityPage';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<MfaRoute />}>
        <Route path="/mfa" element={<MfaPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/timesheet" element={<TimesheetPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <DataProvider>
              <UIProvider>
                <AppRoutes />
              </UIProvider>
            </DataProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
