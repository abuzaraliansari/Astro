import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function BookPooja() {
  const { user, deductCredits } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPooja, setSelectedPooja] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingStep, setBookingStep] = useState('browse'); // browse, details, confirmation, payment
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    location: '',
    special_requirements: '',
    devotee_name: '',
    contact_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Pooja Categories and Data
  const poojaCategories = [
    { id: 'popular', name: 'Popular Poojas', icon: '⭐', description: 'Most requested divine rituals' },
    { id: 'festivals', name: 'Festival Poojas', icon: '🎊', description: 'Special occasion ceremonies' },
    { id: 'planetary', name: 'Planetary Poojas', icon: '🌟', description: 'Celestial alignment rituals' },
    { id: 'personal', name: 'Personal Poojas', icon: '🙏', description: 'Individual spiritual needs' },
    { id: 'corporate', name: 'Corporate Poojas', icon: '🏢', description: 'Business blessing ceremonies' }
  ];

  const poojaData = {
    popular: [
      {
        id: 1,
        name: 'Ganesha Pooja',
        sanskrit: 'गणेश पूजा',
        icon: '🐘',
        price: { basic: 501, premium: 1001, deluxe: 2001 },
        duration: '45-90 mins',
        benefits: ['Removes obstacles', 'Brings prosperity', 'Ensures success'],
        description: 'Invoke Lord Ganesha\'s blessings for new beginnings and obstacle removal.',
        items: ['Fresh flowers', 'Prasadam', 'Holy water', 'Sacred thread']
      },
      {
        id: 2,
        name: 'Lakshmi Pooja',
        sanskrit: 'लक्ष्मी पूजा',
        icon: '💰',
        price: { basic: 751, premium: 1501, deluxe: 3001 },
        duration: '60-120 mins',
        benefits: ['Attracts wealth', 'Brings abundance', 'Financial prosperity'],
        description: 'Worship Goddess Lakshmi for wealth, prosperity and abundance in life.',
        items: ['Gold kalash', 'Lotus flowers', 'Coins', 'Sweets', 'Prasadam']
      },
      {
        id: 3,
        name: 'Saraswati Pooja',
        sanskrit: 'सरस्वती पूजा',
        icon: '📚',
        price: { basic: 601, premium: 1201, deluxe: 2501 },
        duration: '45-75 mins',
        benefits: ['Enhances knowledge', 'Improves learning', 'Academic success'],
        description: 'Seek blessings of Goddess Saraswati for wisdom and knowledge.',
        items: ['White flowers', 'Books', 'Peacock feathers', 'Prasadam']
      }
    ],
    festivals: [
      {
        id: 4,
        name: 'Diwali Pooja',
        sanskrit: 'दीपावली पूजा',
        icon: '🪔',
        price: { basic: 1001, premium: 2001, deluxe: 4001 },
        duration: '90-150 mins',
        benefits: ['Light over darkness', 'Prosperity', 'Family harmony'],
        description: 'Complete Diwali celebration with Lakshmi-Ganesha worship.',
        items: ['Diyas', 'Rangoli', 'Sweets', 'Fireworks', 'Prasadam']
      },
      {
        id: 5,
        name: 'Navratri Pooja',
        sanskrit: 'नवरात्रि पूजा',
        icon: '🌸',
        price: { basic: 901, premium: 1801, deluxe: 3601 },
        duration: '75-120 mins',
        benefits: ['Divine protection', 'Spiritual strength', 'Inner peace'],
        description: 'Nine days of Goddess worship for divine feminine energy.',
        items: ['Red flowers', 'Coconut', 'Chunari', 'Prasadam']
      }
    ],
    planetary: [
      {
        id: 6,
        name: 'Shani Pooja',
        sanskrit: 'शनि पूजा',
        icon: '🪐',
        price: { basic: 801, premium: 1601, deluxe: 3201 },
        duration: '60-90 mins',
        benefits: ['Saturn peace', 'Reduces hardships', 'Career growth'],
        description: 'Appease Lord Shani for reducing malefic effects.',
        items: ['Black sesame', 'Mustard oil', 'Iron ring', 'Prasadam']
      }
    ],
    personal: [
      {
        id: 7,
        name: 'Griha Pravesh',
        sanskrit: 'गृह प्रवेश',
        icon: '🏠',
        price: { basic: 1501, premium: 3001, deluxe: 6001 },
        duration: '120-180 mins',
        benefits: ['Home blessing', 'Positive energy', 'Family protection'],
        description: 'Bless your new home with divine energy and protection.',
        items: ['Kalash', 'Mango leaves', 'Turmeric', 'Rice', 'Prasadam']
      }
    ],
    corporate: [
      {
        id: 8,
        name: 'Office Inauguration',
        sanskrit: 'कार्यालय उद्घाटन',
        icon: '🏢',
        price: { basic: 2001, premium: 4001, deluxe: 8001 },
        duration: '90-150 mins',
        benefits: ['Business success', 'Team harmony', 'Prosperity'],
        description: 'Consecrate your office space for business success and growth.',
        items: ['Ganesha idol', 'Lotus', 'Gold kalash', 'Prasadam']
      }
    ]
  };

  const packages = [
    {
      id: 'basic',
      name: 'Basic Package',
      icon: '🕯️',
      features: ['Essential rituals', 'Basic items included', 'Digital certificate'],
      description: 'Traditional pooja with essential rituals and items'
    },
    {
      id: 'premium',
      name: 'Premium Package',
      icon: '🌟',
      features: ['Enhanced rituals', 'Premium items', 'Video recording', 'Prasadam delivery'],
      description: 'Enhanced experience with premium items and services',
      popular: true
    },
    {
      id: 'deluxe',
      name: 'Deluxe Package',
      icon: '👑',
      features: ['Complete ceremony', 'Luxury items', 'Live streaming', 'Home delivery', 'Priest consultation'],
      description: 'Ultimate spiritual experience with luxury items and personalized service'
    }
  ];

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  useEffect(() => {
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDetails(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedPooja(null);
    setSelectedPackage(null);
  };

  const handlePoojaSelect = (pooja) => {
    setSelectedPooja(pooja);
    setSelectedPackage(null);
    setBookingStep('details');
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleBookingDetailsChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookPooja = async () => {
    setLoading(true);
    try {
      const totalCost = selectedPooja.price[selectedPackage.id];
      
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, you would:
      // 1. Deduct credits or process payment
      // 2. Save booking to database
      // 3. Send confirmation email
      // 4. Schedule the pooja
      
      setBookingStep('confirmation');
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (bookingStep === 'details') {
      setBookingStep('browse');
      setSelectedPooja(null);
      setSelectedPackage(null);
    } else if (bookingStep === 'confirmation') {
      navigate('/pooja');
    } else {
      navigate('/pooja');
    }
  };

  const getCurrentPoojas = () => {
    return poojaData[selectedCategory] || [];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (bookingStep === 'confirmation') {
    return (
      <div className="pooja-container">
        <div className="confirmation-section">
          <div className="confirmation-icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p>Your {selectedPooja?.name} has been successfully booked.</p>
          
          <div className="booking-summary">
            <h3>Booking Details</h3>
            <div className="summary-item">
              <span>Pooja:</span>
              <span>{selectedPooja?.name}</span>
            </div>
            <div className="summary-item">
              <span>Package:</span>
              <span>{selectedPackage?.name}</span>
            </div>
            <div className="summary-item">
              <span>Date:</span>
              <span>{new Date(bookingDetails.date).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span>Time:</span>
              <span>{bookingDetails.time}</span>
            </div>
            <div className="summary-item">
              <span>Total Cost:</span>
              <span className="price-highlight">
                {formatPrice(selectedPooja?.price[selectedPackage?.id])}
              </span>
            </div>
          </div>

          <div className="confirmation-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
            <button className="btn-secondary" onClick={() => {
              setBookingStep('browse');
              setSelectedPooja(null);
              setSelectedPackage(null);
            }}>
              Book Another Pooja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pooja-container">
      {/* Header */}
      <div className="pooja-header">
        <button className="back-btn" onClick={handleGoBack}>
          <span>←</span>
          <span>Back</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">📖 Sacred Pooja</h1>
          <p className="page-subtitle">Divine blessing rituals for {user?.given_name || 'you'}</p>
        </div>
      </div>

      {bookingStep === 'browse' && (
        <>
          {/* Category Selection */}
          <div className="category-section">
            <h2>Select Pooja Category</h2>
            <div className="category-grid">
              {poojaCategories.map((category) => (
                <div
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                  <div className="category-count">
                    {poojaData[category.id]?.length || 0} poojas
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pooja Selection */}
          <div className="pooja-section">
            <h2>{poojaCategories.find(c => c.id === selectedCategory)?.name}</h2>
            <div className="pooja-grid">
              {getCurrentPoojas().map((pooja) => (
                <div key={pooja.id} className="pooja-card" onClick={() => handlePoojaSelect(pooja)}>
                  <div className="pooja-header-card">
                    <div className="pooja-icon">{pooja.icon}</div>
                    <div className="pooja-title">
                      <h3>{pooja.name}</h3>
                      <p className="sanskrit">{pooja.sanskrit}</p>
                    </div>
                  </div>

                  <div className="pooja-info">
                    <p className="description">{pooja.description}</p>
                    
                    <div className="benefits">
                      <h4>Benefits:</h4>
                      <ul>
                        {pooja.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pooja-meta">
                      <div className="duration">
                        <span className="meta-icon">⏰</span>
                        <span>{pooja.duration}</span>
                      </div>
                      <div className="price-range">
                        <span className="meta-icon">💰</span>
                        <span>From {formatPrice(pooja.price.basic)}</span>
                      </div>
                    </div>
                  </div>

                  <button className="select-pooja-btn">
                    Select This Pooja
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {bookingStep === 'details' && selectedPooja && (
        <div className="booking-details-section">
          {/* Selected Pooja Info */}
          <div className="selected-pooja-info">
            <div className="pooja-visual">
              <div className="pooja-icon-large">{selectedPooja.icon}</div>
              <div className="pooja-details">
                <h2>{selectedPooja.name}</h2>
                <p className="sanskrit">{selectedPooja.sanskrit}</p>
                <p className="description">{selectedPooja.description}</p>
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="package-section">
            <h3>Choose Your Package</h3>
            <div className="package-grid">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {pkg.popular && <div className="popular-badge">Most Popular</div>}
                  <div className="package-icon">{pkg.icon}</div>
                  <h4>{pkg.name}</h4>
                  <p className="package-description">{pkg.description}</p>
                  <div className="package-price">
                    {formatPrice(selectedPooja.price[pkg.id])}
                  </div>
                  <ul className="package-features">
                    {pkg.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-check">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {selectedPackage && (
            <div className="booking-form">
              <h3>Booking Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Devotee Name *</label>
                  <input
                    type="text"
                    value={bookingDetails.devotee_name}
                    onChange={(e) => handleBookingDetailsChange('devotee_name', e.target.value)}
                    placeholder="Enter devotee's name"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    value={bookingDetails.contact_number}
                    onChange={(e) => handleBookingDetailsChange('contact_number', e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    value={bookingDetails.date}
                    onChange={(e) => handleBookingDetailsChange('date', e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Time *</label>
                  <select
                    value={bookingDetails.time}
                    onChange={(e) => handleBookingDetailsChange('time', e.target.value)}
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Location/Address</label>
                  <textarea
                    value={bookingDetails.location}
                    onChange={(e) => handleBookingDetailsChange('location', e.target.value)}
                    placeholder="Enter location or address where pooja will be performed"
                    rows={3}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Special Requirements</label>
                  <textarea
                    value={bookingDetails.special_requirements}
                    onChange={(e) => handleBookingDetailsChange('special_requirements', e.target.value)}
                    placeholder="Any special requirements or instructions"
                    rows={3}
                  />
                </div>
              </div>

              <div className="booking-summary-card">
                <h4>Booking Summary</h4>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Pooja:</span>
                    <span>{selectedPooja.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Package:</span>
                    <span>{selectedPackage.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Duration:</span>
                    <span>{selectedPooja.duration}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Cost:</span>
                    <span className="price-highlight">
                      {formatPrice(selectedPooja.price[selectedPackage.id])}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="book-now-btn"
                onClick={handleBookPooja}
                disabled={loading || !bookingDetails.devotee_name || !bookingDetails.contact_number || !bookingDetails.time}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <span>🙏</span>
                    <span>Book Sacred Pooja</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BookPooja;
