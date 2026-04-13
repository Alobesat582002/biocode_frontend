const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <p className="text-6xl font-bold text-red-500">403</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Access Denied</h1>
      <p className="mt-2 text-gray-500">You don't have permission to view this page.</p>
    </div>
  </div>
);
export default UnauthorizedPage;
