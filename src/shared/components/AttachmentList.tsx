import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

// Backend modules that expose /{id}/attachments (list + download).
export type AttachmentModule = "inventory" | "finechemical" | "orders";

interface AttachmentItem {
  attachmentId: string;
  fileName: string;
  fileType?: string;
  downloadUrl: string;
}

interface Props {
  module: AttachmentModule;
  id: number | string | null | undefined;
  /** Legacy single-file name (inventory.filename / order.fileName), shown when no multi-attachments exist. */
  legacyFileName?: string | null;
  /** Called to download the legacy single file (existing per-page handler). */
  onDownloadLegacy?: () => void;
}

/**
 * Fetches and displays every attachment for an inventory / fine chemical / order item.
 * Falls back to the legacy single-file field for records created before multi-attachments.
 */
const AttachmentList = ({ module, id, legacyFileName, onDownloadLegacy }: Props) => {
  const [items, setItems] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (id === null || id === undefined || id === "") return;
      setLoading(true);
      try {
        const res = await axiosClient.get(`api/${module}/${id}/attachments`);
        const list: AttachmentItem[] = res.data?.data ?? [];
        if (!cancelled) setItems(list);
      } catch (err) {
        console.error("Failed to load attachments:", err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [module, id]);

  const handleDownload = async (item: AttachmentItem) => {
    try {
      setDownloadingId(item.attachmentId);
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
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <span className="pd-no-file">Loading attachments…</span>;
  }

  // Multi-attachments present: show all of them.
  if (items.length > 0) {
    return (
      <ul className="pd-attachment-list" style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
        {items.map((item) => (
          <li
            key={item.attachmentId}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}
          >
            <i className="fa fa-file pd-file-icon" />
            <span className="pd-filename" style={{ flex: 1, wordBreak: "break-all" }}>{item.fileName}</span>
            <button
              className="pd-btn pd-btn-outline pd-btn-sm"
              onClick={() => handleDownload(item)}
              disabled={downloadingId === item.attachmentId}
            >
              <i className="fa fa-download me-1" />
              {downloadingId === item.attachmentId ? "Downloading…" : "Download"}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  // No multi-attachments: fall back to the legacy single-file field.
  if (legacyFileName) {
    return (
      <>
        <i className="fa fa-file-pdf pd-file-icon" />
        <span className="pd-filename">{legacyFileName}</span>
        {onDownloadLegacy && (
          <button className="pd-btn pd-btn-outline pd-btn-sm" onClick={onDownloadLegacy}>
            <i className="fa fa-download me-1" /> Download
          </button>
        )}
      </>
    );
  }

  return <span className="pd-no-file">No attachment</span>;
};

export default AttachmentList;
