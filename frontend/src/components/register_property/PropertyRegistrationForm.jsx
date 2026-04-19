import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { X, ImagePlus, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './PropertyRegistrationForm.css';

const MAX_IMAGES = 10;

const PropertyRegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    listingType: 'sale',
    rentPeriod: 'monthly',
  });
  const [images, setImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // object URLs
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lt = params.get('listingType');
    if (lt === 'sale' || lt === 'rent') {
      setProperty((prev) => ({ ...prev, listingType: lt }));
    }
  }, [location.search]);

  // Clean up object URLs on unmount / change
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesAdd = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const roomLeft = MAX_IMAGES - images.length;
    const accepted = selected.slice(0, roomLeft);
    if (accepted.length < selected.length) {
      alert(`You can upload up to ${MAX_IMAGES} images.`);
    }

    const newUrls = accepted.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [...prev, ...newUrls]);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveImage = (idx, dir) => {
    const next = idx + dir;
    if (next < 0 || next >= images.length) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
    setPreviews((prev) => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', property.title);
    formData.append('description', property.description);
    formData.append('price', property.price);
    formData.append('location', property.location);
    formData.append('listingType', property.listingType);
    if (property.listingType === 'rent') {
      formData.append('rentPeriod', property.rentPeriod);
    }
    images.forEach((file) => formData.append('images', file));

    try {
      await axios.post(`${API_BASE_URL}/api/properties/list`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Property listed successfully');
      previews.forEach((url) => URL.revokeObjectURL(url));
      setProperty({
        title: '',
        description: '',
        price: '',
        location: '',
        listingType: 'sale',
        rentPeriod: 'monthly',
      });
      setImages([]);
      setPreviews([]);
      navigate('/all-property');
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to list property';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isRent = property.listingType === 'rent';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/all-property');
    }
  };

  return (
    <div className="property-registration">
      <button type="button" className="pr-back" onClick={handleBack}>
        <ArrowLeft size={16} />
        <span>Back to listings</span>
      </button>
      <h2 className="property-title">
        Register Your Property {isRent ? '(For Rent)' : '(For Sale)'}
      </h2>
      <form onSubmit={handleSubmit} className="property-form" encType="multipart/form-data">
        <div className="input-group">
          <label htmlFor="listingType">Listing Type</label>
          <select
            id="listingType"
            name="listingType"
            value={property.listingType}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        {isRent && (
          <div className="input-group">
            <label htmlFor="rentPeriod">Rent Period</label>
            <select
              id="rentPeriod"
              name="rentPeriod"
              value={property.rentPeriod}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={property.title}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={property.description}
            onChange={handleChange}
            required
            className="input-field textarea"
          />
        </div>
        <div className="input-group">
          <label htmlFor="price">
            Price {isRent ? `(per ${property.rentPeriod})` : ''}
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={property.price}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="input-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={property.location}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>
            Property Images{' '}
            <span className="help-text">
              ({images.length}/{MAX_IMAGES} — first image will be the cover)
            </span>
          </label>
          <div className="image-grid">
            {previews.map((src, i) => (
              <div key={src} className={`image-tile ${i === 0 ? 'cover' : ''}`}>
                <img src={src} alt={`Preview ${i + 1}`} />
                {i === 0 && <span className="cover-badge">Cover</span>}
                <button
                  type="button"
                  className="image-remove"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
                <div className="image-reorder">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    aria-label="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === previews.length - 1}
                    aria-label="Move right"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="image-add">
                <ImagePlus size={22} />
                <span>Add photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesAdd}
                  hidden
                />
              </label>
            )}
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting
            ? 'Listing…'
            : `List Property ${isRent ? 'for Rent' : 'for Sale'}`}
        </button>
      </form>
    </div>
  );
};

export default PropertyRegistrationForm;
