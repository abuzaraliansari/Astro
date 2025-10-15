import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { submitFeedback } from '../api';

function Feedback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [feedbackType, setFeedbackType] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [otherIssueText, setOtherIssueText] = useState('');

  // ✅ Refs for auto-scroll
  const categoryRef = useRef(null);
  const textAreaRef = useRef(null);
  const attachmentRef = useRef(null);
  const otherInputRef = useRef(null);

  const feedbackCategories = [
    { id: 'accuracy', label: 'Accuracy', icon: '🎯' },
    { id: 'response-time', label: 'Response Time', icon: '⚡' },
    { id: 'clarity', label: 'Clarity', icon: '💡' },
    { id: 'helpfulness', label: 'Helpfulness', icon: '🤝' },
    { id: 'user-interface', label: 'User Interface', icon: '🎨' },
    { id: 'features', label: 'Features', icon: '⭐' }
  ];

  const issueCategories = [
    { id: 'login-issue', label: 'Login Issue', icon: '🔐' },
    { id: 'response-error', label: 'Response Error', icon: '❌' },
    { id: 'ui-bug', label: 'UI Bug', icon: '🐛' },
    { id: 'slow-performance', label: 'Slow Performance', icon: '🐌' },
    { id: 'payment-issue', label: 'Payment Issue', icon: '💳' },
    { id: 'other', label: 'Other', icon: '🔧' }
  ];

  // ✅ Auto-scroll when rating changes
  useEffect(() => {
    if (rating > 0 && categoryRef.current) {
      setTimeout(() => {
        categoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [rating]);

  /*/ ✅ Auto-scroll when categories are selected
  useEffect(() => {
    if (selectedCategories.length > 0 && textAreaRef.current) {
      setTimeout(() => {
        textAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [selectedCategories]);
*/
  // ✅ Auto-scroll when "Other" is selected
  useEffect(() => {
    if (selectedCategories.includes('other') && otherInputRef.current) {
      setTimeout(() => {
        otherInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selectedCategories]);

  // ✅ Auto-scroll when text is entered
  useEffect(() => {
    if (feedbackText.length > 20 && attachmentRef.current) {
      setTimeout(() => {
        attachmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [feedbackText]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024;
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type);
      return isValidSize && isValidType;
    });

    if (files.length !== validFiles.length) {
      alert('Some files were skipped. Only JPG, PNG, and PDF files under 5MB are allowed.');
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (feedbackType === 'feedback' && rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }

    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    if (feedbackType === 'issue' && selectedCategories.includes('other') && !otherIssueText.trim()) {
      alert('Please specify the issue type for "Other"');
      return;
    }

    if (!feedbackText.trim()) {
      alert('Please provide your feedback or describe the issue');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Create FormData for file upload
      const formData = new FormData();
      formData.append('userId', user?.userId || user?.id);

      formData.append('userName', user?.fullname || user?.name || 'Anonymous');
      formData.append('type', feedbackType);
      formData.append('rating', rating || '');
      formData.append('categories', JSON.stringify(selectedCategories));
      formData.append('otherIssueText', otherIssueText || '');
      formData.append('feedback', feedbackText);
      // In handleSubmit function, add userEmail to formData
formData.append('userEmail', user?.email || 'noreply@astroguru.com');

      formData.append('timestamp', new Date().toISOString());
      
      // ✅ Append files with correct field name for multer
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      console.log('📤 Submitting feedback:', {
        userId: user?.id,
        userName: user?.fullname,
        type: feedbackType,
        rating,
        categoriesCount: selectedCategories.length,
        attachmentsCount: attachments.length
      });

      // ✅ Call backend API
      const response = await submitFeedback(formData);

      if (response.data.success) {
        console.log('✅ Feedback submitted successfully:', response.data);
        setShowSuccessMessage(true);
        setTimeout(() => navigate('/chat'), 3000);
      } else {
        throw new Error(response.data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      alert(error.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (showSuccessMessage) {
    return (
      <div className="fb-success-screen">
        <div className="fb-success-card">
          <div className="fb-success-icon">✨</div>
          <h2 className="fb-success-title">Thank You!</h2>
          <p className="fb-success-text">
            {feedbackType === 'issue' 
              ? 'Your issue has been reported. Our team will look into it.'
              : 'Your feedback helps us improve your cosmic journey experience.'}
          </p>
          <div className="fb-success-star">🌟</div>
          <p className="fb-success-redirect">Redirecting you back to chat...</p>
        </div>
      </div>
    );
  }

  // Type Selection Screen
  if (!feedbackType) {
    return (
      <div className="fb-page-wrapper">
        <div className="fb-main-container">
          <div className="fb-top-section">
            <button className="fb-close-button" onClick={() => navigate('/chat')}>×</button>
            <h1 className="fb-main-title">How can we help you?</h1>
            <p className="fb-main-subtitle">Choose what you'd like to do</p>
          </div>

          <div className="fb-type-grid">
            <button className="fb-type-option fb-type-issue" onClick={() => setFeedbackType('issue')}>
              <div className="fb-type-emoji">🐛</div>
              <h3 className="fb-type-heading">Report an Issue</h3>
              <p className="fb-type-desc">Having trouble? Let us know what's wrong</p>
            </button>

            <button className="fb-type-option fb-type-feedback" onClick={() => setFeedbackType('feedback')}>
              <div className="fb-type-emoji">💬</div>
              <h3 className="fb-type-heading">Give Feedback</h3>
              <p className="fb-type-desc">Share your thoughts and help us improve</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="fb-page-wrapper">
      <div className="fb-main-container">
        <div className="fb-top-section">
          <button className="fb-close-button" onClick={() => setFeedbackType(null)}>×</button>
          <h1 className="fb-main-title">
            {feedbackType === 'issue' ? 'Report an Issue' : 'Share Your Experience'}
          </h1>
          <p className="fb-main-subtitle">
            {feedbackType === 'issue' 
              ? 'Help us fix the problem quickly'
              : 'Help us improve Astro AI for you and others'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="fb-input-form">
          
          {/* Star Rating */}
          {feedbackType === 'feedback' && (
            <div className="fb-form-group">
              <label className="fb-input-label">How would you rate your experience?</label>
              <div className="fb-star-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`fb-star-btn ${star <= (hoveredRating || rating) ? 'fb-star-active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="fb-rating-label">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>
          )}

          {/* Categories */}
          <div className="fb-form-group" ref={categoryRef}>
            <label className="fb-input-label">
              {feedbackType === 'issue' ? 'Where did you face the issue?' : 'What would you like to highlight?'}
            </label>
            <div className="fb-category-grid">
              {(feedbackType === 'issue' ? issueCategories : feedbackCategories).map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`fb-category-box ${selectedCategories.includes(category.id) ? 'fb-category-selected' : ''}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="fb-category-emoji">{category.icon}</span>
                  <span className="fb-category-name">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Other Input */}
            {feedbackType === 'issue' && selectedCategories.includes('other') && (
              <div className="fb-other-input-wrapper" ref={otherInputRef}>
                <label className="fb-input-label-small" htmlFor="fb-other-input">
                  Please specify the issue type:
                </label>
                <input
                  type="text"
                  id="fb-other-input"
                  className="fb-other-input"
                  placeholder="E.g., Chart generation error, Export problem, etc."
                  value={otherIssueText}
                  onChange={(e) => setOtherIssueText(e.target.value)}
                  maxLength={100}
                />
                <div className="fb-char-count-small">{otherIssueText.length} / 100 characters</div>
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="fb-form-group" ref={textAreaRef}>
            <label className="fb-input-label" htmlFor="fb-text-area">
              {feedbackType === 'issue' ? 'Describe the issue *' : 'Tell us more (optional)'}
            </label>
            <textarea
              id="fb-text-area"
              className="fb-text-area"
              placeholder={feedbackType === 'issue' 
                ? 'Please describe the issue in detail. What happened? When did it occur?'
                : 'Share your thoughts, suggestions, or what you loved about your experience...'}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows="6"
              maxLength={500}
              required={feedbackType === 'issue'}
            />
            <div className="fb-char-count">{feedbackText.length} / 500 characters</div>
          </div>

          {/* Attachments */}
          <div className="fb-form-group" ref={attachmentRef}>
            <label className="fb-input-label">
              Attachments (optional)
              <span className="fb-file-note">PNG, JPG, or PDF up to 5MB</span>
            </label>
            
            <div className="fb-upload-zone">
              <input
                type="file"
                id="fb-file-input"
                className="fb-file-hidden"
                multiple
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={handleFileUpload}
              />
              <label htmlFor="fb-file-input" className="fb-upload-label">
                <span className="fb-upload-emoji">📎</span>
                <span className="fb-upload-text">Click to upload or drag files here</span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="fb-file-list">
                {attachments.map((file, index) => (
                  <div key={index} className="fb-file-row">
                    <span className="fb-file-emoji">{file.type.includes('pdf') ? '📄' : '🖼️'}</span>
                    <span className="fb-file-name">{file.name}</span>
                    <span className="fb-file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button type="button" className="fb-file-remove" onClick={() => removeAttachment(index)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="fb-submit-wrapper">
            <button type="submit" className="fb-submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="fb-spinner"></span>
                  Submitting...
                </>
              ) : (
                feedbackType === 'issue' ? 'Submit Issue' : 'Submit Feedback'
              )}
            </button>
          </div>
        </form>

        <div className="fb-bottom-note">
          <p>🔒 Your {feedbackType === 'issue' ? 'issue report' : 'feedback'} is secure and helps us serve you better</p>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
