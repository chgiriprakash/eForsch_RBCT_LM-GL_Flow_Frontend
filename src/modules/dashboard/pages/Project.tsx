import { useLocation, NavLink, Outlet } from "react-router-dom";

const Project = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  
  const location = useLocation();
  const isBaseInventoryPath = location.pathname === '/project';
  console.log(isBaseInventoryPath)
  const inventoryType = [
    {
      icon: "fa fa-folder-open",
      title: "My Projects",
      link: "/project/my-projects",
      description: "Create a new Project or journal entry.",
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    
    {
      icon: "fa fa-archive",
      title: "Archives",
      link: "/project/projects-archives",
      description: "Access your archived Project.",
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
  ];

  const filteredConfig = inventoryType.filter(item => item.title !== 'Dashboard');
console.log(filteredConfig)

  const visibleTiles = filteredConfig.filter(
    (item) => !item.roles || item.roles.map(role => role.toLowerCase()).includes(userRole.role?.toLowerCase())
  );
  
  const renderBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);

    return (
      <div className="breadcrumbs">
        {segments.map((segment, index) => {
          const path = '/' + segments.slice(0, index + 1).join('/');
          const isNotebook = segment.toLowerCase() === 'project';
          const label = isNotebook ? (
            <i className="fa fa-folder-open" style={{ marginRight: '4px' }} />
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

export default Project;