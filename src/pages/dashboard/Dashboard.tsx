import React from "react";
import { ServiceStatistics } from "../../components/ServiceStatistics";
import BusinessAnalytics from "../../components/BusinessAnalytics";
import { RecentActivityLog } from "../../components/RecentActivityLog";
import { DashboardStats } from "../../components/DashboardStats";

const Dashboard = () => {
  return (
    <div>
      <div className="mb-5">
        <DashboardStats />
      </div>

      <div className="mb-5">
        <BusinessAnalytics />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full mt-5">
        <div className="w-full flex">
          <ServiceStatistics
            className="shadow-lg border border-gray-200 rounded-2xl w-full"
            chartColor="primary"
            chartHeight="100%"
          />
        </div>

        <div className="w-full">
          <RecentActivityLog />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
