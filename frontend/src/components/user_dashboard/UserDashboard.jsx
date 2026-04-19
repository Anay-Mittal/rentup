import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = API_BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
        const userId = localStorage.getItem("userId"); // Assuming user ID is stored in localStorage
        const userResponse = await axios.get(`${BASE_URL}/api/auth/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const propertiesResponse = await axios.get(`${BASE_URL}/api/properties/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userResponse.data);
        setProperties(propertiesResponse.data);
      } catch (err) {
        console.error("Error fetching user dashboard data:", err);
        setError("Failed to load user dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading your dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="user-dashboard">
      {/* User Details Section */}
      <div className="user-details">
        <h2>Welcome, {user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Listed Properties Section */}
      <div className="listed-properties">
        <h2>Your Listed Properties</h2>
        {properties.length === 0 ? (
          <p>You have not listed any properties for sale yet.</p>
        ) : (
          <div className="properties-grid">
            {properties.map((property) => (
              <div key={property._id} className="property-card">
                {property.image && (
                  <img
                    src={`${BASE_URL}/${property.image}`}
                    alt={property.title}
                    className="property-image"
                  />
                )}
                <h3 className="property-title">{property.title}</h3>
                <p className="property-description">{property.description}</p>
                <p className="property-price">Price: ${property.price}</p>
                <p className="property-location">Location: {property.location}</p>
                <p className="property-status">
                  Status: {property.verified ? "Verified" : "Not Verified"}
                </p>
                {property.purchased?.status ? (
                  <p className="property-purchased">
                    Purchased By: {property.purchased.user?.name || "Unknown Buyer"}
                  </p>
                ) : (
                  <p className="property-purchased">Not Purchased</p>
                )}
                <Link to={`/property/${property._id}`} className="property-details-link">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
