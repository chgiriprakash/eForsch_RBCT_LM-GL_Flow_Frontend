import { useEffect, useState } from "react";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import DynamicTable from "../../../shared/components/DynamicTable";
import Modal from "../../../shared/components/Modal";

import {
  fetchNotebooks,
  deleteNotebook,
  getNotebookById,
  createNotebook,
  updateNotebook,
  fetchProjects,
  getBudgetList,
  uploadNotebookAttachments,
  downloadNotebookAttachment,
  getNotebookVersions,
  deleteNotebookAttachment,
} from "../dashboardSlice";

import ReusableForm from "../../../shared/components/ReusableForm";
import addNotesConfig from "../../../shared/config/notesConfig";

const NoteBookList = () => {
  const dispatch = useAppDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { loading, error } = useAppSelector((state) => state.dashboard);

  const [data, setData] = useState<any>(null);
  const [detailsData, setDetailsData] = useState<any>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  const [editItem, setEditItem] = useState<any>(null);

  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [budgetOptions, setBudgetOptions] = useState<string[]>([]);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
const [newFiles, setNewFiles] = useState<File[]>([]);

const [isVersionsOpen, setIsVersionsOpen] = useState(false);
const [versionsData, setVersionsData] = useState<any[]>([]);
const [existingFiles, setExistingFiles] = useState<string[]>([]);

  const initialValues = {
    projectId: "",
    experimentTitle: "",
    budgetIds: "",
    noteDate: "",
    content: "",
    attachment: [],
  };

  // ✅ filter config BEFORE render
  const formConfig = addNotesConfig(
    projectOptions,
    budgetOptions
  ).filter((field: any) => {
    // hide file upload in edit mode
    if (editItem && field.type === "file") return false;
    return true;
  });

  // ============================
  // FETCH PROJECTS + BUDGETS
  // ============================
  useEffect(() => {
    fetchNotebooksList();
    fetchProjectsList();
    fetchBudgets();
  }, []);

  const fetchProjectsList = async () => {
    const result = await dispatch(
      fetchProjects({ groupName: user.groupName, page: 1, pageSize: 1000 })
    ).unwrap();

    const options = result.data.map(
      (p: any) => `${p.projectName}`
    );

    setProjectOptions(options);
  };

  const fetchBudgets = async () => {
    const result = await dispatch(getBudgetList(user)).unwrap();

    const options = result.data.list.map(
      (b: any) => `${b.groupName}-${b.budgetno}`
    );

    setBudgetOptions(options);
  };

  // ============================
  // FETCH LIST
  // ============================
const fetchNotebooksList = async () => {

  const result = await dispatch(
    fetchNotebooks({
      page: 1,
      size: 10000,

      // ✅ required swagger headers
      userId: user?.userId,
      groupName: user?.groupName,
      role: user?.role,
    })
  ).unwrap();

  const columns = (result.columns || [])
    .filter((col: any) => col.key !== "projectId")
    .map((col: any) => ({
      ...col,
      onClick:
        col.key === "experimentTitle"
          ? (row: any) => openDetails(row)
          : undefined,
    }));

  columns.push({ key: "actions", label: "Actions" });

  const list = result.data.map((item: any) => ({
    ...item,

    // ✅ Attachments column
    attachment: item.attachment?.length ? (
      <div className="d-flex flex-column">

        <button
          className="btn btn-color btn-sm"
          onClick={() =>
            openAttachmentModal(item.noteId, item.attachment)
          }
        >
          View All ({item.attachment.length})
        </button>

      </div>
    ) : (
      "-"
    ),

    // ✅ Actions
    actions: (
      <div className="d-flex gap-2">

        <button
          className="btn btn-color btn-sm"
          onClick={() => handleEdit(item.noteId)}
        >
          Edit
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(item.noteId)}
        >
          Delete
        </button>

        {/* 🔥 ADD ATTACHMENT */}
        <button
          className="btn btn-success btn-sm"
          onClick={() =>
            openAttachmentModal(item.noteId, item.attachment)
          }
        >
          + Attachment
        </button>

        {/* 🔥 VERSIONS */}
        <button
          className="btn btn-info btn-sm"
          onClick={() => openVersions(item.noteId)}
        >
          Versions
        </button>

      </div>
    ),
  }));

  setData({
    list,
    columns,
    pagination: result.pagination,
  });
};

  // ============================
  // DETAILS
  // ============================
  const openDetails = async (row: any) => {

    setModalLoading(true);
    setIsDetailsOpen(true);

    const result = await dispatch(
      getNotebookById({
        noteId: row.noteId,

        // ✅ required swagger headers
        userId: user?.id,
        groupName: user?.groupName,
        role: user?.role,
      })
    ).unwrap();

    setDetailsData(result.data);

    setModalLoading(false);
  };

  // ============================
  // ADD NOTE
  // ============================
  const handleAdd = () => {
    setEditItem(null);
    setIsEditable(true);
    setIsFormOpen(true);
  };

 const handleDeleteFile = async (
  noteId: number,
  fileName: string
) => {

  if (!window.confirm("Delete this file?")) return;

  try {

    await dispatch(
      deleteNotebookAttachment({
        noteId,
        fileName,

        // ✅ required swagger headers
        userId: user?.id,
        groupName: user?.groupName,
        role: user?.role,
      })
    ).unwrap();

    fetchNotebooksList();

  } catch (err) {

    alert("Failed to delete attachment");
  }
};

  // ============================
  // EDIT
  // ============================
  const handleEdit = async (noteId: number) => {
    setModalLoading(true);
    setIsFormOpen(true);
    setIsEditable(false);

    const result = await dispatch(
      getNotebookById({
        noteId,
        userId: user?.id,
        groupName: user?.groupName,
        role: user?.role,
      })
    ).unwrap();
    const note = result.data;

    setEditItem({
      noteId: note.noteId,
      projectId: note.projectId,
      experimentTitle: note.experimentTitle,
      budgetIds: note.budgetIds?.[0],
      noteDate: note.noteDate,
      content: note.content?.html,
    });

    setModalLoading(false);
  };

  const handleEditFromDetails = () => {
    setIsDetailsOpen(false);
    handleEdit(detailsData.noteId);
  };

  // ============================
  // SAVE
  // ============================
