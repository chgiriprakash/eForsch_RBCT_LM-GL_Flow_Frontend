import {
  useEffect,
  useState,
} from "react";

import DynamicTable from "../../../shared/components/DynamicTable";

import useAppDispatch from "../../../shared/hooks/useAppDispatch";

import { useAppSelector } from "../../../shared/hooks/customHooks";

import {
  getBorrowedInventory,
} from "../dashboardSlice";

const defaultPagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

const BorrowedInventory = () => {

  const dispatch =
    useAppDispatch();

  const { loading, error } =
    useAppSelector(
      (state) =>
        state.dashboard
    );

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      ) || "{}"
    );

  const [tableData, setTableData] =
    useState<any>(null);

  // ✅ Fetch Borrowed Inventory
const fetchBorrowedInventory =
  async () => {

    try {

      const response =
        await dispatch(
          getBorrowedInventory({
            page: 1,

            size: 1000,

            user,

            filters: {},
          })
        ).unwrap();

      const responseData =
        response?.data;

      // ✅ Format columns
      const updatedColumns = (
        responseData?.columns || []
      ).map(
        (column: any) => ({

          ...column,

          // ✅ Fix date formatting
          isDate:
            column.key === "receivedAt" ||
            column.key === "createdAt" ||
            column.key === "updatedAt",
        })
      );

      // ✅ Format rows properly
      const formattedList =
        responseData?.list?.map(
          (item: any) => ({

            ...item,

            // ✅ Address formatting fix
            address:
              item?.address
                ? `${item.address.city || ""}
                   ${item.address.state || ""}
                   ${item.address.country || ""}`
                    .replace(/\s+/g, " ")
                    .trim()
                : "-",

            // ✅ Selected Slot formatting fix
            selectedSlot:
              item?.selectedSlot
                ? `${item.selectedSlot.date || "-"} ${item.selectedSlot.time || ""}`
                    .trim()
                : "-",

            // ✅ Prevent undefined/null
            productName:
              item?.productName || "-",

            borrowedQuantity:
              item?.borrowedQuantity || "-",

            donorGroup:
              item?.donorGroup || "-",

            status:
              item?.status || "-",
          })
        ) || [];

      setTableData({
        list: formattedList,

        columns:
          updatedColumns,

        pagination:
          responseData?.pagination ||
          defaultPagination,
      });

    } catch (error) {

      console.error(
        "Error fetching borrowed inventory:",
        error
      );
    }
  };

  useEffect(() => {

    fetchBorrowedInventory();

  }, []);

  return (
    <>

      {!loading ? (
        <>

          {error && (
            <div className="error-message">
              <p>
                Error:{" "}
                {String(error)}
              </p>
            </div>
          )}

          <DynamicTable
            data={
              tableData?.list ||
              []
            }

            columns={
              tableData?.columns ||
              []
            }

            pagination={
              tableData?.pagination ||
              defaultPagination
            }
          />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default BorrowedInventory;