import { useLocation, NavLink, Outlet } from "react-router-dom";

const Inventory = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();
  const isBaseInventoryPath = location.pathname === '/inventory';

  const inventoryType = [
    {
      icon: 'fa fa-flask',
      title: 'General Inventory',
      link: '/inventory/General-inventory',
      description: 'Track and manage all non-chemical lab essentials in one place.',
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
      icon: 'fa fa-flask',
      title: 'Fine Chemicals',
      link: '/inventory/Fine-Chemicals',
      description: 'Access and monitor all fine chemicals used for experiments and research.',
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
      icon: 'fa fa-archive',
      title: 'Archive',
      link: '/inventory/Archieves',
      description: 'Store and access past records in one place.',
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
  ];

  const filteredConfig = inventoryType.filter(item => item.title !== 'Dashboard');
  const visibleTiles = filteredConfig.filter(
    (item) => !item.roles || item.roles.map(role => role.toLowerCase()).includes(userRole.role?.toLowerCase())
  );

  const renderBreadcrumbs = () => {
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="breadcrumbs">
      {segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');

        // Replace 'inventory' with flask icon
        const isInventory = segment.toLowerCase() === 'inventory';
        const label = isInventory ? (
          <i className="fa fa-flask" style={{ marginRight: '4px' }} />
        ) : (
          decodeURIComponent(segment.replace(/-/g, ' '))
        );

        return (
          <span key={index}>
            <NavLink to={path} style={{ textTransform: 'capitalize' }}>
              {label}
            </NavLink>
            {index < segments.length - 1 && ' / '}
          </span>
        );
      })}
    </div>
  );
};


  return (
    <>
      {renderBreadcrumbs()}

      {isBaseInventoryPath && (
        <div className="card-container">
          {visibleTiles.map((item, index) => (
            <NavLink className="card" to={item.link} key={index}>
              <i className={item.icon}></i>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </NavLink>
          ))}
        </div>
      )}

      <Outlet />
    </>
  );
};

export default Inventory;