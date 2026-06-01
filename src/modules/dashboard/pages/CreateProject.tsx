import { useState, useEffect, ReactNode } from "react";
import DynamicTable from "../../../shared/components/DynamicTable";
import Modal from "../../../shared/components/Modal";
import { useAppDispatch } from "../../../shared/hooks/useAppDispatch";
// import { useAppSelector } from "../../../shared/hooks/customHooks";

import {
  getBudgetList,
  fetchProjects,
  addProject,
  editProject,
  deleteProject,
  getProjectById,
  uploadProjectAttachments,
  downloadProjectAttachment,
  deleteProjectAttachment,
} from "../dashboardSlice";

import ReusableForm from "../../../shared/components/ReusableForm";
import addProjectConfig from "../../../shared/config/projectConfig";

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface Column {
  hidden: any;
  key: string;
  label: string;
  sortable?: boolean;
  isDate?: boolean;
  onClick?: (row: any) => void;
}

interface ProjectRow {
  projectId: string;
  projectName: string;
  actions?: ReactNode;
}

interface TableObject {
  list: ProjectRow[];
  columns: Column[];
  pagination: Pagination;
}

const defaultPagination: Pagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

// type AddProjectPayload = {
//   project: any;
//   attachments: File[];
// };

// type EditProjectPayload = {
//   projectId: string;
//   project: any;
//   createdDate: string;
//   updatedDate: string;
// };

