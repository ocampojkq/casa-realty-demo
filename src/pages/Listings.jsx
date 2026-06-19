import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, getImageUrl } from "../config";
import AuthModal from "../components/AuthModal";

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFavoriteId, setPendingFavoriteId] = useState(null);
  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("Any");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    axios
      .get(`${API}/properties`)
      .then((res) => setProperties(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API}/favorites/check`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setFavorites(res.data))
        .catch(() => {});
    }
  }, []);

  const toggleFavorite = async (propertyId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPendingFavoriteId(propertyId);
      setShowAuthModal(true);
      return;
    }

    const isFavorited = favorites.includes(propertyId);
    try {
      if (isFavorited) {
        await axios.delete(`${API}/favorites/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter((id) => id !== propertyId));
      } else {
        await axios.post(
          `${API}/favorites`,
          { property_id: propertyId },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setFavorites([...favorites, propertyId]);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  const handleAuthSuccess = async (token, user) => {
    setShowAuthModal(false);
    if (pendingFavoriteId) {
      await axios.post(
        `${API}/favorites`,
        { property_id: pendingFavoriteId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setFavorites([...favorites, pendingFavoriteId]);
      setPendingFavoriteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-3 mt-3">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredProperties = properties
    .filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(search.toLowerCase()) ||
        property.location.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        propertyType === "All" || property.property_type === propertyType;

      const matchesPrice =
        !maxPrice || Number(property.price) <= Number(maxPrice);

      const matchesBedrooms =
        minBedrooms === "Any" || property.bedrooms >= Number(minBedrooms);

      return matchesSearch && matchesType && matchesPrice && matchesBedrooms;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return Number(a.price) - Number(b.price);
      if (sortBy === "price_high") return Number(b.price) - Number(a.price);
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      return 0;
    });

  const clearFilters = () => {
    setSearch("");
    setPropertyType("All");
    setMaxPrice("");
    setMinBedrooms("Any");
  };

  const hasActiveFilters =
    search || propertyType !== "All" || maxPrice || minBedrooms !== "Any";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Filters */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <input
            placeholder="Search title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-1 border rounded-lg md:col-span-2 w-full"
          />

          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="p-1 border rounded-lg"
          >
            <option value="All">All Types</option>
            <option value="House">House</option>
            <option value="Condo">Condo</option>
            <option value="Apartment">Apartment</option>
            <option value="Lot">Lot</option>
          </select>

          <input
            placeholder="Max Price (₱)"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-1 border rounded-lg"
          />

          <select
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(e.target.value)}
            className="p-1 border rounded-lg"
          >
            <option value="Any">Any Bedrooms</option>
            <option value="1">1+ Bedrooms</option>
            <option value="2">2+ Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-1 border rounded-lg"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 gap-3">
          <span className="text-sm text-gray-500">
            {filteredProperties.length} of {properties.length} properties
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Listings */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredProperties.map((property, index) => (
          <Link
            to={`/property/${property.id}`}
            key={property.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block relative fade-in"
            style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
          >
            {property.images?.[0] ? (
              <img
                src={getImageUrl(property.images[0].image_url)}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                No Photo
              </div>
            )}
            {property.images?.length > 1 && (
              <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                📷 {property.images.length}
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(property.id);
              }}
              className="absolute top-2 left-2 bg-white/90 hover:bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition"
            >
              <span
                className={
                  favorites.includes(property.id)
                    ? "text-red-500"
                    : "text-gray-400"
                }
              >
                {favorites.includes(property.id) ? "❤️" : "🤍"}
              </span>
            </button>
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900">
                {property.title}
              </h2>
              <p className="text-gray-800 font-semibold text-sm mt-1">
                ₱{Number(property.price).toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mt-1">{property.location}</p>
              <div className="flex gap-3 mt-3 text-sm text-gray-600">
                <span> {property.bedrooms} bed</span>
                <span> {property.bathrooms} bath</span>
                <span> {property.sqft} sqft</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-16 max-w-6xl mx-auto">
          <div className="text-5xl mb-4">
            {properties.length === 0 ? "🏠" : "🔍"}
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {properties.length === 0 ? "No properties yet" : "No matches found"}
          </h3>
          <p className="text-gray-400 mb-6">
            {properties.length === 0
              ? "Check back soon for new listings."
              : "Try adjusting your search or filters."}
          </p>
          {properties.length > 0 && hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
