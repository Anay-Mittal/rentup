import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import "./SearchResults.css"; // Import the CSS file for styling

// PropertyList Component
const PropertyList = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return <p>No properties found. Try adjusting your search criteria.</p>;
  }

  return (
    <div className="property-list">
      {properties.map((property) => (
        <div className="property-card" key={property._id}>
          <img
            src={`${API_BASE_URL}/${property.image}`}
            alt={property.title}
            className="property-image"
          />
          <div className="property-info">
            <h3>{property.title}</h3>
            <p><strong>Location:</strong> {property.location}</p>
            <p><strong>Type:</strong> {property.propertyType || "N/A"}</p>
            <p><strong>Price:</strong> ${property.price.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// SearchResultsPage Component
const SearchResultsPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Extract search parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const params = {
          location: searchParams.get("location") || "",
          propertyType: searchParams.get("propertyType") || "",
          minPrice: searchParams.get("minPrice") || "",
          maxPrice: searchParams.get("maxPrice") || "",
        };

        setLoading(true); // Set loading state
        setError(null); // Reset error state

        const response = await axios.get(`${API_BASE_URL}/api/properties/search`, {
          params,
        });

        setProperties(response.data); // Update properties
      } catch (err) {
        setError("Error fetching properties. Please try again.");
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProperties();
  }, [location.search]);

  return (
    <div className="search-results-container">
      <h2>Search Results</h2>

      {loading && <p>Loading properties...</p>} {/* Show loading message */}
      {error && <p className="error-message">{error}</p>} {/* Show error message */}
      
      {!loading && !error && (
        <PropertyList properties={properties} /> 
      )}
    </div>
  );
};

export default SearchResultsPage;
