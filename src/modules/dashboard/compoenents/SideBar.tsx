import { Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/Eforsch_white.png';
import navigationConfig from "../../../shared/config/navigationConfig";

// Define the props for the Sidebar component
interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  // Filter navigation items based on role
  const visibleTiles = navigationConfig.filter(
    (item) => !item.roles || item.roles.map(role => role.toLowerCase()).includes(role?.toLowerCase())
  );

  return (
    <div className="sidebar">
    <Navbar.Brand href="/"><img src={logo} alt="Logo" className="logo" /></Navbar.Brand>
     <ul>
        {visibleTiles.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.link}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className={item.icon}></i> {item.title}
            </NavLink>
          </li>
        ))}
      </ul>

      <p className='credtids'>Powered By eForsch</p>
    </div>
  );
};

export default Sidebar;
