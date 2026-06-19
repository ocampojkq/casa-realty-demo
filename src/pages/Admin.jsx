import { useState, useEffect } from "react";
import axios from "axios";
import { API, getImageUrl } from "../config";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("properties");

  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    property_type: "House",
    status: "For Sale",
    map_link: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProperties = async () => {
    setLoadingProperties(true);
    const res = await axios.get(`${API}/properties`);
    setProperties(res.data);
    setLoadingProperties(false);
  };

  const fetchInquiries = async () => {
    const res = await axios.get(`${API}/inquiries`);
    setInquiries(res.data);
  };

  const updateInquiryStatus = async (id, status) => {
    await axios.put(`${API}/inquiries/${id}`, { status });
    fetchInquiries();
  };

  useEffect(() => {
    if (loggedIn) {
      fetchProperties();
      fetchInquiries();
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      if (res.data.success) {
        setLoggedIn(true);
        setLoginError("");
      }
    } catch (err) {
      setLoginError("Wrong password");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      location: "",
      bedrooms: "",
      bathrooms: "",
      sqft: "",
      property_type: "House",
      status: "For Sale",
      map_link: "",
    });
    setImageFiles([]);
    setEditingId(null);
  };

  const handleEdit = (property) => {
    setEditingId(property.id);
    setForm({
      title: property.title,
      description: property.description || "",
      price: property.price,
      location: property.location,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.sqft,
      property_type: property.property_type,
      status: property.status,
      map_link: property.map_link || "",
    });
    setImageFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    setConfirmAction({
      title: "Delete property?",
      message:
        "This will permanently remove this property and all its photos. This action cannot be undone.",
      onConfirm: async () => {
        await axios.delete(`${API}/properties/${id}`);
        setToast({ message: "Property deleted", type: "success" });
        setConfirmAction(null);
        fetchProperties();
      },
    });
  };

  const handleDeleteImage = (imageId) => {
    setConfirmAction({
      title: "Delete photo?",
      message:
        "This photo will be permanently removed from the property listing.",
      onConfirm: async () => {
        await axios.delete(`${API}/property-images/${imageId}`);
        setToast({ message: "Photo removed", type: "success" });
        setConfirmAction(null);
        fetchProperties();
      },
    });
  };
  const handleSubmit = async () => {
    if (!form.title || !form.price) {
      setToast({ message: "Title and price are required", type: "error" });
      return;
    }
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => data.append(key, val));
    imageFiles.forEach((file) => data.append("images", file));

    try {
      if (editingId) {
        await axios.put(`${API}/properties/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToast({
          message: "Property updated successfully!",
          type: "success",
        });
      } else {
        await axios.post(`${API}/properties`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToast({ message: "Property added successfully!", type: "success" });
      }
      resetForm();
      fetchProperties();
    } catch (err) {
      setToast({ message: "Error saving property", type: "error" });
    }
    setSaving(false);
  };

  const currentEditingProperty = properties.find((p) => p.id === editingId);

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <img src="/images/logo.png" alt="Logo" className="h-16" />
          </div>
          <h2 className="text-xl font-bold mb-6 text-center">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full p-3 border rounded-lg mb-3"
          />
          {loginError && (
            <p className="text-red-500 text-sm mb-3">{loginError}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/logo.png" alt="Logo" className="h-12" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-5 py-2 rounded-lg font-medium transition ${activeTab === "properties" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-5 py-2 rounded-lg font-medium transition relative ${activeTab === "leads" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Leads
            {inquiries.length > 0 && (
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === "leads" ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}
              >
                {inquiries.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "properties" && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? "Edit Property" : "Add New Property"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="p-1 border rounded-lg w-full"
                />
                <input
                  placeholder="Price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="p-1 border rounded-lg w-full"
                />
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="p-1 border rounded-lg w-full"
                />
                <select
                  value={form.property_type}
                  onChange={(e) =>
                    setForm({ ...form, property_type: e.target.value })
                  }
                  className="p-1 border rounded-lg w-full"
                >
                  <option>House</option>
                  <option>Condo</option>
                  <option>Apartment</option>
                  <option>Lot</option>
                </select>
                <input
                  placeholder="Bedrooms"
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) =>
                    setForm({ ...form, bedrooms: e.target.value })
                  }
                  className="p-1 border rounded-lg w-full"
                />
                <input
                  placeholder="Bathrooms"
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) =>
                    setForm({ ...form, bathrooms: e.target.value })
                  }
                  className="p-1 border rounded-lg w-full"
                />
                <input
                  placeholder="Sqft"
                  type="number"
                  value={form.sqft}
                  onChange={(e) => setForm({ ...form, sqft: e.target.value })}
                  className="p-1 border rounded-lg w-full"
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="p-1 border rounded-lg w-full"
                >
                  <option>For Sale</option>
                  <option>For Rent</option>
                  <option>Sold</option>
                </select>
              </div>

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full p-1 border rounded-lg mt-4"
                rows={6}
              />
              <input
                placeholder="Google Maps Link (paste share link from Google Maps)"
                value={form.map_link}
                onChange={(e) => setForm({ ...form, map_link: e.target.value })}
                className="w-full p-3 border rounded-lg mt-4"
              />

              {editingId && currentEditingProperty?.images?.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm text-gray-600 mb-2 block">
                    Current Photos (click to delete)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {currentEditingProperty.images.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={getImageUrl(img.image_url)}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="text-sm text-gray-600 mb-1 block">
                  {editingId
                    ? "Add More Photos"
                    : "Property Photos (select multiple)"}
                </label>
                <label className="flex items-center justify-center gap-2 w-full p-1 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <span className="text-gray-600">
                    📷 Click to choose photos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>
                {imageFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">
                      {imageFiles.length} photo(s) selected
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {imageFiles.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-20 h-20 object-cover rounded-lg border"
                            alt={`preview-${idx}`}
                          />
                          <button
                            onClick={() =>
                              setImageFiles(
                                imageFiles.filter((_, i) => i !== idx),
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Property"
                      : "Add Property"}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="bg-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              All Properties ({properties.length})
            </h2>
            {loadingProperties ? (
              <p className="text-center text-gray-400 py-10">
                Loading properties...
              </p>
            ) : (
              <div className="space-y-3">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      {p.images?.[0] && (
                        <img
                          src={getImageUrl(p.images[0].image_url)}
                          alt={p.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-sm text-gray-500">
                          ₱{Number(p.price).toLocaleString()} · {p.location} ·{" "}
                          {p.images?.length || 0} photo(s) · {p.views || 0} view
                          {p.views === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "leads" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Leads / Inquiries ({inquiries.length})
            </h2>
            <div className="space-y-3">
              {inquiries.map((inq) => {
                const statusColors = {
                  New: "bg-blue-100 text-blue-700",
                  Contacted: "bg-yellow-100 text-yellow-700",
                  Closed: "bg-green-100 text-green-700",
                  Lost: "bg-gray-200 text-gray-600",
                };
                return (
                  <div
                    key={inq.id}
                    className="bg-white p-5 rounded-xl shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {inq.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {inq.email} · {inq.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block mb-1">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[inq.status] || statusColors.New}`}
                        >
                          {inq.status || "New"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 mb-2">
                      Interested in: {inq.property_title || "Unknown property"}
                    </p>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg mb-3">
                      {inq.message}
                    </p>
                    <select
                      value={inq.status || "New"}
                      onChange={(e) =>
                        updateInquiryStatus(inq.id, e.target.value)
                      }
                      className="text-sm border rounded-lg p-2"
                    >
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Closed</option>
                      <option>Lost</option>
                    </select>
                  </div>
                );
              })}
              {inquiries.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No leads yet
                  </h3>
                  <p className="text-gray-400">
                    Inquiries from interested buyers will show up here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
