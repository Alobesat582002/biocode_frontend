// src/router/index.jsx

import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/guards/ProtectedRoute';

// Layouts
import RootLayout    from '../layouts/RootLayout';
import AuthLayout    from '../layouts/AuthLayout';
import PatientLayout from '../layouts/PatientLayout';
import DoctorLayout  from '../layouts/DoctorLayout';

// Auth Pages
import LoginPage         from '../pages/auth/LoginPage';
import RegisterPage      from '../pages/auth/RegisterPage';
import PasswordResetPage from '../pages/auth/PasswordResetPage';

// Patient Pages
import PatientDashboard from '../pages/patient/Dashboard';
import DoctorsList     from '../pages/patient/DoctorsList';
import SmartCalendar     from '../pages/patient/SmartCalendar';
import CommunityPage    from '../pages/patient/CommunityPage';
import TriagePage       from '../pages/patient/Triage';
import BookAppointment  from '../pages/patient/BookAppointment';
import MedicalHistory   from '../pages/patient/MedicalHistory';

// Common Pages
import Profile          from '../pages/common/Profile';
import AIChatbot        from '../pages/patient/AIChatbot';

// Doctor Pages
import DoctorDashboard  from '../pages/doctor/Dashboard';
import Appointments     from '../pages/doctor/Appointments';
import MedicalLogsPage  from '../pages/doctor/MedicalLogsPage';
import CreateMedicalLog from '../pages/doctor/CreateMedicalLog';
import EditMedicalLog   from '../pages/doctor/EditMedicalLog';

// Misc
import UnauthorizedPage from '../pages/misc/UnauthorizedPage';
import NotFoundPage     from '../pages/misc/NotFoundPage';
import LandingPage      from '../pages/misc/LandingPage';

const router = createBrowserRouter([
  {
    // RootLayout wraps everything — provides AuthContext to all children
    element: <RootLayout />,
    children: [

      // ─── Auth Routes ──────────────────────────────────────────────────
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',          element: <LoginPage /> },
          { path: '/register',       element: <RegisterPage /> },
          { path: '/password-reset', element: <PasswordResetPage /> },
        ],
      },

      // ─── Patient Routes ───────────────────────────────────────────────
      {
        element: <ProtectedRoute allowedRoles={['PATIENT']} />,
        children: [
          {
            element: <PatientLayout />,
            children: [
              { path: '/patient/dashboard', element: <PatientDashboard /> },
              { path: '/patient/doctors',   element: <DoctorsList /> },
              { path: '/patient/calendar',  element: <SmartCalendar /> },
              { path: '/patient/community', element: <CommunityPage /> },
              { path: '/patient/triage',    element: <TriagePage /> },
              { path: '/patient/appointments/request', element: <BookAppointment /> },
              { path: '/patient/history',   element: <MedicalHistory /> },
              { path: '/patient/profile',   element: <Profile /> },
              { path: '/patient/chatbot',   element: <AIChatbot /> },
            ],
          },
        ],
      },

      // ─── Doctor Routes ────────────────────────────────────────────────
      {
        element: <ProtectedRoute allowedRoles={['DOCTOR']} />,
        children: [
          {
            element: <DoctorLayout />,
            children: [
              { path: '/doctor/dashboard',    element: <DoctorDashboard /> },
              { path: '/doctor/appointments', element: <Appointments /> },
              { path: '/doctor/logs',         element: <MedicalLogsPage /> },
              { path: '/doctor/logs/create',  element: <CreateMedicalLog /> },
              { path: '/doctor/logs/edit/:id',element: <EditMedicalLog /> },
              { path: '/doctor/profile',      element: <Profile /> },
              { path: '/doctor/community',    element: <CommunityPage /> },
            ],
          },
        ],
      },

      // ─── Misc ─────────────────────────────────────────────────────────
      { path: '/',             element: <LandingPage /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },
      { path: '*',             element: <NotFoundPage /> },
    ],
  },
]);

export default router;