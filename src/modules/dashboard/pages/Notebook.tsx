import { useLocation, NavLink, Outlet } from "react-router-dom";

const Notebook = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  
  const location = useLocation();
  const isBaseInventoryPath = location.pathname === '/notebook';
  console.log(isBaseInventoryPath)
  const inventoryType = [
    // {
    //   icon: "fa fa-pencil-square-o",
    //   title: "Write New",
    //   link: "/notebook/write",
    //   description: "Create a new note or journal entry.",
    //   roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    // },
    {
      icon: "fa fa-book",
      title: "My Notes",
      link: "/notebook/my-notes",
      description: "View and manage all your notes.",
      roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
      icon: "fa fa-archive",
      title: "Archives",
      link: "/notebook/notes-archives",
      description: "Access your archived notes.",
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
          const isNotebook = segment.toLowerCase() === 'notebook';
          const label = isNotebook ? (
            <i className="fa fa-book" style={{ marginRight: '4px' }} />
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

export default Notebook;