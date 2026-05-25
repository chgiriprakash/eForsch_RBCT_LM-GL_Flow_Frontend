import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import Inventory from './pages/Inventory';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Protocol from './pages/Protocol';
import Sharing from './pages/Sharing';
import Groups from './pages/Groups';
import ProductDetails from './pages/ProductDetails';
import Users from './pages/Users';
import ProtectedRoute from '../../routes/ProtectedRoute';
import Budget from './pages/Budget';
import FineChemicals from './pages/FineChemicals';
import GeneralInventory from './pages/GeneralInventory';
import FineChemicalsDetails from './pages/FineChemicalsDetails';
import Archieves from './pages/Archieves';
import Notifications from './pages/Notifications';

const DashRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardPage />}>
      <Route path="dashboard" element={<Home />} />

      <Route
        path="Users"
        element={
          <ProtectedRoute allowedRoles={['admin', 'groupleader', 'labMgmt']}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="Archieves"
        element={
          <ProtectedRoute allowedRoles={['admin', 'groupleader', 'labMgmt']}>
            <Archieves />
          </ProtectedRoute>
        }
      /> */}

      {/* Nested Inventory Routes */}
      <Route path="inventory" element={<Inventory />}>
        <Route path="General-inventory" element={<GeneralInventory />} />
        <Route path="General-inventory/:id" element={<ProductDetails />} />
        <Route path="Fine-Chemicals" element={<FineChemicals />} />
        <Route path="Fine-Chemicals/:id" element={<FineChemicalsDetails />} />
        <Route path="Archieves" element={<Archieves />} />
      </Route>

      <Route path="orders" element={<Orders />} />
      <Route path="sharing" element={<Sharing />} />
      <Route path="sharing/:id" element={<Sharing />} />
      <Route path="groups" element={<Groups />} />
      <Route path="protocol" element={<Protocol />} />
      <Route path="budget" element={<Budget />} />
      <Route path="notifications" element={<Notifications />} />
    </Route>
  </Routes>
);

export default DashRoutes;
