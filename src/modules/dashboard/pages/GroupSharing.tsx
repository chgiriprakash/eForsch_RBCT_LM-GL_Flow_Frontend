import DynamicTable from "../../../shared/components/DynamicTable";
import Modal from "../../../shared/components/Modal";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";

import {
  getAllSharedProductList,
  createShareRequest,
} from "../dashboardSlice";

const defaultPagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

const GroupSharing = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } =
    useAppSelector(
      (state) => state.dashboard
    );

  const [data, setData] =
    useState<any>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<any>(null);

  const [quantity, setQuantity] =
    useState("");

  const [selectedAddress, setSelectedAddress] =
  useState("");

  const [selectedAddressObj, setSelectedAddressObj] =
  useState<any>(null);

  const [
    selectedTimeSlots,
    setSelectedTimeSlots,
  ] = useState<any[]>([]);

  const [validationError, setValidationError] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

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

  const handleRequestClick = (
    item: any
  ) => {
    setSelectedProduct(item);

    setQuantity("");

    setValidationError("");

    setSelectedTimeSlots([]);

    // ✅ Save original object for API
    setSelectedAddressObj(
      item?.address || {}
    );

    const formattedAddress = item?.address ? `
      ${item.address.line1 || ""}
      ${item.address.line2 || ""}
      ${item.address.city || ""}
      ${item.address.state || ""}
      ${item.address.postalCode || ""}
      ${item.address.country || ""}
      `
        .replace(/\n/g, ", ")
        .replace(/,\s*,/g, ",")
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, "")
        .trim()
    : "";

  setSelectedAddress(
    formattedAddress
  );

    setIsModalOpen(true);
  };

  const handleTimeSlotChange = (
    slot: any
  ) => {
    const exists =
      selectedTimeSlots.find(
        (s) =>
          s.timeSlotId ===
          slot.timeSlotId
      );

    if (exists) {
      setSelectedTimeSlots(
        selectedTimeSlots.filter(
          (s) =>
            s.timeSlotId !==
            slot.timeSlotId
        )
      );
    } else {
      setSelectedTimeSlots([
        ...selectedTimeSlots,
        slot,
      ]);
    }
  };

  const submitRequest = async () => {
    setValidationError("");

    if (!quantity) {
      setValidationError(
        "Quantity is required"
      );
      return;
    }

    if (
      Number(quantity) >
      Number(selectedProduct?.quantity)
    ) {
      setValidationError(
        `Quantity cannot exceed available quantity (${selectedProduct?.quantity})`
      );
      return;
    }

    if (
      selectedTimeSlots.length === 0
    ) {
      setValidationError(
        "Please select at least one time slot"
      );
      return;
    }

    try {
      await dispatch(
        createShareRequest({
          productId:
            selectedProduct.productId,

          quantity:
            Number(quantity),

          user,

          address: {
            line1: selectedAddressObj?.line1 || "",
            line2: selectedAddressObj?.line2 || "",
            city: selectedAddressObj?.city || "",
            state: selectedAddressObj?.state || "",
            postalCode: selectedAddressObj?.postalCode || "",
            country: selectedAddressObj?.country || "",
          },

          timeSlots:
            selectedTimeSlots,
        })
      ).unwrap();

      alert(
        "Request created successfully"
      );

      setIsModalOpen(false);
      fetchSharedProducts();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to create request"
      );
    }
  };

  const fetchSharedProducts =
    async () => {
      try {
        const response =
          await dispatch(
            getAllSharedProductList({
              page: 1,
              size: 1000,
            })
          ).unwrap();

        const responseData =
          response?.data;

        const updatedColumns = (
          responseData?.columns || []
        ).map((column: any) => ({
          ...column,

          onClick:
            column.key ===
              "productName"
              ? (row: any) =>
                openProductDetails(
                  row
                )
              : undefined,
        }));

        updatedColumns.push({
          key: "actions",
          label: "Actions",
        });

        const formattedList =
          responseData?.list?.map(
            (item: any) => ({
              ...item,

              remark:
                item.remarks || "-",

              actions:
                item.groupName ===
                  user.groupName ? (
                  <span
                    style={{
                      color: "gray",
                      fontWeight: 500,
                    }}
                  >
                    Same Group
                  </span>
                ) : (
                  <button
                    className="btn-color"
                    onClick={() =>
                      handleRequestClick(
                        item
                      )
                    }
                  >
                    Request
                  </button>
                ),
            })
          ) || [];

        setData({
          list: formattedList,

          columns: updatedColumns,

          pagination:
            responseData?.pagination ||
            defaultPagination,
        });
      } catch (error) {
        console.error(
          "Error fetching products:",
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
    fetchSharedProducts();
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
            data={data?.list || []}
            columns={
              data?.columns || []
            }
            pagination={
              data?.pagination ||
              defaultPagination
            }
          />

          <Modal
            isOpen={isModalOpen}
            onClose={() =>
              setIsModalOpen(false)
            }
            title="Create Share Request"
          >
            <div className="mb-3">
              <label>
                Product Name
              </label>

              <input
                type="text"
                className="form-control"
                value={
                  selectedProduct?.productName ||
                  ""
                }
                disabled
              />
            </div>

            <div className="mb-3">
              <label>
                Available Quantity
              </label>

              <input
                type="text"
                className="form-control"
                value={
                  selectedProduct?.quantity ||
                  ""
                }
                disabled
              />
            </div>

            <div className="mb-3">
              <label>
                Request Quantity
              </label>

              <input
                type="number"
                className="form-control"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="mb-3">
              <label>
                Address
              </label>

              <textarea
                className="form-control"
                value={
                  selectedAddress
                }
                disabled
              />
            </div>

            <div className="mb-3">
              <label>
                Select Time Slots
              </label>

              {selectedProduct?.timeSlots?.map(
                (slot: any) => (
                  <div
                    key={
                      slot.timeSlotId
                    }
                    className="form-check"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onChange={() =>
                        handleTimeSlotChange(
                          slot
                        )
                      }
                    />

                    <label className="form-check-label">
                     <strong>{
                        slot.day
                      }</strong>{" "}
                      -{" "}
                      {
                        slot.startTime
                      }{" "}
                      -{" "}
                      {
                        slot.endTime
                      }
                    </label>
                  </div>
                )
              )}
            </div>

            {validationError && (
              <div
                style={{
                  color: "red",
                  marginBottom: "10px",
                }}
              >
                {
                  validationError
                }
              </div>
            )}

            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setIsModalOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={
                  submitRequest
                }
              >
                Submit Request
              </button>
            </div>
          </Modal>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default GroupSharing;