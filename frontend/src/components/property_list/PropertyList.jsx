// import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import "./PropertyList.css"; // Import the combined CSS file

// PropertyList Component
const PropertyList = ({ properties }) => {
  console.log("Rendering properties:", properties); // Debugging log

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
            <p>Location: {property.location}</p>
            <p>Type: {property.propertyType}</p>
            <p>Price: ${property.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// SearchResultsPage Component
const SearchResultsPage = () => {
  const [properties, setProperties] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Extract search parameters from location search string
    const searchParams = new URLSearchParams(location.search);
    const params = {
      location: searchParams.get("location") || "",
      propertyType: searchParams.get("propertyType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    };

    // Fetch search results based on parameters
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/properties/search`, {
          params,
        });
        console.log("Fetched properties:", response.data); // Debugging log
        setProperties(response.data); // Update state with search results
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, [location.search]); // Re-run when location.search changes

  return (
    <div>
      <h2>Search Results</h2>
      <PropertyList properties={properties} /> {/* Render search results */}
    </div>
  );
};

export default SearchResultsPage;