const CreateProject = () => {
  const dispatch = useAppDispatch();
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");

  const canManage =
    userRole.role === "admin" || userRole.role === "groupleader";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const [editItem, setEditItem] = useState<any | null>(null);
  const [detailsData, setDetailsData] = useState<any>(null);

  const [data, setData] = useState<TableObject>();
  const [budgetOptions, setBudgetOptions] = useState<string[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);

  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
const [newFiles, setNewFiles] = useState<File[]>([]);
const [existingFiles, setExistingFiles] = useState<string[]>([]);

  const initialValues = {
    projectname: "",
    shortdescription: "",
    longDescription: "",
    budgetno: "",
    attachment: [],
  };

  // 🔹 Fetch Budget
  const fetchBudget = async () => {
    try {
      const result = await dispatch(getBudgetList(userRole)).unwrap();
      const options = result.data.list
        .filter((item: any) => item.groupName && item.budgetno)
        .map((item: any) => `${item.groupName}-${item.budgetno}`);
      setBudgetOptions(options);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    }
  };

// 🔹 Open Details Modal
const openProjectDetails = async (row: any) => {
  try {
    setModalLoading(true);
    setIsDetailsOpen(true);

    const result = await dispatch(
      getProjectById({
        projectId: row.projectId,
        groupName: userRole.groupName, // ✅ required by swagger
      })
    ).unwrap();

    const project = result?.data?.[0];
    if (!project) return;

    setDetailsData(project);

  } catch (error) {
    console.error("Details fetch failed:", error);
  } finally {
    setModalLoading(false);
  }
};
  // 🔹 Edit from Details
  const handleEditFromDetails = () => {
    if (!detailsData) return;

    setIsDetailsOpen(false);

    setEditItem({
      projectId: detailsData.projectId,
      projectname: detailsData.projectName,
      shortdescription: detailsData.shortDescription,
      longDescription: detailsData.longDescription,
      budgetno: detailsData.budgetNos?.[0],
      createdDate: detailsData.createdDate,
    });

    setIsEditable(true);
    setIsModalOpen(true);
  };

// 🔹 Fetch Projects
const fetchProjectList = async (page = 1, pageSize = 10) => {
  try {

    // ✅ Updated payload according to swagger
    const payload = {
      groupName: userRole.groupName,
      page,
      pageSize,
      search: "",
    };

    const result = await dispatch(fetchProjects(payload)).unwrap();

    const enhancedColumns: Column[] = (result.columns || [])
      .filter(
        (col: any) =>
          col.key.toLowerCase() !== "shortdescription" &&
          col.key.toLowerCase() !== "longdescription"
      )
      .map((col: any) => ({
        ...col,
        sortable: col.sortable ?? true,
        isDate: col.key?.toLowerCase().includes("date"),
        onClick:
          col.key === "projectName"
            ? (row: any) => openProjectDetails(row)
            : undefined,
      }));

    if (canManage) {
      enhancedColumns.push({
        key: "actions",
        label: "Actions",
        sortable: false,
        hidden: undefined,
      });
    }

    const enhancedList = result.data.map((item: any) => ({
      ...item,

      attachment: item.attachment?.length ? (
        <div className="d-flex flex-column">
          <button
            className="btn btn-color btn-sm"
            onClick={() => openAttachmentModal(item)}
          >
            View All ({item.attachment.length}) Attachment
          </button>
        </div>
      ) : (
        "-"
      ),

      actions: canManage ? (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-color btn-sm"
            onClick={() => handleEdit(item)}
          >
            Edit
          </button>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(item)}
          >
            Delete
          </button>

          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={() => openAttachmentModal(item)}
          >
            + Attachment
          </button>
        </div>
      ) : null,
    }));

    setData({
      list: enhancedList,
      columns: enhancedColumns,
      pagination: result.pagination,
    });

    setPagination(result.pagination);

  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }
};

  useEffect(() => {
    fetchBudget();
    fetchProjectList();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
    setIsEditable(false);
  };

  // ✅ SAVE (Fixed Payload)
const handleSave = async (formData: any) => {
  try {
    if (formData.attachment && formData.attachment.length > 5) {
      alert("You can upload maximum 5 files only");
      return;
    }

    // ✅ Project payload as per API contract
    const projectPayload = {
      projectName: formData.projectname,
      longDescription: formData.longDescription,
      budgetNos: [formData.budgetno],
      role: userRole?.role || "",
      name: userRole?.name || "",
      userId: userRole?.userId || "",
    };

    // ✅ UserDetails payload as per API contract
    const userDetailsPayload = {
      id: userRole?.userId || "",
      email: userRole?.email || "",
      name: userRole?.name || "",
      groupName: userRole?.groupName || "",
      role: userRole?.role || "",
      status: userRole?.status || "ACTIVE",
    };

    if (editItem?.projectId) {
      // ✅ EDIT API
      await dispatch(
        editProject({
          projectId: editItem.projectId,
          project: projectPayload,
          userDetails: userDetailsPayload,
          attachments: formData.attachment || [],
        })
      ).unwrap();
    } else {
      // ✅ ADD API
      const addPayload = {
        project: projectPayload,
        attachments: formData.attachment || [],
        userDetails: userDetailsPayload,
      };

      await dispatch(addProject(addPayload)).unwrap();
    }

    closeModal();
    fetchProjectList(pagination.currentPage, pagination.pageSize);
  } catch (error) {
    console.error("Save failed:", error);
  }
};

  // 🔹 Edit Button (Table)
  const handleEdit = async (item: any) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      setIsEditable(false);

      const result = await dispatch(
        getProjectById({
          projectId: item.projectId,
          groupName: userRole.groupName,
        })
      ).unwrap();
      const project = result?.data?.[0];

      setEditItem({
        projectId: project.projectId,
        projectname: project.projectName,
        shortdescription: project.shortDescription,
        longDescription: project.longDescription,
        budgetno: project.budgetNos?.[0],
        createdDate: project.createdDate,
      });
    } catch (error) {
      console.error("Edit fetch failed:", error);
    } finally {
      setModalLoading(false);
    }
  };
  
const handleDelete = async (item: any) => {
  if (window.confirm("Delete project?")) {

    await dispatch(
      deleteProject({
        projectId: item.projectId,
        userDetails: userRole,
      })
    );

    fetchProjectList(pagination.currentPage, pagination.pageSize);
  }
};

  const onAddClick = () => {
    setEditItem(null);
    setIsEditable(true);
    setIsModalOpen(true);
  };

