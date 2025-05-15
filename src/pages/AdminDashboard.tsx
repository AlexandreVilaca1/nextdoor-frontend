import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { GraphUsers } from '../components/dashboard/GraphUsers';
//import { GraphNeighborhood } from '../components/dashboard/GraphNeighborhood';

export const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="p-6">
          <div className="flex flex-wrap gap-6 justify-between">
            <div className="flex-1 min-w-[450px] h-[400px] bg-white p-6 rounded-lg shadow-lg">
              <GraphUsers />
            </div>
            <div className="flex-1 min-w-[450px] h-[400px] bg-white p-6 rounded-lg shadow-lg">
              {/* <GraphNeighborhood /> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};