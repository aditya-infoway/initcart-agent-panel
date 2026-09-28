import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Withdraws from "../pages/finance/Withdraws";
import Profile from "../pages/profile/Profile";
import MyNetworkPage from "../pages/business/MyNetworkPage";
import SalesReportPage from "../pages/business/SalesReportPage";
import CommissionReportPage from "../pages/business/ComissionReportPage";
import LevelInformationPage from "../pages/business/LevelInformationPage";
import NotificationsPage from "../pages/business/NotificationsPage";
import DownlineHierarchy from "../pages/network/AgentHierarchyTreeView";
import UplineHierarchy from "../pages/network/UplineHierarchyView";


const AppRouter = () => (
  <BrowserRouter basename="/mlm">
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mynetwork" element={<MyNetworkPage />} />
        <Route path="/salesreport" element={<SalesReportPage />} />
        <Route path="/commissionreport" element={<CommissionReportPage />} />
        <Route path="/levelinformation" element={<LevelInformationPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/withdraws" element={<Withdraws />} />
        <Route path="/AgentHierarchyTreeView" element={<DownlineHierarchy/>}/>
        <Route path="/uplineTreeView" element={<UplineHierarchy/>}/>

        {/* Add more protected routes */}
      </Route>

    </Routes>
  </BrowserRouter>
);

export default AppRouter;
