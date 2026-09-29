import { useCallback, useEffect, useRef, useState } from "react";
import axiosClient from "../api/axiosClient";
import type { AttachmentModule } from "./AttachmentList";

interface AttachmentItem {
  attachmentId: string;
  fileName: string;
  fileType?: string;
  downloadUrl: string;
}

interface Props {
  module: AttachmentModule;
  id: number | string | null | undefined;
  /** When false, the list is view/download only (no add, no delete). */
  canEdit: boolean;
  /** Max attachments allowed on the record. */
  maxFiles?: number;
}

/**
 * Full attachment manager for an existing record: lists every attachment with
 * download, and (when canEdit) lets the user delete individual files and add new
 * ones. Uses the backend's /{id}/attachments endpoints, which exist for
 * inventory, finechemical and orders.
 */
const AttachmentManager = ({ module, id, canEdit, maxFiles = 5 }: Props) => {
  const [items, setItems] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const base = `api/${module}/${id}`;

  const load = useCallback(async () => {
    if (id === null || id === undefined || id === "") return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`${base}/attachments`);
      setItems(res.data?.data ?? []);
    } catch (err) {
      console.error("Failed to load attachments:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [base, id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = async (item: AttachmentItem) => {
    try {
      setBusyId(item.attachmentId);
      const res = await axiosClient.get(item.downloadUrl, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = item.fileName || "attachment";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download attachment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: AttachmentItem) => {
    if (!window.confirm(`Remove ${item.fileName}?`)) return;
    try {
      setBusyId(item.attachmentId);
      await axiosClient.delete(`${base}/attachments/${item.attachmentId}`);
      await load();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to remove attachment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAdd = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    if (items.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} attachments allowed. This item already has ${items.length}.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    try {
      setUploading(true);
      const form = new FormData();
      files.forEach((f) => form.append("files", f, f.name));
      await axiosClient.post(`${base}/attachments`, form);
      await load();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to add attachment(s).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return <span className="pd-no-file">Loading attachments…</span>;

  return (
    <div style={{ width: "100%" }}>
      {items.length === 0 && <span className="pd-no-file">No attachments</span>}

      {items.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item) => (
            <li
              key={item.attachmentId}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}
            >
              <i className="fa fa-file" style={{ color: "#c0392b" }} />
              <span style={{ flex: 1, wordBreak: "break-all" }}>{item.fileName}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleDownload(item)}
                disabled={busyId === item.attachmentId}
              >
                <i className="fa fa-download me-1" /> Download
              </button>
              {canEdit && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(item)}
                  disabled={busyId === item.attachmentId}
                  title="Remove attachment"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div style={{ marginTop: 10 }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            disabled={uploading || items.length >= maxFiles}
            onChange={(e) => handleAdd(e.target.files)}
          />
          <div style={{ fontSize: "0.8rem", color: "#6e7680", marginTop: 4 }}>
            {items.length} / {maxFiles} attached{uploading ? " · uploading…" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentManager;
