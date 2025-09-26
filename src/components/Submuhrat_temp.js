import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Submuhrat() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const muhratCategories = [
    {
      id: 'marriage',
      title: 'विवाह मुहूर्त',
      subtitle: 'Marriage Muhurat',
      icon: '💒',
      color: 'marriage',
      items: [
        'Wedding Ceremony',
        'Engagement',
        'Ring Ceremony',
        'Tilak Ceremony',
        'Mehendi Ceremony'
      ]
    },
    {
      id: 'business',
      title: 'व्यापार मुहूर्त',
      subtitle: 'Business Muhurat',
      icon: '🏢',
      color: 'business',
      items: [
        'Shop Opening',
        'Business Launch',
        'Partnership',
        'Investment',
        'Contract Signing'
      ]
    },
    {
      id: 'property',
      title: 'संपत्ति मुहूर्त',
      subtitle: 'Property Muhurat',
      icon: '🏠',
      color: 'property',
      items: [
        'House Purchase',
        'Griha Pravesh',
        'Foundation Laying',
        'Construction Start',
        'Property Registration'
      ]
    },
    {
      id: 'vehicle',
      title: 'वाहन मुहूर्त',
      subtitle: 'Vehicle Muhurat',
      icon: '🚗',
      color: 'vehicle',
      items: [
        'Car Purchase',
        'Two Wheeler',
        'Commercial Vehicle',
        'First Drive',
        'Vehicle Registration'
      ]
    },
    {
      id: 'education',
      title: 'शिक्षा मुहूर्त',
      subtitle: 'Education Muhurat',
      icon: '📚',
      color: 'education',
      items: [
        'Admission',
        'Exam Registration',
        'Course Start',
        'Vidyarambh',
        'Study Abroad'
      ]
    },
    {
      id: 'travel',
      title: 'यात्रा मुहूर्त',
      subtitle: 'Travel Muhurat',
      icon: '✈️',
      color: 'travel',
      items: [
        'Long Journey',
        'Pilgrimage',
        'Foreign Travel',
        'Business Trip',
        'Holiday Trip'
      ]
    },
    {
      id: 'ceremony',
      title: 'संस्कार मुहूर्त',
      subtitle: 'Ceremony Muhurat',
      icon: '🙏',
      color: 'ceremony',
      items: [
        'Naamkaran',
        'Mundan',
        'Thread Ceremony',
        'Annaprashan',
        'Birthday'
      ]
    },
    {
      id: 'festival',
      title: 'त्योहार मुहूर्त',
      subtitle: 'Festival Muhurat',
      icon: '🎉',
      color: 'festival',
      items: [
        'Diwali',
        'Navratri',
        'Karva Chauth',
        'Ganesh Chaturthi',
        'Durga Puja'
      ]
    }
  ];

  const getMuhratDetails = (category, item) => {
    const message = `Please provide detailed information about ${item} muhurat from ${category.subtitle} category. Include auspicious dates, timings, and important considerations for ${item}.`;
    
    navigate('/chat', { 
      state: { initialMessage: message }
    });
  };

  const getCategoryDetails = (category) => {
    const message = `Please provide comprehensive information about ${category.subtitle} (${category.title}) including all important muhurat timings, considerations, and best practices.`;
    
    navigate('/chat', { 
      state: { initialMessage: message }
    });
  };

  return (
    <div className="submuhrat-container">
      <div className="submuhrat-header">
        <h1 className="page-title">🕒 शुभ मुहूर्त</h1>
        <h2 className="page-subtitle">Auspicious Timings</h2>
        <p className="page-desc">Find the perfect time for your important life events</p>
      </div>

      <div className="categories-grid">
        {muhratCategories.map((category) => (
          <div 
            key={category.id} 
            className={`category-card ${category.color}`}
          >
            <div className="category-header">
              <div className="category-icon">{category.icon}</div>
              <div className="category-titles">
                <h3 className="category-title">{category.title}</h3>
                <p className="category-subtitle">{category.subtitle}</p>
              </div>
            </div>
            
            <div className="category-items">
              {category.items.map((item, index) => (
                <button
                  key={index}
                  className="muhrat-item"
                  onClick={() => getMuhratDetails(category, item)}
                >
                  <span className="item-text">{item}</span>
                  <span className="item-arrow">→</span>
                </button>
              ))}
            </div>

            <button 
              className="category-view-all"
              onClick={() => getCategoryDetails(category)}
            >
              View All {category.subtitle} Details
            </button>
          </div>
        ))}
      </div>

      <div className="muhrat-info">
        <div className="info-card">
          <h3>🌟 Why Muhurat Matters?</h3>
          <div className="info-points">
            <div className="info-point">
              <span className="point-icon">⭐</span>
              <span className="point-text">Align with cosmic energies</span>
            </div>
            <div className="info-point">
              <span className="point-icon">🔮</span>
              <span className="point-text">Maximize success potential</span>
            </div>
            <div className="info-point">
              <span className="point-icon">🙏</span>
              <span className="point-text">Follow ancient wisdom</span>
            </div>
            <div className="info-point">
              <span className="point-icon">✨</span>
              <span className="point-text">Ensure divine blessings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="general-chat">
        <button 
          className="general-chat-btn"
          onClick={() => navigate('/chat')}
        >
          💬 Ask Guru ji About Any Muhurat
        </button>
      </div>
    </div>
  );
}

export default Submuhrat;
