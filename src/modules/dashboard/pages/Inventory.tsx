import { useLocation, NavLink, Outlet } from "react-router-dom";

const Inventory = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();
  const isBaseInventoryPath = location.pathname === '/inventory';

  const inventoryType = [
    {
      icon: 'fa fa-flask',
      title: 'General Inventory',
      link: '/inventory/general-inventory',
      description: 'Track and manage all non-chemical lab essentials in one place.',
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
      icon: 'fa fa-flask',
      title: 'Fine Chemicals',
      link: '/inventory/fine-chemicals',
      description: 'Access and monitor all fine chemicals used for experiments and research.',
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
      icon: 'fa fa-archive',
      title: 'Archive',
      link: '/inventory/archives',
      description: 'Store and access past records in one place.',
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
      icon: 'fa fa-exchange',
      title: 'Borrowed',
      link: '/inventory/borrowed',
      description: 'Track all borrowed items and monitor their return status.',
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
  ];

  const filteredConfig = inventoryType.filter(item => item.title !== 'Dashboard');
  const visibleTiles = filteredConfig.filter(
    (item) => !item.roles || item.roles.map(role => role.toLowerCase()).includes(userRole.role?.toLowerCase())
  );

  const renderBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    // Drop raw numeric IDs from the breadcrumb trail
    const displaySegments = segments.filter(s => isNaN(Number(s)));

    return (
      <nav className="breadcrumbs" aria-label="breadcrumb">
        {displaySegments.map((segment, index) => {
          const path = '/' + segments.slice(0, segments.indexOf(segment) + 1).join('/');
          const isLast = index === displaySegments.length - 1;
          const label = segment.toLowerCase() === 'inventory'
            ? <><i className="fa fa-flask" /> Inventory</>
            : decodeURIComponent(segment.replace(/-/g, ' '));

          return (
            <span key={index} className="breadcrumb-item">
              {isLast ? (
                <span className="breadcrumb-current">{label}</span>
              ) : (
                <NavLink to={path} className="breadcrumb-link">{label}</NavLink>
              )}
              {!isLast && <i className="fa fa-chevron-right breadcrumb-sep" />}
            </span>
          );
        })}
      </nav>
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