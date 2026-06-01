import {
  useEffect,
  useState,
} from "react";

import DynamicTable from "../../../shared/components/DynamicTable";

import useAppDispatch from "../../../shared/hooks/useAppDispatch";

import { useAppSelector } from "../../../shared/hooks/customHooks";

import {
  getReceiverRequests,
  getDonorRequests,
  approveShareRequest,
  rejectShareRequest,
  markRequestReceived,
} from "../dashboardSlice";
import Modal from "../../../shared/components/Modal";

const defaultPagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

const AllRequest = () => {

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

  const [activeTab, setActiveTab] =
    useState("donor");

  const [donorData, setDonorData] =
    useState<any>(null);

  const [
    receiverData,
    setReceiverData,
  ] = useState<any>(null);

  const [rejectModalOpen, setRejectModalOpen] =
    useState(false);

  const [rejectReason, setRejectReason] =
    useState("");

  const [selectedRequestId, setSelectedRequestId] =
    useState<number | null>(null);

  const [processingIds, setProcessingIds] =
    useState<number[]>([]);

  const handleApprove =
    async (
      requestId: number
    ) => {

      try {

        setProcessingIds((prev) => [
          ...prev,
          requestId,
        ]);

        await dispatch(
          approveShareRequest({
            requestId,
            approvedBy: user,
          })
        ).unwrap();

        alert(
          "Request approved successfully"
        );

        fetchDonorRequests();

      } catch (error) {

        console.error(
          "Approve failed:",
          error
        );

        alert(
          "Failed to approve request"
        );

      } finally {

        setProcessingIds((prev) =>
          prev.filter(
            (id) => id !== requestId
          )
        );
      }
    };

  const handleReject = async (
    requestId: number
  ) => {

    setSelectedRequestId(
      requestId
    );

    setRejectReason("");

    setRejectModalOpen(true);
  };

  const confirmReject =
    async () => {

      if (!rejectReason.trim()) {

        alert(
          "Please enter rejection reason"
        );

        return;
      }

      try {

        setProcessingIds((prev) => [
          ...prev,
          selectedRequestId as number,
        ]);

        await dispatch(
          rejectShareRequest({
            requestId:
              selectedRequestId,

            rejectedBy: user,

            reason:
              rejectReason,
          })
        ).unwrap();

        alert(
          "Request rejected successfully"
        );

        setRejectModalOpen(false);

        fetchDonorRequests();

      } catch (error) {

        console.error(
          "Reject failed:",
          error
        );

        alert(
          "Failed to reject request"
        );

      } finally {

        setProcessingIds((prev) =>
          prev.filter(
            (id) =>
              id !== selectedRequestId
          )
        );
      }
    };

const handleMarkReceived =
  async (
    requestId: number
  ) => {

    try {

      setProcessingIds((prev) => [
        ...prev,
        requestId,
      ]);

      await dispatch(
        markRequestReceived({
          requestId,

          receivedBy:
            user,

          receivedAt:
            new Date()
              .toISOString()
              .replace(
                /\.\d{3}Z$/,
                "+00:00"
              ),

          notes:
            "Received successfully",
        })
      ).unwrap();

      alert(
        "Marked as received"
      );

      fetchReceiverRequests();

    } catch (error) {

      console.error(
        "Mark received failed:",
        error
      );

      alert(
        "Failed to mark received"
      );

    } finally {

      setProcessingIds((prev) =>
        prev.filter(
          (id) => id !== requestId
        )
      );
    }
  };

  const fetchDonorRequests =
    async () => {

      try {

        const response =
          await dispatch(
            getDonorRequests({
              page: 1,

              size: 1000,

              user,

              filters: {},
            })
          ).unwrap();

        const responseData =
          response?.data;

        const updatedColumns = (
          responseData?.columns || []
        ).map(
          (column: any) => ({

            ...column,

            // ✅ Mark date columns
            isDate:
              column.key === "requestedOn" ||
              column.key === "createdAt" ||
              column.key === "updatedAt" ||
              column.key === "receivedAt" ||
              column.key === "approvedAt" ||
              column.key === "rejectedAt",
          })
        );

        const hasActionsColumn =
          updatedColumns.some(
            (col: any) =>
              col.key === "actions"
          );

        if (!hasActionsColumn) {

          updatedColumns.push({
            key: "actions",
            label: "Actions",
          });
        }

        const formattedList =
          responseData?.list?.map(
            (item: any) => ({

              ...item,

              address:
                item?.address
                  ? `${item.address.line1 || ""}
                    ${item.address.line2 || ""}
                    ${item.address.city || ""}
                    ${item.address.state || ""}
                    ${item.address.postalCode || ""}
                    ${item.address.country || ""}`
                      .replace(/\s+/g, " ")
                      .trim()
                  : "-",

              selectedSlot:
                item?.selectedSlot
                  ? `${item.selectedSlot.date || "-"} ${item.selectedSlot.time || ""}`
                  : "-",

              actions: (
                <div className="d-flex gap-2">

                  <button
                    className="btn btn-success btn-sm"

                    disabled={
                      processingIds.includes(
                        item.requestId
                      ) ||
                      item.status === "APPROVED" ||
                      item.status === "REJECTED"
                    }

                    onClick={() =>
                      handleApprove(
                        item.requestId
                      )
                    }
                  >
                    {item.status === "APPROVED"
                      ? "Approved"
                      : "Approve"}
                  </button>

                  <button
                    className="btn btn-danger btn-sm"

                    disabled={
                      processingIds.includes(
                        item.requestId
                      ) ||
                      item.status === "APPROVED" ||
                      item.status === "REJECTED"
                    }

                    onClick={() =>
                      handleReject(
                        item.requestId
                      )
                    }
                  >
                    {item.status === "REJECTED"
                      ? "Rejected"
                      : "Reject"}
                  </button>
                </div>
              ),
            })
          ) || [];

        setDonorData({
          list: formattedList,

          columns:
            updatedColumns,

          pagination:
            responseData?.pagination ||
            defaultPagination,
        });

      } catch (error) {

        console.error(
          "Error fetching donor requests:",
          error
        );
      }
    };

  const fetchReceiverRequests =
    async () => {

      try {

        const response =
          await dispatch(
            getReceiverRequests({
              page: 1,

              size: 1000,

              user,

              filters: {},
            })
          ).unwrap();

        const responseData =
          response?.data;

        const updatedColumns = (
          responseData?.columns || []
        ).map(
          (column: any) => ({

            ...column,

            // ✅ Mark date columns
            isDate:
              column.key === "requestedOn" ||
              column.key === "createdAt" ||
              column.key === "updatedAt" ||
              column.key === "receivedAt" ||
              column.key === "approvedAt" ||
              column.key === "rejectedAt",
          })
        );

        const hasActionsColumn =
          updatedColumns.some(
            (col: any) =>
              col.key === "actions"
          );

        if (!hasActionsColumn) {

          updatedColumns.push({
            key: "actions",
            label: "Actions",
          });
        }

        const formattedList =
          responseData?.list?.map(
            (item: any) => ({

              ...item,

              address:
                item?.address
                  ? `${item.address.line1 || ""}
                    ${item.address.line2 || ""}
                    ${item.address.city || ""}
                    ${item.address.state || ""}
                    ${item.address.postalCode || ""}
                    ${item.address.country || ""}`
                      .replace(/\s+/g, " ")
                      .trim()
                  : "-",

              selectedSlot:
                item?.selectedSlot
                  ? `${item.selectedSlot.date || "-"} ${item.selectedSlot.time || ""}`
                  : "-",

              actions:
                item.status ===
                  "APPROVED" ? (

                  <button
                    className="btn btn-primary btn-sm"

                    disabled={processingIds.includes(
                      item.requestId
                    )}

                    onClick={() =>
                      handleMarkReceived(
                        item.requestId
                      )
                    }
                  >
                    Mark as Received
                  </button>

                ) : (
                  "-"
                ),
            })
          ) || [];

        setReceiverData({
          list: formattedList,

          columns:
            updatedColumns,

          pagination:
            responseData?.pagination ||
            defaultPagination,
        });

      } catch (error) {

        console.error(
          "Error fetching receiver requests:",
          error
        );
      }
    };

  useEffect(() => {

    if (activeTab === "donor") {
      fetchDonorRequests();
    }

    if (activeTab === "receiver") {
      fetchReceiverRequests();
    }

  }, [activeTab]);

  return (
    <>

      <div className="title-header">

        <div className="btn-wrapper">

          <button
            className={
              activeTab === "donor"
                ? "btn-color"
                : "btn btn-outline-primary"
            }

            onClick={() =>
              setActiveTab("donor")
            }
          >
            Requests Awaiting My Approval
          </button>

          <button
            className={
              activeTab === "receiver"
                ? "btn-color"
                : "btn btn-outline-primary"
            }

            onClick={() =>
              setActiveTab("receiver")
            }
          >
            My Requested Chemicals
          </button>
        </div>
      </div>

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

          {activeTab ===
            "donor" && (
              <DynamicTable
                data={
                  donorData?.list ||
                  []
                }

                columns={
                  donorData?.columns ||
                  []
                }

                pagination={
                  donorData?.pagination ||
                  defaultPagination
                }
              />
            )}

          {activeTab ===
            "receiver" && (
              <DynamicTable
                data={
                  receiverData?.list ||
                  []
                }

                columns={
                  receiverData?.columns ||
                  []
                }

                pagination={
                  receiverData?.pagination ||
                  defaultPagination
                }
              />
            )}
        </>
      ) : (
        <p>Loading...</p>
      )}

      {/* ✅ Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() =>
          setRejectModalOpen(false)
        }
        title="Reject Share Request"
      >
        <div className="p-2">

          <label className="form-label">
            Enter rejection reason
          </label>

          <textarea
            className="form-control"

            rows={4}

            value={rejectReason}

            onChange={(e) =>
              setRejectReason(
                e.target.value
              )
            }

            placeholder="Enter rejection reason"
          />

          <div className="d-flex justify-content-end gap-2 mt-3">

            <button
              className="btn btn-secondary"

              onClick={() =>
                setRejectModalOpen(false)
              }
            >
              Cancel
            </button>

            <button
              className="btn btn-danger"

              onClick={confirmReject}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AllRequest;