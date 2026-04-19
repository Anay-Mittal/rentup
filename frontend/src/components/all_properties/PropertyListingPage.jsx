import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Home,
  Building2,
  KeyRound,
  Tag,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-react';
import PropertyMap from '../map/PropertyMap';
import { API_BASE_URL as BASE_URL } from '../../config';
import './PropertyListingPage.css';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
];

const getImageList = (p) => {
  if (Array.isArray(p.images) && p.images.length > 0) {
    return p.images.map((img) =>
      typeof img === 'string' && img.startsWith('http') ? img : `${BASE_URL}/${img}`
    );
  }
  if (p.image) {
    const primary = p.image.startsWith('http') ? p.image : `${BASE_URL}/${p.image}`;
    return [primary, ...FALLBACK_IMAGES.slice(0, 2)];
  }
  return FALLBACK_IMAGES;
};

const PropertyCarousel = ({ images, alt }) => {
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState({});

  const go = (e, next) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((cur) => (cur + next + images.length) % images.length);
  };

  const markBroken = (i) => setBroken((b) => ({ ...b, [i]: true }));

  const activeSrc = images[idx];
  const isBroken = broken[idx];

  return (
    <div className="pl-carousel" onClick={(e) => e.stopPropagation()}>
      {isBroken ? (
        <div className="pl-carousel-fallback">
          <ImageOff size={32} />
          <span>Image unavailable</span>
        </div>
      ) : (
        <img
          src={activeSrc}
          alt={alt}
          className="pl-carousel-img"
          onError={() => markBroken(idx)}
        />
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="pl-carousel-btn pl-carousel-prev"
            onClick={(e) => go(e, -1)}
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="pl-carousel-btn pl-carousel-next"
            onClick={(e) => go(e, 1)}
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>
          <div className="pl-carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                className={`pl-carousel-dot ${i === idx ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PropertyListingPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const scrollToTable = () => {
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    if (role !== 'buyer') return;

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const url =
          typeFilter === 'all'
            ? `${BASE_URL}/api/properties/verified`
            : `${BASE_URL}/api/properties/verified?listingType=${typeFilter}`;
        const response = await axios.get(url);
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        alert('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [role, typeFilter]);

  const visibleProperties = useMemo(() => {
    let list = properties;
    if (periodFilter !== 'all') {
      list = list.filter(
        (p) => p.listingType === 'rent' && (p.rentPeriod || 'monthly') === periodFilter
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [properties, periodFilter, query]);

  const stats = useMemo(() => {
    const total = properties.length;
    const forSale = properties.filter((p) => p.listingType === 'sale').length;
    const forRent = properties.filter((p) => p.listingType === 'rent').length;
    return { total, forSale, forRent };
  }, [properties]);

  const goListProperty = (listingType) => {
    navigate(`/property?listingType=${listingType}`);
  };

  const formatPrice = (p) => {
    const n = Number(p.price || 0);
    const formatted = n.toLocaleString('en-IN');
    if (p.listingType === 'rent') {
      return `₹${formatted} / ${p.rentPeriod || 'monthly'}`;
    }
    return `₹${formatted}`;
  };

  return (
    <div className="pl-page">
      <div className="pl-hero">
        <div className="pl-hero-icons" aria-hidden="true">
          <Home size={20} />
          <Building2 size={20} />
          <KeyRound size={20} />
          <Tag size={20} />
        </div>
        <div className="pl-hero-body">
          <p className="pl-hero-title">
            <strong>Find your next property</strong> — buy, rent, or list yours
          </p>
          <button
            className="pl-hero-cta"
            onClick={() => {
              if (role === 'buyer') {
                setTypeFilter('all');
                setPeriodFilter('all');
                setQuery('');
                scrollToTable();
              } else {
                goListProperty('sale');
              }
            }}
          >
            {role === 'buyer' ? 'Browse All' : 'List Property'}
          </button>
        </div>
      </div>

      <div className="pl-role-row">
        <div className="pl-avatar">P</div>
        <div className="pl-role-info">
          <span className="pl-role-name">Property Marketplace</span>
          <span className="pl-role-sub">{stats.total} active</span>
        </div>
        <div className="pl-role-chip">
          <span className="pl-dot" /> Verified only
        </div>
      </div>

      <div className="pl-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={role === 'buyer'}
          className={`pl-tab ${role === 'buyer' ? 'active' : ''}`}
          onClick={() => setRole('buyer')}
        >
          Buyer
        </button>
        <button
          role="tab"
          aria-selected={role === 'seller'}
          className={`pl-tab ${role === 'seller' ? 'active' : ''}`}
          onClick={() => setRole('seller')}
        >
          Seller
        </button>
      </div>

      {role === 'buyer' && (
        <>
          <div className="pl-summary">
            <div className="pl-summary-main">{stats.total} Listings</div>
            <div className="pl-summary-sub">
              <span className="pl-pos">+{stats.forSale} for sale</span>
              <span className="pl-neu"> • {stats.forRent} for rent</span>
            </div>
          </div>

          <PropertyMap variant="full" radius={5000} />

          <div className="pl-filters">
            <div className="pl-dropdowns">
              <label className="pl-dd">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Listing type"
                >
                  <option value="all">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </label>
              <label className="pl-dd">
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  aria-label="Rent period"
                  disabled={typeFilter === 'sale'}
                >
                  <option value="all">All Periods</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
            </div>
            <div className="pl-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search properties"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div ref={tableRef} className="pl-table-wrap pl-table-wrap--buyer">
            <div className="pl-table-head pl-table-head--buyer">
              <div className="col-media">PROPERTY</div>
              <div className="col-detail">DETAILS</div>
              <div className="col-price">PRICE</div>
              <div className="col-status">STATUS</div>
            </div>

            {loading ? (
              <div className="pl-empty">Loading properties…</div>
            ) : visibleProperties.length === 0 ? (
              <div className="pl-empty">
                {properties.length === 0
                  ? 'No verified properties available yet.'
                  : 'No properties match your filters.'}
              </div>
            ) : (
              <ul className="pl-table-body">
                {visibleProperties.map((p) => (
                  <li key={p._id}>
                    <Link to={`/property/${p._id}`} className="pl-row pl-row--buyer">
                      <div className="col-media">
                        <PropertyCarousel images={getImageList(p)} alt={p.title} />
                      </div>
                      <div className="col-detail">
                        <span
                          className={`pl-chip ${
                            p.listingType === 'rent' ? 'chip-rent' : 'chip-sale'
                          }`}
                        >
                          {p.listingType === 'rent' ? 'FOR RENT' : 'FOR SALE'}
                        </span>
                        <h4 className="pl-name">{p.title}</h4>
                        <p className="pl-desc">{p.description}</p>
                        <p className="pl-location">{p.location}</p>
                      </div>
                      <div className="col-price pl-price">{formatPrice(p)}</div>
                      <div className="col-status">
                        <span
                          className={`pl-chip ${
                            p.purchased?.status ? 'chip-gone' : 'chip-available'
                          }`}
                        >
                          {p.purchased?.status
                            ? p.listingType === 'rent'
                              ? 'RENTED'
                              : 'SOLD'
                            : 'AVAILABLE'}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {role === 'seller' && (
        <div className="pl-seller">
          <div className="pl-seller-head">
            <h3>List your property</h3>
            <p>Choose how you want your property to be listed — you can edit details later.</p>
          </div>
          <div className="pl-seller-grid">
            <button
              type="button"
              className="pl-seller-card pl-seller-sale"
              onClick={() => goListProperty('sale')}
            >
              <div className="pl-seller-icon">
                <Tag size={22} />
              </div>
              <div>
                <div className="pl-seller-title">List for Sale</div>
                <div className="pl-seller-sub">
                  Set a one-time selling price. Best for transferring ownership.
                </div>
              </div>
              <span className="pl-seller-arrow">→</span>
            </button>
            <button
              type="button"
              className="pl-seller-card pl-seller-rent"
              onClick={() => goListProperty('rent')}
            >
              <div className="pl-seller-icon">
                <KeyRound size={22} />
              </div>
              <div>
                <div className="pl-seller-title">List for Rent</div>
                <div className="pl-seller-sub">
                  Set a monthly or yearly rent. Best for recurring income.
                </div>
              </div>
              <span className="pl-seller-arrow">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyListingPage;