const handleDownload = (
  projectId: string,
  fileName: string,
  action: "download" | "open" = "download"
) => {

  dispatch(
    downloadProjectAttachment({
      projectId,
      fileName,
      userDetails: userRole,
      action, // ✅ NEW
    })
  );
};

const handleDeleteFile = async (
  projectId: string,
  fileName: string
) => {

  if (!window.confirm("Delete this file?")) return;

  await dispatch(
    deleteProjectAttachment({
      projectId,
      fileName,
      userDetails: userRole, // ✅ required by swagger
    })
  );

  fetchProjectList(
    pagination.currentPage,
    pagination.pageSize
  );
};

const openAttachmentModal = (item: any) => {
  setSelectedProjectId(item.projectId);
  // 🔥 NEW
  setExistingFiles(item.attachment || []);

  setIsAttachmentModalOpen(true);
};

const handleUploadAttachment = async () => {
  if (!selectedProjectId || newFiles.length === 0) return;

  await dispatch(
    uploadProjectAttachments({
      projectId: selectedProjectId,
      files: newFiles,
      userDetails: userRole, // ✅ required by swagger
    })
  );

  setIsAttachmentModalOpen(false);
  setNewFiles([]);

  fetchProjectList();
};

// ✅ filter config BEFORE render
// const formConfig = addProjectConfig(budgetOptions).filter((field: any) => {
//   // hide file upload in edit mode
//   if (editItem && field.type === "file") return false;
//   return true;
// });

