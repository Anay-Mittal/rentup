import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProperties, verifyProperty } from '../../store/propertySlice';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './VerifyProperty.css';

const VerifyPropertyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, loading, error } = useSelector((state) => state.properties);
  const { isAdmin, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("isAdmin:", isAdmin, "isLoggedIn:", isLoggedIn); // Debugging log for admin and login status
    if (isAdmin && isLoggedIn) {
      dispatch(fetchAllProperties()); // Fetch all properties for admin
    }
  }, [dispatch, isAdmin, isLoggedIn]);

  useEffect(() => {
    console.log("Fetched properties:", properties); // Debugging log for fetched properties
  }, [properties]);

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleVerifyProperty = async (propertyId) => {
    try {
      await dispatch(verifyProperty(propertyId)).unwrap(); // Wait for verification action to complete
      console.log(`Property ${propertyId} verified successfully`); // Log successful verification
    } catch (error) {
      console.error("Error verifying property:", error); // Log error if verification fails
    }
  };

  if (!isAdmin || !isLoggedIn) {
    return <p>Unauthorized Access</p>;
  }

  if (loading) return <p>Loading properties...</p>;
  if (error) return <p>Error fetching properties: {error.message || JSON.stringify(error)}</p>;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/all-property');
    }
  };

  return (
    <div className="verify-property-page">
      <button type="button" className="vp-back" onClick={handleBack}>
        <ArrowLeft size={16} />
        <span>Back to listings</span>
      </button>
      <h1>Verify Properties</h1>
      <div className="property-cards">
        {properties.map((property) => (
          <div
            key={property._id}
            className="property-card"
            onClick={() => handlePropertyClick(property._id)}
          >
            <h2>{property.title}</h2>
            <p>{property.location}</p>
            <p>Price: ${property.price}</p>
            {property.verified ? (
              <p className="verified">Verified</p>
            ) : (
              <button onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the card click event
                handleVerifyProperty(property._id);
              }}>
                Verify Property
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifyPropertyPage;
