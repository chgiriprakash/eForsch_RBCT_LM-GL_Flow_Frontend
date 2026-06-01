import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import { getNotifications, markNotificationAsRead } from "../dashboardSlice";

// Notification interface
interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  entityId: number;
  entityType: string;
  role: string;
  userFirstName: string | null;
  userLastName: string | null;
  metadata: object;
  createdAt: number;
  groupName: string;
  read: boolean;
}

const Notifications = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [data, setData] = useState<Notification[]>([]);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    fetchNotification();
  }, [dispatch]);

  const fetchNotification = async () => {
    try {
      const result = await dispatch(getNotifications(userRole)).unwrap();
      setData((result || []).slice().reverse()); // Reverse to show latest first
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await dispatch(markNotificationAsRead(notificationId as any)).unwrap();
      // After marking as read, refetch the notifications
      // await fetchNotification();
      navigate("/orders");
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <>
      {error && <p>Error: {error}</p>}
      {!loading ? (
        <div className="notifications-container">
          {data.length > 0 ? (
            <ul className="notifications-list">
              {data.map((notif) => {
                const date = new Date(notif.createdAt);
                const formattedDate = date.toLocaleString();

                return (
                  <li
                    key={notif.notificationId}
                    className={`notification-item ${notif.read ? "read" : "unread"}`}
                  >
                    <div className="notification-header">
                      <h4 className="notification-title">{notif.title}</h4>
                      <span className="notification-date">{formattedDate}</span>
                    </div>
                    <p className="notification-message">{notif.message}</p>
                    <div className="notification-meta">
                      <small>Group: {notif.groupName}</small>
                      <small>Type: {notif.type}</small>
                    </div>
                    {!notif.read && (
                      <button
                        className="mark-read-button"
                        onClick={() => handleMarkAsRead(notif.notificationId)}
                      >
                        Check Orders
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No notifications found.</p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default Notifications;
