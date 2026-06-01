import DynamicTable from "../../../shared/components/DynamicTable";

import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAppDispatch from "../../../shared/hooks/useAppDispatch";

import { useAppSelector } from "../../../shared/hooks/customHooks";

import {
  getSharedProductList,
  revokeSharedProduct,
} from "../dashboardSlice";

const defaultPagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

const Sharing = () => {
  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const isBaseSharingPath =
    location.pathname ===
    "/sharing";

  const { loading, error } =
    useAppSelector(
      (state) =>
        state.dashboard
    );

  const [data, setData] =
    useState<any>(null);

  const sharingPages = [
    {
      title:
        "All Requests",

      link:
        "/sharing/all-requests",

      description:
        "View and manage all sharing requests.",

      icon: "fa fa-list",
    },

    {
      title:
        "Group Sharing",

      link:
        "/sharing/group-sharing",

      description:
        "Share chemicals and inventory within groups.",

      icon: "fa fa-users",
    },

    {
      title:
        "External Labs Sharing",

      link:
        "/sharing/lab-sharing",

      description:
        "Manage sharing with external laboratories.",

      icon: "fa fa-flask",
    },
  ];

  const openProductDetails = (
    row: any
  ) => {
    navigate(
      `/inventory/General-inventory/${row.productId}`,
      {
        state: {
          product: row,
        },
      }
    );
  };

  const handleRevert =
    async (
      productId: number,
      inventoryType: string
    ) => {
      try {
        await dispatch(
          revokeSharedProduct({
            productId,
            inventoryType,
          })
        ).unwrap();

        fetchSharedProducts();
      } catch (error) {
        console.error(
          "Revert failed:",
          error
        );
      }
    };

  const fetchSharedProducts =
    async () => {
      try {
        const storedUser =
          localStorage.getItem(
            "user"
          );

        const parsedUser =
          storedUser
            ? JSON.parse(
              storedUser
            )
            : null;

        const response =
          await dispatch(
            getSharedProductList(
              {
                page: 1,
                size: 1000,
                user:
                  parsedUser,
              }
            )
          ).unwrap();

        const responseData =
          response?.data;

        const updatedColumns =
          (
            responseData?.columns ||
            []
          ).map(
            (column: any) => ({
              ...column,

              onClick:
                column.key ===
                  "productName"
                  ? (
                    row: any
                  ) =>
                    openProductDetails(
                      row
                    )
                  : undefined,
            })
          );

        updatedColumns.push({
          key: "actions",

          label: "Actions",
        });

        const formattedList =
          responseData?.list?.map(
            (item: any) => ({
              ...item,

              remark:
                item.remarks ||
                "-",

              actions: (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() =>
                      handleRevert(
                        item.productId,
                        item.inventoryType
                      )
                    }
                  >
                    Revert
                  </button>
                </div>
              ),
            })
          ) || [];

        setData({
          list: formattedList,

          columns:
            updatedColumns,

          pagination:
            responseData?.pagination ||
            defaultPagination,
        });
      } catch (error) {
        console.error(
          "Error fetching shared products:",
          error
        );

        setData({
          list: [],

          columns: [],

          pagination:
            defaultPagination,
        });
      }
    };

  useEffect(() => {
    if (
      isBaseSharingPath
    ) {
      fetchSharedProducts();
    }
  }, [location.pathname]);

  const renderBreadcrumbs =
    () => {
      const segments =
        location.pathname
          .split("/")
          .filter(Boolean);

      return (
        <div className="breadcrumbs mb-3">
          {segments.map(
            (
              segment,
              index
            ) => {
              const path =
                "/" +
                segments
                  .slice(
                    0,
                    index + 1
                  )
                  .join("/");

              const isSharing =
                segment.toLowerCase() ===
                "sharing";

              const label =
                isSharing ? (
                  <>
                    <i
                      className="fa fa-share-alt"
                      style={{
                        marginRight:
                          "4px",
                      }}
                    />

                    Sharing
                  </>
                ) : (
                  decodeURIComponent(
                    segment.replace(
                      /-/g,
                      " "
                    )
                  )
                );

              return (
                <span
                  key={
                    index
                  }
                >
                  <NavLink
                    to={
                      path
                    }
                    style={{
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {
                      label
                    }
                  </NavLink>

                  {index <
                    segments.length -
                    1 &&
                    " / "}
                </span>
              );
            }
          )}
        </div>
      );
    };

  return (
    <>
      {renderBreadcrumbs()}

      {isBaseSharingPath &&
        (!loading ? (
          <>
            <div className="card-container">
              {sharingPages.map(
                (
                  item,
                  index
                ) => (
                  <NavLink
                    className="card"
                    to={
                      item.link
                    }
                    key={
                      index
                    }
                  >
                    <i
                      className={
                        item.icon
                      }
                    ></i>

                    <h3>
                      {
                        item.title
                      }
                    </h3>

                    <p>
                      {
                        item.description
                      }
                    </p>
                  </NavLink>
                )
              )}
            </div>

            {error && (
              <div className="error-message">
                <p>
                  Error:{" "}
                  {String(
                    error
                  )}
                </p>
              </div>
            )}

            <DynamicTable
              data={
                data?.list ||
                []
              }
              columns={
                data?.columns ||
                []
              }
              pagination={
                data?.pagination ||
                defaultPagination
              }
            />
          </>
        ) : (
          <p>
            Loading...
          </p>
        ))}

      <Outlet />
    </>
  );
};

export default Sharing;