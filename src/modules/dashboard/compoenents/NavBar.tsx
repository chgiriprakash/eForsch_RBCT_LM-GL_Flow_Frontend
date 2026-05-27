import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faRightFromBracket,
  faUser,
  faBell,
  faUsers,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../Auth/authSlice";
import { useEffect, useState } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getNotifications } from "../dashboardSlice";

library.add(faRightFromBracket, faUser, faBell, faUsers, faBox);

type Notification = {
  read: boolean;
};

const NavBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");

  const [data, setData] = useState<Notification[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const location = useLocation();
  const [title, setTitle] = useState<string>();

  const hasUnread = data.some((n) => n.read === false);

  useEffect(() => {
    const result = location.pathname.startsWith("/")
      ? location.pathname.slice(1).split("/")[0]
      : location.pathname.split("/")[0];
    setTitle(result);
  }, [location]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    fetchNotification();
  }, []);

  const fetchNotification = async () => {
    try {
      const result = await dispatch(getNotifications(userRole)).unwrap();
      setData(result || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // 🔽 Navigation handlers
  const goTo = (path: string) => navigate(path);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    try {
      if (token) {
        await dispatch(logoutUser(token)).unwrap();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear();
      setUser(null);
      navigate("/");
    }
  };

  return (
    <div className="boxNav d-flex justify-content-between align-items-center">
      <h5 className="mb-0 text-capitalize">{title}</h5>

      <div className="user-info d-flex align-items-center gap-3">
        <span>
          {user ? (
            <Navbar.Text>
              👋 Welcome, <strong>{user.name}</strong>
            </Navbar.Text>
          ) : (
            <span>Please log in</span>
          )}
        </span>

        <Nav className="d-flex align-items-center gap-2">

          {/* 👤 PROFILE */}
          <button
            className="nav-btn"
            onClick={() => goTo("/profile")}
          >
            <FontAwesomeIcon icon={faUser} /> Profile
          </button>

          {/* 👥 USERS */}
          <button
            className="nav-btn"
            onClick={() => goTo("/users")}
          >
            <FontAwesomeIcon icon={faUsers} /> Users
          </button>

          {/* 📦 ORDERS */}
          <button
            className="nav-btn"
            onClick={() => goTo("/orders")}
          >
            <FontAwesomeIcon icon={faBox} /> Orders
          </button>

          {/* 🔔 NOTIFICATIONS */}
          <button
            onClick={() => goTo("/notifications")}
            className={`nav-btn notification ${
              hasUnread ? "animate" : ""
            }`}
          >
            <FontAwesomeIcon icon={faBell} />
            {hasUnread && <span className="dot"></span>}
          </button>

          {/* 🚪 LOGOUT */}
          <button className="nav-btn logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </Nav>
      </div>
    </div>
  );
};

export default NavBar;