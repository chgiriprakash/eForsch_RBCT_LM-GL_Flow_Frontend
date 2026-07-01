import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../shared/hooks/useAppDispatch";
import {
  getHPhrases, createHPhrase, updateHPhrase, deleteHPhrase,
  getPPhrases, createPPhrase, updatePPhrase, deletePPhrase,
  getCompanies, createCompany, updateCompany, deleteCompany,
  getStorageLocations, createStorageLocation, updateStorageLocation, deleteStorageLocation,
} from "../dashboardSlice";

type TabType = "hphrases" | "pphrases" | "companies" | "storage";

interface PhraseRow { id: number; phraseCode: string; phraseDescription: string; }
interface CompanyRow { id: number; companyNo: string; companyName: string; }
interface StorageRow { id: number; storageLocation: string; }

const emptyPhrase = { phraseCode: "", phraseDescription: "" };
const emptyCompany = { companyNo: "", companyName: "" };
const emptyStorage = { storageLocation: "" };

const Administration = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>("hphrases");

  // Data states
  const [hPhrases, setHPhrases] = useState<PhraseRow[]>([]);
  const [pPhrases, setPPhrases] = useState<PhraseRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageRow[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Load data
  const loadHPhrases = async () => {
    try { const r = await dispatch(getHPhrases()).unwrap(); setHPhrases(r); } catch (e) { console.error(e); }
  };
  const loadPPhrases = async () => {
    try { const r = await dispatch(getPPhrases()).unwrap(); setPPhrases(r); } catch (e) { console.error(e); }
  };
  const loadCompanies = async () => {
    try { const r = await dispatch(getCompanies()).unwrap(); setCompanies(r); } catch (e) { console.error(e); }
  };
  const loadStorage = async () => {
    try { const r = await dispatch(getStorageLocations()).unwrap(); setStorageLocations(r); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadHPhrases(); loadPPhrases(); loadCompanies(); loadStorage();
  }, []);

  // Open modal
  const openAdd = () => {
    setEditingRow(null);
    setFormData(activeTab === "hphrases" || activeTab === "pphrases" ? { ...emptyPhrase }
      : activeTab === "companies" ? { ...emptyCompany }
      : { ...emptyStorage });
    setShowModal(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setFormData({ ...row });
    setShowModal(true);
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "hphrases") {
        if (editingRow) await dispatch(updateHPhrase({ id: editingRow.id, dto: formData })).unwrap();
        else await dispatch(createHPhrase(formData)).unwrap();
        await loadHPhrases();
      } else if (activeTab === "pphrases") {
        if (editingRow) await dispatch(updatePPhrase({ id: editingRow.id, dto: formData })).unwrap();
        else await dispatch(createPPhrase(formData)).unwrap();
        await loadPPhrases();
      } else if (activeTab === "companies") {
        if (editingRow) await dispatch(updateCompany(formData)).unwrap();
        else await dispatch(createCompany(formData)).unwrap();
        await loadCompanies();
      } else if (activeTab === "storage") {
        if (editingRow) await dispatch(updateStorageLocation(formData)).unwrap();
        else await dispatch(createStorageLocation(formData)).unwrap();
        await loadStorage();
      }
      setShowModal(false);
    } catch (e) {
      console.error("Save failed:", e);
      alert("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      if (activeTab === "hphrases") { await dispatch(deleteHPhrase(id)).unwrap(); await loadHPhrases(); }
      else if (activeTab === "pphrases") { await dispatch(deletePPhrase(id)).unwrap(); await loadPPhrases(); }
      else if (activeTab === "companies") { await dispatch(deleteCompany(id)).unwrap(); await loadCompanies(); }
      else if (activeTab === "storage") { await dispatch(deleteStorageLocation(id)).unwrap(); await loadStorage(); }
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Delete failed.");
    }
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "hphrases", label: "H-Phrases", icon: "fa fa-exclamation-triangle" },
    { key: "pphrases", label: "P-Phrases", icon: "fa fa-shield" },
    { key: "companies", label: "Companies", icon: "fa fa-building" },
    { key: "storage", label: "Storage Locations", icon: "fa fa-archive" },
  ];

  const renderTable = () => {
    if (activeTab === "hphrases" || activeTab === "pphrases") {
      const rows = activeTab === "hphrases" ? hPhrases : pPhrases;
      return (
        <table className="dynamic-table">
          <thead>
            <tr>
              <th style={{ width: "120px" }}>Code</th>
              <th>Description</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: "center" }}>No records found</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.phraseCode}</strong></td>
                <td>{row.phraseDescription}</td>
                <td>
                  <button className="btn btn-sm btn-color me-1" onClick={() => openEdit(row)}>
                    <i className="fa fa-pencil" />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === "companies") {
      return (
        <table className="dynamic-table">
          <thead>
            <tr>
              <th style={{ width: "150px" }}>Company No</th>
              <th>Company Name</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: "center" }}>No records found</td></tr>
            ) : companies.map((row) => (
              <tr key={row.id}>
                <td>{row.companyNo}</td>
                <td>{row.companyName}</td>
                <td>
                  <button className="btn btn-sm btn-color me-1" onClick={() => openEdit(row)}>
                    <i className="fa fa-pencil" />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === "storage") {
      return (
        <table className="dynamic-table">
          <thead>
            <tr>
              <th>Storage Location</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {storageLocations.length === 0 ? (
              <tr><td colSpan={2} style={{ textAlign: "center" }}>No records found</td></tr>
            ) : storageLocations.map((row) => (
              <tr key={row.id}>
                <td>{row.storageLocation}</td>
                <td>
                  <button className="btn btn-sm btn-color me-1" onClick={() => openEdit(row)}>
                    <i className="fa fa-pencil" />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  const renderFormFields = () => {
    if (activeTab === "hphrases" || activeTab === "pphrases") {
      return (
        <>
          <div className="mb-3">
            <label className="form-label label">Phrase Code <span className="text-danger">*</span></label>
            <input className="input form-control" type="text" value={formData.phraseCode || ""}
              onChange={(e) => setFormData({ ...formData, phraseCode: e.target.value })}
              placeholder="e.g. H301" />
          </div>
          <div className="mb-3">
            <label className="form-label label">Description <span className="text-danger">*</span></label>
            <textarea className="form-control input" rows={3} value={formData.phraseDescription || ""}
              onChange={(e) => setFormData({ ...formData, phraseDescription: e.target.value })}
              placeholder="Enter phrase description" />
          </div>
        </>
      );
    }
    if (activeTab === "companies") {
      return (
        <>
          <div className="mb-3">
            <label className="form-label label">Company No <span className="text-danger">*</span></label>
            <input className="input form-control" type="text" value={formData.companyNo || ""}
              onChange={(e) => setFormData({ ...formData, companyNo: e.target.value })}
              placeholder="e.g. 700597" />
          </div>
          <div className="mb-3">
            <label className="form-label label">Company Name <span className="text-danger">*</span></label>
            <input className="input form-control" type="text" value={formData.companyName || ""}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Carl Roth" />
          </div>
        </>
      );
    }
    if (activeTab === "storage") {
      return (
        <div className="mb-3">
          <label className="form-label label">Storage Location <span className="text-danger">*</span></label>
          <input className="input form-control" type="text" value={formData.storageLocation || ""}
            onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
            placeholder="e.g. Room A - Shelf 1" />
        </div>
      );
    }
  };

  const getTabTitle = () => tabs.find((t) => t.key === activeTab)?.label || "";

  return (
    <div>
      <div className="boxNav">
        <h5><i className="fa fa-cog me-2" />Administration</h5>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-3" style={{ borderBottom: "2px solid #ddd" }}>
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
              style={{
                border: "none",
                borderBottom: activeTab === tab.key ? "3px solid #005ca7" : "3px solid transparent",
                color: activeTab === tab.key ? "#005ca7" : "#555",
                fontWeight: activeTab === tab.key ? 700 : 400,
                background: "transparent",
                padding: "8px 18px",
                cursor: "pointer",
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`${tab.icon} me-1`} /> {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Header + Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0" style={{ color: "#333", fontWeight: 600 }}>
          Manage {getTabTitle()}
        </h6>
        <button className="btn btn-color btn-sm" onClick={openAdd}>
          <i className="fa fa-plus me-1" /> Add {getTabTitle().replace(/s$/, "")}
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        {renderTable()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: "500px" }}>
            <div className="modal-header mb-3">
              <h5 className="mb-0">{editingRow ? "Edit" : "Add"} {getTabTitle().replace(/s$/, "")}</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div>
              {renderFormFields()}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-color btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;