const handleSave = async (formData: any) => {

  const notePayload = {
    projectId: formData.projectId,
    experimentTitle: formData.experimentTitle,

    budgetIds: [formData.budgetIds],

    noteDate: new Date().toISOString().split("T")[0],

    content: {
      html: formData.content,
      plainText: formData.content.replace(/<[^>]+>/g, ""),
    },

    groupName: user.groupName,
    role: user.role,
    name: user.name,
    userId: user.id,
  };

  console.log("Payload:", notePayload);

  // ✅ EDIT
  if (editItem?.noteId) {

    await dispatch(
      updateNotebook({
        noteId: editItem.noteId,
        data: notePayload,
      })
    );
  }

  // ✅ ADD
  else {

    const files = formData.attachment || [];

    if (files.length > 5) {
      alert("Max 5 files allowed");
      return;
    }

    await dispatch(
      createNotebook({
        note: notePayload,
        userDetails: user,
        attachments: files,
      })
    );
  }

  setIsFormOpen(false);

  fetchNotebooksList();
};

  // ============================
  // DELETE
  // ============================
  const handleDelete = async (id: number) => {

    if (!window.confirm("Delete note?")) return;

    await dispatch(
      deleteNotebook({
        noteId: id,

        // ✅ swagger required headers
        userId: user.id,
        groupName: user.groupName,
        role: user.role,
      })
    );

    fetchNotebooksList();
  };

  // 🔽 Download
const handleDownload = (
  noteId: number,
  fileName: string,
  action: "download" | "open" = "download"
) => {

  dispatch(
    downloadNotebookAttachment({
      noteId,
      fileName,

      // ✅ required swagger headers
      userId: user?.id,
      groupName: user?.groupName,
      role: user?.role,

      // ✅ NEW
      action,
    })
  );
};

// 🔽 Open upload modal
const openAttachmentModal = (noteId: number, attachments?: string[]) => {
  setSelectedNoteId(noteId);

  // ✅ NEW
  setExistingFiles(attachments || []);

  setIsAttachmentModalOpen(true);
};

// 🔽 Upload
const handleUploadAttachment = async () => {

  if (!selectedNoteId || newFiles.length === 0) return;

  await dispatch(
    uploadNotebookAttachments({
      noteId: selectedNoteId,

      files: newFiles,

      // ✅ required by swagger
      userDetails: user,
    })
  );

  setIsAttachmentModalOpen(false);

  setNewFiles([]);

  fetchNotebooksList();
};

