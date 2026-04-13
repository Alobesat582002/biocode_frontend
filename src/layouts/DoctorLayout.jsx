// src/layouts/DoctorLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

const DoctorLayout = () => (
  <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
    <Sidebar />
    {/* Right content area — offset on mobile for the fixed top bar */}
    <div className="flex flex-col flex-1 overflow-hidden md:pt-0 pt-14">
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DoctorLayout;