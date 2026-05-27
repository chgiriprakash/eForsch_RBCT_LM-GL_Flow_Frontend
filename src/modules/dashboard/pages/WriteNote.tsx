import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { useAppDispatch } from "../../../shared/hooks/useAppDispatch";
import {
  getNotebookById,
  updateNotebook,
  createNotebook,
  fetchProjects,
} from "../dashboardSlice";

const WriteNote = () => {
  const location = useLocation();
  const noteId = location.state?.noteId; // coming from navigate state
  const isEditMode = Boolean(noteId);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [projects, setProjects] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [budgetIds, setBudgetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // format current date/time
  const [openedAt] = useState(new Date().toLocaleString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }));

  // ============================
  // Fetch Projects
  // ============================
  useEffect(() => {
    fetchProjectList();
  }, []);

  const fetchProjectList = async () => {
    try {
      const payload = {
        groupName: user.groupName,
        page: 1,
        pageSize: 1000,
      };

      const result = await dispatch(fetchProjects(payload)).unwrap();
      setProjects(result.data || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  // ============================
  // Fetch Note (Edit Mode)
  // ============================
  useEffect(() => {
    if (isEditMode) {
      fetchNoteById();
    }
  }, [noteId]);

  const fetchNoteById = async () => {
    try {
      const response = await dispatch(
        getNotebookById(noteId)
      ).unwrap();

      const note = response.data; // ✅ IMPORTANT FIX

      setTitle(note.experimentTitle || "");
      setProjectId(note.projectId || "");
      setBudgetIds(note.budgetIds || []);
      setContent(note.content?.html || "");
    } catch (err) {
      console.error("Failed to fetch notebook:", err);
    }
  };

  // ============================
  // Handle Project Change
  // ============================
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = projects.find(
      (p) => p.projectId === e.target.value
    );

    setProjectId(selected?.projectId || "");
    setBudgetIds(selected?.budgetNos || []);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove a file from the list before uploading
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================
  // Save / Update
  // ============================
  const handleSave = async () => {
    if (!projectId || !title || !content) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      projectId,
      experimentTitle: title,
      budgetIds,
      noteDate: new Date().toISOString().split("T")[0], // matches API format
      content: {
        html: content,
        plainText: content.replace(/<[^>]+>/g, ""),
      },
      groupName: user.groupName,
      role: user.role,
      name: user.name,
    };

    try {
      setLoading(true);

      if (isEditMode) {
        await dispatch(
          updateNotebook({
            noteId,
            data: payload,
          })
        ).unwrap();
      } else {
        await dispatch(createNotebook(payload)).unwrap();
      }

      navigate("/notebook");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save note");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>
        {isEditMode ? "✏️ Edit Note" : "✍️ Write New Note"}
      </h2>
      {/* Metadata Header: Author and Date/Time */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px 10px",
          fontSize: "15px",
          color: "#555",
          fontWeight: "bold"
        }}
      >
        <span>👤 Author: {user.name || "Guest"}</span>
        <span>📅 {openedAt}</span>
      </div>
      {/* Project Dropdown */}
      <select
        value={projectId}
        onChange={handleProjectChange}
        className="text-editor"
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      >
        <option value="">Select Project</option>
        {projects.map((project) => (
          <option key={project.projectId} value={project.projectId}>
            {project.projectName}
          </option>
        ))}
      </select>

      {/* Title */}
      <input
        type="text"
        placeholder="Experiment Title"
        value={title}
        className="text-editor"
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      {/* Editor */}
      <ReactQuill theme="snow" value={content}
        onChange={setContent}
      />

      {/* Budget Preview */}
      {budgetIds.length > 0 && (
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          <strong>Budgets:</strong> {budgetIds.join(", ")}
        </div>
      )}
      {/* File Attachment Section */}
      <div style={{ marginBottom: "20px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          📎 Attach Files
        </button>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div style={{ marginTop: "8px", maxHeight: "80px", overflowY: "auto" }}>
          {selectedFiles.map((file, index) => (
            <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", background: "#f8f9fa", padding: "4px 8px", borderRadius: "4px", marginBottom: "4px", border: "1px solid #ddd" }}>
              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{file.name}</span>
              <span style={{ color: "red", cursor: "pointer", marginLeft: "10px", fontWeight: "bold" }} onClick={() => removeFile(index)}>✕</span>
            </div>

          ))}
        </div>

      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          className="btn btn-color"
          onClick={handleSave}
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update"
              : "Save"}
        </button>
      </div>
    </div>
  );
};

export default WriteNote;