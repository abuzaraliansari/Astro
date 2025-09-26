import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function CallGuru() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(0); // 0 = today, 1 = tomorrow, etc.
  const scrollRef = useRef(null);

  // ✅ MULTIPLE GURU PROFILES
  const gurus = [
    {
      id: 'guru1',
      avatar: '🧙‍♂️',
      name: 'Pandit Rajesh Sharma',
      qualification: '25+ Years Experience • Vedic Astrology Expert',
      specialties: ['Vedic Astrology', 'Kundli Reading', 'Marriage Consultation'],
      rating: '4.9',
      consultations: '2,500+',
      languages: ['Hindi', 'English', 'Sanskrit']
    },
    {
      id: 'guru2',
      avatar: '👨‍🦳',
      name: 'Dr. Arun Mishra',
      qualification: '30+ Years Experience • Numerology & Palmistry',
      specialties: ['Numerology', 'Palmistry', 'Career Guidance'],
      rating: '4.8',
      consultations: '1,800+',
      languages: ['Hindi', 'English']
    },
    {
      id: 'guru3',
      avatar: '🧔‍♂️',
      name: 'Guruji Vikram Singh',
      qualification: '20+ Years Experience • Vastu & Business Astrology',
      specialties: ['Vastu Shastra', 'Business Astrology', 'Property Consultation'],
      rating: '4.7',
      consultations: '3,200+',
      languages: ['Hindi', 'English', 'Punjabi']
    },
    {
      id: 'guru4',
      avatar: '👴',
      name: 'Pandit Suresh Kumar',
      qualification: '35+ Years Experience • Gemstone & Remedies Expert',
      specialties: ['Gemstone Consultation', 'Remedies', 'Spiritual Healing'],
      rating: '4.9',
      consultations: '4,100+',
      languages: ['Hindi', 'English', 'Bengali']
    },
    {
      id: 'guru5',
      avatar: '🕴️',
      name: 'Acharya Mohan Das',
      qualification: '28+ Years Experience • Horary & Prashna Astrology',
      specialties: ['Horary Astrology', 'Prashna Kundli', 'Lost Object Finding'],
      rating: '4.8',
      consultations: '2,900+',
      languages: ['Hindi', 'English', 'Gujarati']
    }
  ];

  // ✅ CONSULTATION TYPES (30 & 60 MIN ONLY)
  const consultationTypes = [
    { id: 'general', name: 'General Consultation', duration: 30, price: '₹500', credits: 50 },
    { id: 'kundli', name: 'Kundli Reading', duration: 60, price: '₹800', credits: 80 },
    { id: 'marriage', name: 'Marriage Consultation', duration: 60, price: '₹1200', credits: 120 },
    { id: 'career', name: 'Career Guidance', duration: 30, price: '₹600', credits: 60 },
    { id: 'business', name: 'Business Consultation', duration: 60, price: '₹1000', credits: 100 },
    { id: 'remedies', name: 'Remedies & Solutions', duration: 30, price: '₹400', credits: 40 }
  ];

  // ✅ BASE TIME SLOTS (1-hour slots that can be split)
  const baseTimeSlots = [
    { startHour: 9, endHour: 10, label: '9:00 - 10:00 AM' },
    { startHour: 10, endHour: 11, label: '10:00 - 11:00 AM' },
    { startHour: 11, endHour: 12, label: '11:00 - 12:00 PM' },
    { startHour: 14, endHour: 15, label: '2:00 - 3:00 PM' },
    { startHour: 15, endHour: 16, label: '3:00 - 4:00 PM' },
    { startHour: 16, endHour: 17, label: '4:00 - 5:00 PM' },
    { startHour: 19, endHour: 20, label: '7:00 - 8:00 PM' },
    { startHour: 20, endHour: 21, label: '8:00 - 9:00 PM' }
  ];

  // ✅ GENERATE WEEKLY DATES
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0
      });
    }
    return dates;
  };

  const [weekDates] = useState(getWeekDates());
  const [existingBookings, setExistingBookings] = useState([]);

  // ✅ LOAD BOOKINGS FROM LOCALSTORAGE
  useEffect(() => {
    const savedBookings = localStorage.getItem('astroguru_all_bookings');
    if (savedBookings) {
      try {
        setExistingBookings(JSON.parse(savedBookings));
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    }
  }, []);

  // ✅ GENERATE AVAILABLE SLOTS FOR SELECTED GURU AND DATE
  const generateAvailableSlots = () => {
    if (!selectedGuru) return [];
    
    const selectedDateObj = weekDates[selectedDate];
    const dateKey = selectedDateObj.date.toDateString();
    
    const availableSlots = [];
    
    baseTimeSlots.forEach(baseSlot => {
      // Get existing bookings for this guru, date, and time slot
      const existingSlotBookings = existingBookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate).toDateString();
        return (
          booking.guruId === selectedGuru &&
          bookingDate === dateKey &&
          booking.startHour === baseSlot.startHour
        );
      });

      if (existingSlotBookings.length === 0) {
        // Full hour available
        availableSlots.push({
          id: `${baseSlot.startHour}-${baseSlot.endHour}`,
          startHour: baseSlot.startHour,
          endHour: baseSlot.endHour,
          startMinute: 0,
          endMinute: 0,
          label: baseSlot.label,
          duration: 60,
          available: true,
          type: 'full'
        });
      } else {
        // Check what portions are booked
        const bookedMinutes = [];
        existingSlotBookings.forEach(booking => {
          const start = booking.startMinute || 0;
          const end = start + booking.duration;
          for (let i = start; i < end; i++) {
            bookedMinutes.push(i);
          }
        });

        // Generate available sub-slots
        if (bookedMinutes.length < 60) {
          // Check for 30-minute slots
          if (!bookedMinutes.some(min => min >= 0 && min < 30)) {
            availableSlots.push({
              id: `${baseSlot.startHour}-${baseSlot.startHour}:30`,
              startHour: baseSlot.startHour,
              endHour: baseSlot.startHour,
              startMinute: 0,
              endMinute: 30,
              label: `${formatTime(baseSlot.startHour, 0)} - ${formatTime(baseSlot.startHour, 30)}`,
              duration: 30,
              available: true,
              type: 'half-first'
            });
          }

          if (!bookedMinutes.some(min => min >= 30 && min < 60)) {
            availableSlots.push({
              id: `${baseSlot.startHour}:30-${baseSlot.endHour}`,
              startHour: baseSlot.startHour,
              endHour: baseSlot.endHour,
              startMinute: 30,
              endMinute: 0,
              label: `${formatTime(baseSlot.startHour, 30)} - ${formatTime(baseSlot.endHour, 0)}`,
              duration: 30,
              available: true,
              type: 'half-second'
            });
          }
        }
      }
    });

    return availableSlots;
  };

  // ✅ FORMAT TIME HELPER
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute === 0 ? '00' : minute;
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // ✅ HORIZONTAL SCROLL FUNCTIONS
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  // ✅ CANCEL BOOKING FUNCTION
  const cancelBooking = (bookingId) => {
    const updatedBookings = existingBookings.filter(booking => booking.id !== bookingId);
    localStorage.setItem('astroguru_all_bookings', JSON.stringify(updatedBookings));
    setExistingBookings(updatedBookings);
    alert('✅ Booking cancelled successfully!');
  };

  // ✅ ENHANCED BOOKING FUNCTION
  const bookCall = () => {
    if (!selectedGuru || !selectedConsultation || !selectedTimeSlot || !user) {
      alert('Please select Guru, consultation type, and time slot');
      return;
    }

    const selectedSlot = generateAvailableSlots().find(slot => slot.id === selectedTimeSlot);
    const selectedDateObj = weekDates[selectedDate];
    const consultationType = consultationTypes.find(c => c.id === selectedConsultation);
    const guruInfo = gurus.find(g => g.id === selectedGuru);

    if (!selectedSlot || consultationType.duration > selectedSlot.duration) {
      alert('Selected consultation duration does not fit in the selected time slot');
      return;
    }

    const booking = {
      id: Date.now().toString(),
      userId: user.id,
      guruId: selectedGuru,
      guru: guruInfo,
      consultation: consultationType,
      startHour: selectedSlot.startHour,
      startMinute: selectedSlot.startMinute,
      duration: consultationType.duration,
      timeSlotLabel: selectedSlot.label,
      bookingDate: selectedDateObj.date.toISOString(),
      dateLabel: `${selectedDateObj.dayName}, ${selectedDateObj.monthName} ${selectedDateObj.dayNumber}`,
      status: 'confirmed',
      userName: user.full_name || user.name,
      userEmail: user.email,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const newBookings = [...existingBookings, booking];
    localStorage.setItem('astroguru_all_bookings', JSON.stringify(newBookings));
    setExistingBookings(newBookings);

    // Show success message
    alert(`✅ Call Booked Successfully!\n\nGuru: ${booking.guru.name}\nConsultation: ${booking.consultation.name} (${booking.consultation.duration} min)\nDate: ${booking.dateLabel}\nTime: ${booking.timeSlotLabel}\nPrice: ${booking.consultation.price}`);

    // Reset selections
    setSelectedGuru(null);
    setSelectedConsultation(null);
    setSelectedTimeSlot(null);
  };

  // ✅ GET USER'S BOOKINGS
  const getUserBookings = () => {
    return existingBookings.filter(booking => booking.userId === user?.id);
  };

  // ✅ GET SELECTED ITEMS FOR DISPLAY
  const getSelectedGuru = () => gurus.find(g => g.id === selectedGuru);
  const getSelectedConsultation = () => consultationTypes.find(c => c.id === selectedConsultation);
  const getSelectedTimeSlot = () => {
    const slots = generateAvailableSlots();
    return slots.find(slot => slot.id === selectedTimeSlot);
  };

  return (
    <div className="call-container">
      <div className="call-header">
        <h1 className="page-title">📞 Call Guru ji</h1>
        <p className="page-subtitle">Direct personal consultation with expert astrologers</p>
      </div>

      {/* ✅ HORIZONTAL SCROLLING GURU PROFILES */}
      <div className="guru-profiles-section">
        <div className="section-header">
          <h3>🧙‍♂️ Choose Your Guru</h3>
          <div className="scroll-controls">
            <button className="scroll-btn scroll-left" onClick={scrollLeft}>‹</button>
            <button className="scroll-btn scroll-right" onClick={scrollRight}>›</button>
          </div>
        </div>

        <div className="guru-profiles-container" ref={scrollRef}>
          {gurus.map((guru) => (
            <div 
              key={guru.id} 
              className={`guru-card ${selectedGuru === guru.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedGuru(guru.id);
                setSelectedTimeSlot(null); // Reset time slot when changing guru
              }}
            >
              <div className="guru-avatar">{guru.avatar}</div>
              <div className="guru-info">
                <h4 className="guru-name">{guru.name}</h4>
                <p className="guru-qualification">{guru.qualification}</p>
                <div className="guru-rating">
                  <span className="stars">⭐⭐⭐⭐⭐</span>
                  <span className="rating-text">{guru.rating} ({guru.consultations} consultations)</span>
                </div>
                <div className="guru-specialties">
                  {guru.specialties.map((specialty, idx) => (
                    <span key={idx} className="specialty-tag">{specialty}</span>
                  ))}
                </div>
                <div className="guru-languages">
                  <span className="lang-label">Languages:</span>
                  <span className="lang-list">{guru.languages.join(', ')}</span>
                </div>
              </div>
              {selectedGuru === guru.id && <div className="selected-indicator">✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ CONSULTATION TYPES */}
      <div className="consultation-types">
        <h3>🔮 Choose Consultation Type</h3>
        <div className="types-grid">
          {consultationTypes.map((type) => (
            <div 
              key={type.id} 
              className={`consultation-card ${selectedConsultation === type.id ? 'selected' : ''}`}
              onClick={() => setSelectedConsultation(type.id)}
            >
              <div className="consult-info">
                <h4 className="consult-name">{type.name}</h4>
                <div className="consult-details">
                  <span className="consult-duration">⏱️ {type.duration} min</span>
                  <span className="consult-price">{type.price}</span>
                </div>
              </div>
              {selectedConsultation === type.id && <div className="selected-indicator">✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ WEEKLY DATE SELECTOR */}
      <div className="date-selector">
        <h3>📅 Select Date</h3>
        <div className="dates-grid">
          {weekDates.map((dateObj, index) => (
            <button
              key={index}
              className={`date-btn ${selectedDate === index ? 'selected' : ''} ${dateObj.isToday ? 'today' : ''}`}
              onClick={() => {
                setSelectedDate(index);
                setSelectedTimeSlot(null); // Reset time slot when changing date
              }}
            >
              <div className="date-day">{dateObj.dayName}</div>
              <div className="date-number">{dateObj.dayNumber}</div>
              <div className="date-month">{dateObj.monthName}</div>
              {dateObj.isToday && <div className="today-indicator">Today</div>}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ DYNAMIC TIME SLOTS */}
      {selectedGuru && (
        <div className="time-slots">
          <h3>⏰ Available Time Slots - {weekDates[selectedDate].dayName}, {weekDates[selectedDate].monthName} {weekDates[selectedDate].dayNumber}</h3>
          <div className="slots-grid">
            {generateAvailableSlots().map((slot) => (
              <button
                key={slot.id}
                className={`slot-btn ${selectedTimeSlot === slot.id ? 'selected' : ''} ${slot.type}`}
                onClick={() => setSelectedTimeSlot(slot.id)}
              >
                <span className="slot-time">{slot.label}</span>
                <span className="slot-duration">{slot.duration} min available</span>
                <span className="slot-status">✅ Available</span>
              </button>
            ))}
            {generateAvailableSlots().length === 0 && (
              <div className="no-slots">
                <p>😔 No available slots for this day</p>
                <p>Please select another date</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ ENHANCED BOOKING SECTION */}
      <div className="booking-section">
        <div className="booking-info">
          <h3>📋 Your Booking Details</h3>
          <div className="booking-details">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user?.full_name || 'Please login'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Selected Guru:</span>
              <span className="detail-value">
                {getSelectedGuru()?.name || 'Please select a Guru'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Consultation:</span>
              <span className="detail-value">
                {getSelectedConsultation() ? `${getSelectedConsultation().name} (${getSelectedConsultation().duration} min)` : 'Please select consultation type'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">
                {`${weekDates[selectedDate].dayName}, ${weekDates[selectedDate].monthName} ${weekDates[selectedDate].dayNumber}`}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time Slot:</span>
              <span className="detail-value">
                {getSelectedTimeSlot()?.label || 'Please select time slot'}
              </span>
            </div>
            <div className="detail-row total-row">
              <span className="detail-label">Total:</span>
              <span className="detail-value price-highlight">
                {getSelectedConsultation()?.price || '₹0'}
              </span>
            </div>
          </div>
        </div>

        <button 
          className="book-call-btn"
          onClick={bookCall}
          disabled={!selectedTimeSlot || !selectedGuru || !selectedConsultation || !user}
        >
          📞 Book Call - Pay Now
        </button>
      </div>

      {/* ✅ USER'S BOOKINGS WITH CANCEL OPTION */}
      {getUserBookings().length > 0 && (
        <div className="existing-bookings">
          <h3>📅 Your Bookings</h3>
          <div className="bookings-list">
            {getUserBookings().slice(-5).reverse().map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-guru">
                  <span className="booking-avatar">{booking.guru.avatar}</span>
                  <div className="booking-info-mini">
                    <div className="booking-name">{booking.guru.name}</div>
                    <div className="booking-consultation">{booking.consultation.name}</div>
                  </div>
                </div>
                <div className="booking-details-mini">
                  <div className="booking-date">{booking.dateLabel}</div>
                  <div className="booking-time">{booking.timeSlotLabel}</div>
                  <div className="booking-price">{booking.consultation.price}</div>
                  <div className="booking-status">{booking.status}</div>
                </div>
                <div className="booking-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      if (window.confirm(`Cancel booking with ${booking.guru.name}?\n\nDate: ${booking.dateLabel}\nTime: ${booking.timeSlotLabel}`)) {
                        cancelBooking(booking.id);
                      }
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ CALL FEATURES */}
      <div className="call-features">
        <h3>🌟 What You Get</h3>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Personalized guidance based on your birth chart</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📞</span>
            <span className="feature-text">Direct phone consultation with expert</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📝</span>
            <span className="feature-text">Detailed remedies and suggestions</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <span className="feature-text">Follow-up support via chat</span>
          </div>
        </div>
      </div>

      {/* ✅ EMERGENCY CHAT */}
      <div className="emergency-chat">
        <button 
          className="emergency-btn"
          onClick={() => navigate('/chat')}
        >
          💬 Need Immediate Help? Chat Now
        </button>
      </div>
    </div>
  );
}

export default CallGuru;
