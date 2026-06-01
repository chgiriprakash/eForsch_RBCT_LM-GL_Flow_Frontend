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

import Notebook from './pages/Notebook';
// import WriteNote from './pages/WriteNote';
import NoteBookList from './pages/NoteBookList';

//import BorrowedInventory from './pages/BorrowedInventory';
import NoteBookArchieves from './pages/NoteBookArchieves'; 

import Projects from './pages/Project';
import CreateProject from './pages/CreateProject'
import BorrowedInventory from './pages/BorrowedInventory';
import ProjectArchives from './pages/ProjectArchives';
import ProfilePage from './pages/ProfilePage';

import GroupSharing from './pages/GroupSharing';
import LabSharing from './pages/LabSharing';
import AllRequest from './pages/AllRequest';


const DashRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardPage />}>
      
      {/* Dashboard */}
      <Route path="dashboard" element={<Home />} />

      {/* Users (Protected) */}
      <Route
        path="users"
        element={
          <ProtectedRoute allowedRoles={['admin', 'groupleader', 'labMgmt']}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Inventory Nested Routes */}
      <Route path="inventory" element={<Inventory />}>
        <Route path="general-inventory" element={<GeneralInventory />} />
        <Route path="general-inventory/:id" element={<ProductDetails />} />
        <Route path="fine-chemicals" element={<FineChemicals />} />
        <Route path="fine-chemicals/:id" element={<FineChemicalsDetails />} />
        <Route path="archives" element={<Archieves />} />
        <Route path="borrowed" element={<BorrowedInventory />} />
      </Route>

      {/* Notebook Nested Routes */}
      <Route path="notebook" element={<Notebook />}>
        {/* <Route path="write" element={<WriteNote />} /> */}
        <Route path="my-notes" element={<NoteBookList />} />
        <Route path="notes-archives" element={<NoteBookArchieves />} />
      </Route>

      {/* Other Main Routes (MUST stay inside Dashboard layout) */}
      <Route path="orders" element={<Orders />} />
      {/* <Route path="sharing" element={<Sharing />} /> */}
      {/* <Route path="sharing/:id" element={<Sharing />} /> */}
      <Route path="groups" element={<Groups />} />
      <Route path="protocol" element={<Protocol />} />
      <Route path="budget" element={<Budget />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<ProfilePage />} />

      <Route
        path="sharing"
        element={<Sharing />}
      >
        <Route
          path="all-requests"
          element={<AllRequest />}
        />

        <Route
          path="group-sharing"
          element={<GroupSharing />}
        />

        <Route
          path="lab-sharing"
          element={<LabSharing />}
        />
      </Route>

      <Route path="project" element={<Projects />}>
        <Route path="my-projects" element={<CreateProject />} />
        <Route path="projects-archives" element={<ProjectArchives />} />
      </Route>
    </Route>
  </Routes>
);

export default DashRoutes;