const formConfig = addProjectConfig(budgetOptions);

  return (
    <>
       <div className="title-header">
        <div className="btn-wrapper">
          {canManage && (
            <button
              className="btn btn-color"
              onClick={onAddClick}>
              Add Project
            </button>
          )}
        </div>
      </div>

      <DynamicTable
        data={data?.list || []}
        columns={data?.columns || []}
        pagination={pagination}
        canManage={canManage}
        // onAddClick={() => {
        //   setEditItem(null);
        //   setIsEditable(true);
        //   setIsModalOpen(true);
        // }}
      />

      {/* ✅ FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editItem ? "✏️ Edit Project" : "✍️ Create Project"}
      >
        {modalLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {editItem && !isEditable && (
              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-color btn-sm"
                  onClick={() => setIsEditable(true)}
                >
                  Enable Edit
                </button>
              </div>
            )}

            <ReusableForm
              formConfig={formConfig}
              initialValues={editItem || initialValues}
              onSubmit={handleSave}
              disabled={!isEditable && !!editItem}
            />
          </>
        )}
      </Modal>

      {/* ✅ DETAILS MODAL */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="📄 Project Details"
      >
        {modalLoading ? (
          <p>Loading...</p>
        ) : detailsData ? (
          <div className="product-details">
              <table className="product-details-table">
                <thead>
                  <tr>
                    <th colSpan={2}>
                      {detailsData?.projectName || "-"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Budget</td>
                    <td>{detailsData?.budgetNos?.join(", ") || "-"}</td>
                  </tr>

                  <tr>
                    <td>Long Description</td>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: detailsData?.longDescription || "-",
                        }}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>Group</td>
                    <td>{detailsData?.groupName || "-"}</td>
                  </tr>

                  <tr>
                    <td>Created Date</td>
                    <td>{detailsData?.createdDate || "-"}</td>
                  </tr>

                  <tr>
                    <td>Updated Date</td>
                    <td>{detailsData?.updatedDate || "-"}</td>
                  </tr>
                </tbody>
              </table>

              {canManage && (
                <div className="text-end mt-3">
                  <button
                    type="button"
                    className="btn btn-color"
                    onClick={handleEditFromDetails}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
        ) : (
          <p>No data found</p>
        )}
      </Modal>

     <Modal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        title="📎 Add Attachments"
      >
        <div className="files col-12">
          
          {/* 🔹 Header with count */}
          <label className="col-form-label label">
            Attachment ({newFiles.length} / 5)
          </label>

          {/* 🔹 File input */}
          <input
            key={newFiles.length} // reset input
            type="file"
            className="files-dropzone"
            multiple
            disabled={newFiles.length >= 5}
            onChange={(e) => {
              const files = e.target.files
                ? Array.from(e.target.files)
                : [];

              const totalFiles = [...newFiles, ...files];

              if (totalFiles.length > 5) {
                alert("Maximum 5 files allowed");
                return;
              }

              setNewFiles(totalFiles);
            }}
          />

          {/* 🔹 File list (same style as create form) */}
          {newFiles.length > 0 && (
            <div className="mt-2">
              {newFiles.map((file, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>{file.name}</span>

                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      const updated = [...newFiles];
                      updated.splice(index, 1);
                      setNewFiles(updated);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔹 Footer buttons (aligned like main modal) */}
        <div className="col-12 btnWrapper mt-3">
          <button
            className="btn btn-color"
            onClick={handleUploadAttachment}
            disabled={newFiles.length === 0}
          >
            Upload
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setNewFiles([])}
          >
            Reset
          </button>
        </div>
      </Modal>

<Modal
  isOpen={isAttachmentModalOpen}
  onClose={() => setIsAttachmentModalOpen(false)}
  title="📎 Manage Attachments"
>
  <div className="files col-12">

    {/* 🔹 EXISTING FILES */}
    {existingFiles.length > 0 && (
      <>
        <label className="col-form-label label">Existing Files</label>

        <div className="mb-3">
          {existingFiles.map((file, index) => (
            <div
              key={index}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span
                style={{ color: "#0d6efd", cursor: "pointer" }}
                onClick={() =>
                  handleDownload(selectedProjectId!, file, "open")
                }
              >
                <i className="fa fa-paperclip"></i> {file}
              </span>

               <div className="d-flex gap-2">

                {/* 👁 PREVIEW */}
                <button
                  className="btn btn-info btn-sm"
                  title="Preview"
                  onClick={() =>
                    handleDownload(
                      selectedProjectId!,
                      file,
                      "open"
                    )
                  }
                >
                  <i className="fa fa-eye"></i>
                </button>

                {/* ⬇ DOWNLOAD */}
                <button
                  className="btn btn-success btn-sm"
                  title="Download"
                  onClick={() =>
                    handleDownload(
                      selectedProjectId!,
                      file,
                      "download"
                    )
                  }
                >
                  <i className="fa fa-download"></i>
                </button>

                {/* ❌ DELETE */}
                <button
                  className="btn btn-danger btn-sm"
                  title="Delete"
                  onClick={async () => {

                    await handleDeleteFile(
                      selectedProjectId!,
                      file
                    );

                    setExistingFiles((prev) =>
                      prev.filter((f) => f !== file)
                    );
                  }}
                >
                  ✕
                </button>

              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {/* 🔹 ADD NEW FILES (your original logic kept) */}
    <label className="col-form-label label">
      Attachment ({newFiles.length} / 5)
    </label>

    <input
      key={newFiles.length}
      type="file"
      multiple
      disabled={newFiles.length >= 5}
      onChange={(e) => {
        const files = e.target.files
          ? Array.from(e.target.files)
          : [];

        const totalFiles = [...newFiles, ...files];

        if (totalFiles.length > 5) {
          alert("Maximum 5 files allowed");
          return;
        }

        setNewFiles(totalFiles);
      }}
    />

    {newFiles.length > 0 && (
      <div className="mt-2">
        {newFiles.map((file, index) => (
          <div
            key={index}
            className="d-flex justify-content-between align-items-center mb-2"
          >
            <span>{file.name}</span>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                const updated = [...newFiles];
                updated.splice(index, 1);
                setNewFiles(updated);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* 🔹 FOOTER */}
  <div className="text-end mt-3">
    <button
      className="btn btn-color"
      onClick={handleUploadAttachment}
      disabled={newFiles.length === 0}
    >
      Upload
    </button>

    <button
      className="btn btn-secondary ms-2"
      onClick={() => setNewFiles([])}
    >
      Reset
    </button>
  </div>
</Modal>
    </>
  );
};

export default CreateProject;

