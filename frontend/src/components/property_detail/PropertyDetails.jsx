import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ChevronLeft, ChevronRight, ImageOff, ArrowLeft } from "lucide-react";
import { API_BASE_URL as BASE_URL } from "../../config";
import "./PropertyDetails.css";

const getImageList = (p) => {
  if (!p) return [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    return p.images.map((img) =>
      typeof img === "string" && img.startsWith("http") ? img : `${BASE_URL}/${img}`
    );
  }
  if (p.image) {
    return [p.image.startsWith("http") ? p.image : `${BASE_URL}/${p.image}`];
  }
  return [];
};

const DetailGallery = ({ images, alt }) => {
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState({});

  if (!images.length) {
    return (
      <div className="pd-gallery pd-gallery-empty">
        <ImageOff size={32} />
        <span>No photos available</span>
      </div>
    );
  }

  const go = (next) =>
    setIdx((cur) => (cur + next + images.length) % images.length);

  const isBroken = broken[idx];

  return (
    <div className="pd-gallery">
      <div className="pd-gallery-main">
        {isBroken ? (
          <div className="pd-gallery-fallback">
            <ImageOff size={28} />
            <span>Image unavailable</span>
          </div>
        ) : (
          <img
            src={images[idx]}
            alt={`${alt} - ${idx + 1}`}
            className="pd-gallery-img"
            onError={() => setBroken((b) => ({ ...b, [idx]: true }))}
          />
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="pd-gallery-btn pd-gallery-prev"
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="pd-gallery-btn pd-gallery-next"
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="pd-gallery-thumbs">
          {images.map((src, i) => (
            <button
              type="button"
              key={`${src}-${i}`}
              className={`pd-thumb ${i === idx ? "active" : ""}`}
              onClick={() => setIdx(i)}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={src} alt={`Thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    listingType: "sale",
    rentPeriod: "monthly",
  });
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userId = useSelector((state) => state.auth.userId);
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/properties/${id}`);
        setProperty(response.data);
        setEditData({
          title: response.data.title || "",
          description: response.data.description || "",
          price: response.data.price || "",
          location: response.data.location || "",
          listingType: response.data.listingType || "sale",
          rentPeriod: response.data.rentPeriod || "monthly",
        });
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    };
    fetchProperty();
  }, [id]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(editData).forEach(([k, v]) => formData.append(k, v));
      // Keep all existing images (no removal UI here yet)
      formData.append("keepImages", JSON.stringify(property.images || []));

      const response = await axios.put(
        `${BASE_URL}/api/properties/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Property updated successfully");
      setProperty(response.data.property || { ...property, ...editData });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating property:", error.response?.data || error.message);
      alert("Failed to update property");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Property deleted successfully");
      navigate("/all-property");
    } catch (error) {
      console.error("Error deleting property:", error.response?.data || error.message);
      alert("Failed to delete property");
    }
  };

  const handleVerifyProperty = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/properties/verify/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Property verified successfully");
      setProperty({ ...property, verified: true });
    } catch (error) {
      console.error("Error verifying property:", error.response?.data || error.message);
      alert("Failed to verify property");
    }
  };

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      alert("You must be logged in to purchase a property.");
      return;
    }
    try {
      const response = await axios.post(
        `${BASE_URL}/api/properties/${id}/purchase`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Property purchased successfully");
      setProperty(response.data.property || response.data);
    } catch (error) {
      console.error("Error purchasing property:", error.response?.data || error.message);
      alert("Failed to purchase property");
    }
  };

  if (!property) return <p className="pd-loading">Loading…</p>;

  const isSeller =
    isLoggedIn && property.seller?._id?.toString() === userId?.toString();
  const imageList = getImageList(property);
  const priceDisplay =
    property.listingType === "rent"
      ? `₹${Number(property.price).toLocaleString("en-IN")} / ${
          property.rentPeriod || "monthly"
        }`
      : `₹${Number(property.price).toLocaleString("en-IN")}`;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/all-property");
    }
  };

  return (
    <div className="property-details">
      <button type="button" className="pd-back" onClick={handleBack}>
        <ArrowLeft size={16} />
        <span>Back to listings</span>
      </button>
      <DetailGallery images={imageList} alt={property.title} />

      <div className="pd-body">
        <div className="pd-header-row">
          <h2 className="property-title">{property.title}</h2>
          <span
            className={`pd-chip ${
              property.listingType === "rent" ? "pd-chip-rent" : "pd-chip-sale"
            }`}
          >
            {property.listingType === "rent" ? "FOR RENT" : "FOR SALE"}
          </span>
        </div>

        <p className="property-price">{priceDisplay}</p>
        <p className="property-location">📍 {property.location}</p>
        <p className="property-description">{property.description}</p>

        <div className="pd-meta">
          <span>
            <strong>Seller:</strong> {property.seller?.name || "Anonymous"}
          </span>
          <span>
            <strong>Status:</strong>{" "}
            {property.verified ? "Verified" : "Pending verification"}
          </span>
          <span>
            <strong>Availability:</strong>{" "}
            {property.purchased?.status
              ? property.listingType === "rent"
                ? `Rented by ${property.purchased.user?.name || "Unknown"}`
                : `Sold to ${property.purchased.user?.name || "Unknown"}`
              : "Available"}
          </span>
        </div>

        <div className="pd-actions">
          {!property.purchased?.status && !isSeller && (
            <button className="btn-primary" onClick={handlePurchase}>
              {property.listingType === "rent" ? "Rent This" : "Buy This"}
            </button>
          )}

          {isSeller && (
            <>
              <button className="btn-edit" onClick={handleEditToggle}>
                {isEditing ? "Cancel" : "Edit"}
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}

          {isAdmin && !property.verified && (
            <button className="btn-verify" onClick={handleVerifyProperty}>
              Verify Property
            </button>
          )}
        </div>

        {isEditing && isSeller && (
          <form className="edit-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Listing Type</label>
              <select
                name="listingType"
                value={editData.listingType}
                onChange={handleInputChange}
                required
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            {editData.listingType === "rent" && (
              <div className="form-group">
                <label>Rent Period</label>
                <select
                  name="rentPeriod"
                  value={editData.rentPeriod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={editData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={editData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
