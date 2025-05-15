export const DashboardHeader = () => {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Admin</span>
        <img
          src="/man.png"
          alt="person"
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
    </header>
  );
};
