import { library } from "@fortawesome/fontawesome-svg-core";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../Auth/authSlice";
import { useEffect, useState } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getNotifications } from "../dashboardSlice";

// Add icons to the library so they can be used in components
library.add(faRightFromBracket);

type Notification = {
  read: boolean;
  // Add other properties as needed
};

const NavBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const [data, setData] = useState<Notification[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const location = useLocation();
  const [title, setTitle] = useState<string | undefined>();
  // Determine if there are unread notifications
  const hasUnread = data.some(notification => notification.read === false);

  useEffect(() => {
    const result = location.pathname.startsWith("/")
      ? location.pathname.slice(1).split("/")[0]
      : location.pathname.split("/")[0];
    setTitle(result);
  }, [location]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchNotification();
  }, [dispatch]);

  const fetchNotification = async () => {
    try {
      const result = await dispatch(getNotifications(userRole)).unwrap();
      setData(result || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleNotificationNavigation = () => {
    navigate("/notifications");
  }

  const handleUserNavigation = () => {
    navigate("/Users");
  }

  const handleOrdersNavigation = () => {
    navigate("/orders");
  }

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("No auth token found, logging out user.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
      return;
    }

    try {
      console.log("Logging out user...");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      await dispatch(logoutUser(token)).unwrap();
      console.log("Logout successful!");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    } finally {
      console.log("Clearing localStorage and redirecting to home page.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    }
  };

  return (
    <div className="boxNav d-flex justify-content-between align-items-center">
      <h5>{title}</h5>

      <div className="user-info d-flex align-items-center">
        <span className="mr-3">
          {user ? (
            <Navbar.Text>Welcome, {user.name}</Navbar.Text>
          ) : (
            <p>No user data found. Please log in.</p>
          )}
        </span>
        <Nav>
          <button onClick={handleUserNavigation}>
            <strong>Users</strong>
            {/* <FontAwesomeIcon icon={faRightFromBracket} /> */}
          </button>
          | 
          <button onClick={handleOrdersNavigation}>
            <strong>Orders</strong>
            {/* <FontAwesomeIcon icon={faRightFromBracket} /> */}
          </button>
          | 
          <button 
            onClick={handleNotificationNavigation} 
            className={hasUnread ? "notification-button animate" : "notification-button"}
          >
            <i className="fa fa-bell text-danger"></i>
          </button>
          | 
          <button onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </Nav>
      </div>
    </div>
  );
};

export default NavBar;
