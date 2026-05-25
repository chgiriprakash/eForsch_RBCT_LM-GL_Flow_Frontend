import React from "react";
import navigationConfig from "../../../shared/config/navigationConfig";
import { NavLink } from "react-router-dom";
import ChartComponent from "./ChartComponent";

interface SummaryData {
  value: number;
  label: string;
  icon: string;
  color: string;
}

interface Card {
  title: string;
  data: SummaryData[];
}

const SummaryCards: React.FC = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  // userRole.role= "admin";

  const cards: Card[] = [
    {
      title: "Chemical Inventory Summary",
      data: [
        { value: 120, label: "Total Chemicals", icon: "fa fa-flask", color: "#50b5f0" },
        { value: 45, label: "Chemicals in Stock", icon: "fa fa-list", color: "#2ecc71" },
        { value: 25, label: "Chemicals Expired", icon: "fa fa-exclamation-triangle", color: "#f39c12" },
        { value: 12, label: "Chemicals Low in Stock", icon: "fa fa-exclamation-circle", color: "#e74c3c" },
      ],
    },
    {
      title: "Orders Summary",
      data: [
        { value: 150, label: "Orders Placed", icon: "fa fa-cart-plus", color: "#f5a623" },
        { value: 50, label: "Orders Shipped", icon: "fa fa-truck", color: "#8f50fb" },
        { value: 20, label: "Orders Pending", icon: "fa fa-hourglass-half", color: "#ff6347" },
        { value: 30, label: "Orders Delivered", icon: "fa fa-check-circle", color: "#2ecc71" },
      ],
    },
  ];

  const filteredConfig = navigationConfig.filter(item => item.title !== 'Dashboard');
  // Filter navigation items based on user role
  const visibleTiles = filteredConfig.filter(
    (item) => !item.roles || item.roles.map(role => role.toLowerCase()).includes(userRole.role?.toLowerCase())
  );

  return (
    <>
      <div className="card-container">
        {visibleTiles.map((item, index) => (
          <NavLink className="card" to={item.link} key={index}>
            <i className={item.icon}></i>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </NavLink>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="summary-cards-container">
        <div className="summary-card">
          <h4>Welcome, {userRole.name} </h4>
          <p>Welcome to Efosrch! We’re thrilled to have you on board!</p>
          <p>With Efosrch, you can:</p>
          <ul>
            <li>
              <strong>Effortlessly manage your inventory</strong> with real-time stock updates.
            </li>
            <li>
              <strong>Simplify order tracking</strong> for a seamless workflow.
            </li>
            <li>
              <strong>Enhance teamwork</strong> by securely sharing data with your team.
            </li>
          </ul>
          <p>
            Dive in and experience how we make laboratory management{" "}
            <strong>smarter, faster, and easier!</strong>
          </p>
        </div>

        {/* Render Admin Overview or Summary Data */}
        {userRole.role === "Admin" ? (
          <div className="summary-card">
            <h4>Inventory and Orders Budget Overview</h4>
            <ChartComponent />
          </div>
        ) : (
          <div className="summary-data-wrap">
            {cards.map((card, index) => (
              <div key={index} className="summary-card-box">
                <h4>{card.title}</h4>
                <div className="summary-data">
                  {card.data.map((item, idx) => (
                    <div key={idx} className="summary-item">
                      <div className="icon">
                        <i style={{ color: item.color }} className={item.icon}></i>
                      </div>
                      <p className="value">{item.value}</p>
                      <p className="label">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SummaryCards;
