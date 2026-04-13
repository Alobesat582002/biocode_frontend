// src/layouts/PatientLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const PatientLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
    <Navbar />
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Outlet />
    </main>
  </div>
);

export default PatientLayout;