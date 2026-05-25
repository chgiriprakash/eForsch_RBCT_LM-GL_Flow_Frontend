
import { Outlet } from 'react-router-dom';
import Sidebar from '../compoenents/SideBar';
import NavBar from '../compoenents/NavBar';


const DashboardPage = () => {
  const userRole = JSON.parse(localStorage.getItem('user') || ''); 
  // userRole.role = 'admin';

  return (
    <div className="d-flex">
      {userRole ? (
        <Sidebar role={userRole.role} />
        ) : (
          <p>No user data found. Please log in.</p>
        )}
      
      <div className="side-box flex-grow-1">
        <div className="container">
          <NavBar />
          <Outlet /> {/* Render nested routes here */}
        </div>
      </div>
    </div>
  )
};
  
export default DashboardPage;
  