// 🔽 Versions
const openVersions = async (noteId: number) => {
  const result = await dispatch(
    getNotebookVersions({
      noteId,

      // ✅ optional pagination
      page: 1,
      size: 10,

      // ✅ required swagger headers
      userId: user?.id,
      groupName: user?.groupName,
      role: user?.role,
    })
  ).unwrap();

  setVersionsData(result.data || []);
  setIsVersionsOpen(true);
};

  return (
    <>
      {error && <p>Error: {error}</p>}

      <div className="text-end mb-2">
        <button className="btn btn-color" onClick={handleAdd}>
          Add Note
        </button>
      </div>

      {!loading && data ? (
        <DynamicTable
          data={data.list}
          columns={data.columns}
          pagination={data.pagination}
        />
      ) : (
        <p>Loading...</p>
      )}

      {/* ================= FORM MODAL ================= */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editItem ? "✏️ Edit Note" : "✍️ Add Note"}
      >
        {modalLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {editItem && !isEditable && (
              <div className="text-end">
                <button
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

      {/* ================= DETAILS MODAL ================= */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="📄 Note Details"
      >
        {modalLoading ? (
          <p>Loading...</p>
        ) : detailsData ? (
          <div className="product-details">
            <table className="product-details-table">
              <thead>
                <tr>
                  <th colSpan={2}>{detailsData.experimentTitle}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Project</td>
                  <td>{detailsData.projectId}</td>
                </tr>

                <tr>
                  <td>Experiment Title</td>
                  <td>{detailsData.experimentTitle}</td>
                </tr>

                <tr>
                  <td>Budget</td>
                  <td>{detailsData.budgetIds?.join(", ")}</td>
                </tr>

                <tr>
                  <td>Date</td>
                  <td>{detailsData.noteDate}</td>
                </tr>

                {/* <tr>
                  <td>Group</td>
                  <td>{detailsData.groupName}</td>
                </tr> */}

                <tr>
                  <td>Content</td>
                  <td>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: detailsData.content?.html,
                      }}
                    />
                  </td>
                </tr>

                {/* 🔥 NEW: ATTACHMENTS */}
                <tr>
                  <td>Attachments</td>
                  <td>
                    {detailsData.attachment?.length ? (
                      <div className="d-flex flex-column gap-2">
                        {detailsData.attachment.map((file: string, i: number) => (
                          <span
                            key={i}
                            style={{ color: "#0d6efd", cursor: "pointer" }}
                            onClick={() =>
                              handleDownload(detailsData.noteId, file)
                            }
                          >
                            📎 {file}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-end mt-3">
              <button className="btn btn-color" onClick={handleEditFromDetails}>
                Edit
              </button>
            </div>
          </div>
        ) : (
          <p>No data</p>
        )}
      </Modal>


      <Modal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        title="📎 Add Attachments"
      >
        <div className="files col-12">
          <label>Attachment ({newFiles.length} / 5)</label>

          <input
            type="file"
            multiple
            disabled={newFiles.length >= 5}
            onChange={(e) => {
              const files = e.target.files
                ? Array.from(e.target.files)
                : [];

              const total = [...newFiles, ...files];

              if (total.length > 5) {
                alert("Max 5 files allowed");
                return;
              }

              setNewFiles(total);
            }}
          />

          <div className="mt-2">
            {newFiles.map((file, i) => (
              <div
                key={i}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{file.name}</span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    const updated = [...newFiles];
                    updated.splice(i, 1);
                    setNewFiles(updated);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-end mt-3">
          <button className="btn btn-color" onClick={handleUploadAttachment}>
            Upload
          </button>
        </div>
      </Modal>


      <Modal
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        title="📜 Versions"
      >
        {versionsData.length ? (
          <div className="product-details">
            <table className="product-details-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Edited By</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {[...versionsData]
                  .sort((a, b) => b.version - a.version) // latest first
                  .map((v: any, i: number) => (
                    <tr key={i}>
                      <td>Version {v.version}</td>
                      <td>{v.editedBy}</td>
                      <td>
                        {new Date(v.editedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No versions found</p>
        )}
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
        <label>Existing Files</label>

        <div className="mb-3">
          {existingFiles.map((file, i) => (
            <div
              key={i}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span
                style={{ color: "#0d6efd", cursor: "pointer" }}
                onClick={() => handleDownload(selectedNoteId!, file, "open")}
              >
                <i className="fa fa-paperclip"></i> {file}
              </span>

               <div className="d-flex gap-2">

    {/* 👁 PREVIEW */}
    <button
      className="btn btn-info btn-sm"
      title="Preview"
      onClick={() =>
        handleDownload(selectedNoteId!, file, "open")
      }
    >
      <i className="fa fa-eye"></i>
    </button>

    {/* ⬇ DOWNLOAD */}
    <button
      className="btn btn-success btn-sm"
      title="Download"
      onClick={() =>
        handleDownload(selectedNoteId!, file, "download")
      }
    >
      <i className="fa fa-download"></i>
    </button>

    {/* ❌ DELETE */}
    <button
      className="btn btn-danger btn-sm"
      title="Delete"
      onClick={async () => {

        await handleDeleteFile(selectedNoteId!, file);

        // instant UI update
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

    {/* 🔹 NEW FILES (existing logic kept) */}
    <label>Attachment ({newFiles.length} / 5)</label>

    <input
      type="file"
      multiple
      disabled={newFiles.length >= 5}
      onChange={(e) => {
        const files = e.target.files
          ? Array.from(e.target.files)
          : [];

        const total = [...newFiles, ...files];

        if (total.length > 5) {
          alert("Max 5 files allowed");
          return;
        }

        setNewFiles(total);
      }}
    />

    <div className="mt-2">
      {newFiles.map((file, i) => (
        <div
          key={i}
          className="d-flex justify-content-between align-items-center mb-2"
        >
          <span>{file.name}</span>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              const updated = [...newFiles];
              updated.splice(i, 1);
              setNewFiles(updated);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>

  <div className="text-end mt-3">
    <button
      className="btn btn-color"
      onClick={handleUploadAttachment}
      disabled={newFiles.length === 0}
    >
      Upload
    </button>
  </div>
</Modal>
    </>
  );
};

export default NoteBookList;

