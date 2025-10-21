import React, { useState, useEffect, useRef  } from 'react';
import { useAuth } from '../AuthContext';
import { getCreditPackages, purchaseCredits } from '../api';
import { useNavigate, useLocation } from 'react-router-dom'

function CreditPurchase() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshCredits } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [creditPackages, setCreditPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get('source');

  const purchaseSectionRef = useRef(null);

  // ✅ Fetch credit packages from API on component mount
  useEffect(() => {
    const fetchCreditPackages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('📦 Fetching credit packages from backend API...');

        const response = await getCreditPackages();

        if (response.data && response.data.success) {
          const packages = response.data.packages.map(pkg => ({
            id: pkg.packageId,
            credits: pkg.baseCredits,
            price: pkg.price,
            badge: pkg.packageName,
            badgeColor: pkg.badgeColor,
            bonus: pkg.bonusCredits,
            totalCredits: pkg.totalCredits,
            description: pkg.description,
            features: pkg.features
          }));

          setCreditPackages(packages);
          console.log('✅ Credit packages loaded:', packages);
        } else {
          throw new Error('Failed to fetch credit packages');
        }
      } catch (error) {
        console.error('❌ Error fetching credit packages:', error);
        setError('Failed to load credit packages. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreditPackages();
  }, []);

  // ✅ Handle package selection
  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData);
    console.log('📦 Package selected:', packageData);

    setTimeout(() => {
    if (purchaseSectionRef.current) {
      purchaseSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, 100);
  };
  const chatContainerStyle = {
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(/uploads/chat.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

  // ✅ Generate unique transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN${timestamp}_${user.userId}_${selectedPackage.id}_${random}`;
  };


  
  // ✅ Purchase handler with limit error handling
  const handlePurchase = async () => {
    if (!selectedPackage || isProcessing) {
      if (!selectedPackage) {
        alert('⚠️ Please select a credit package first!');
      }
      return;
    }

    if (!user?.userId) {
      alert('❌ User not found. Please log in again.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    console.log('💳 Processing purchase:', selectedPackage);

    try {
      const transactionId = generateTransactionId();

      console.log('📤 Sending purchase request:', {
        userId: user.userId,
        packageId: selectedPackage.id,
        transactionId,
        totalCredits: selectedPackage.totalCredits,
        amountPaid: selectedPackage.price
      });

      const response = await purchaseCredits(
        user.userId,
        selectedPackage.id,
        transactionId,
        'credit_pack',
        'web',
        'razorpay',
        'online',
        'INR',
        'completed'
      );

      if (response.data && response.data.success) {
        const result = response.data;
        console.log('✅ Purchase successful:', result);

        await refreshCredits();
        /* 
              const successMessage = `🎉 Purchase Successful!\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Package: ${result.purchase.packageName}\n` +
                `Base Credits: ${result.purchase.baseCredits}\n` +
                `Bonus Credits: +${result.purchase.bonusCredits} 🎁\n` +
                `Total Credits: ${result.purchase.totalCredits}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `💰 Balance Update:\n` +
                `Previous: ${result.balance.previousCredits} credits\n` +
                `Added: +${result.balance.addedCredits} credits\n` +
                `New Balance: ${result.balance.currentCredits} credits\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `📊 Limit Info:\n` +
                `Total Purchased: ${result.limitInfo.totalPurchased} credits\n` +
                `Remaining Limit: ${result.limitInfo.remainingLimit}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `💳 Transaction ID: ${result.purchase.transactionId}`;
        
              alert(successMessage);
        */

        // ✅ NEW: Simplified Success Message
        const successMessage =
          `🎉 Purchase Successful!\n\n` +
          `Total Credits Added: ${result.purchase.totalCredits}\n` +
          `💳 Transaction ID: ${result.purchase.transactionId}`;

        alert(successMessage);

        setSelectedPackage(null);
        if (source === 'call') {
    navigate('/call'); // Goes back to CallGuru page
  } else {
    navigate('/chat'); // Default: goes to chat
  }
      } else {
        throw new Error(response.data?.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);

      /*
      // ✅ Handle credit limit error
      if (error.response?.status === 400 && error.response?.data?.error === 'Credit limit exceeded') {
        const limitData = error.response.data;

        let errorMessage = `⚠️ Credit Limit Exceeded!\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${limitData.message}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📊 Your Limit Info:\n` +
          `Total Limit: ${limitData.limitInfo.creditsLimit} credits\n` +
          `Already Purchased: ${limitData.limitInfo.totalPurchased} credits\n` +
          `Remaining Limit: ${limitData.limitInfo.remainingLimit} credits\n` +
          `Attempted Purchase: ${limitData.limitInfo.attemptedPurchase} credits\n` +
          `Excess Amount: ${limitData.limitInfo.excessAmount} credits\n\n`;

        if (limitData.availablePackages && limitData.availablePackages.length > 0) {
          errorMessage += `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `✅ Available Packages:\n`;
          limitData.availablePackages.forEach(pkg => {
            errorMessage += `• ${pkg.name}: ${pkg.totalCredits} credits (₹${pkg.price})\n`;
          });
        } else {
          errorMessage += `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `⚠️ No packages available within your limit.\n`;
        }

        errorMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📞 Contact for Limit Extension:\n` +
          `${limitData.contactInfo.name}\n` +
          `Mobile: ${limitData.contactInfo.mobile}`;

        alert(errorMessage);
      }
        */

      // ✅ NEW: Simplified Error with WhatsApp Integration
      // ✅ REPLACE THIS ENTIRE SECTION
      if (error.response?.status === 400 && error.response?.data?.error === 'Credit limit exceeded') {
        const limitData = error.response.data;

        // ✅ Create professional WhatsApp message
        const whatsappMessage =
          `${user.full_name || user.name} (${user.email})\n` +
          `Limit extension request\n\n` +
          //`Current Limit: ${limitData.limitInfo.creditsLimit}\n` +
         // `Purchasing: ${limitData.limitInfo.attemptedPurchase}\n` +
          //`Credit Limit Need: +${limitData.limitInfo.excessAmount} credits\n\n` +
          `Please approve. Thanks!`;


        // Encode message for URL
        const encodedMessage = encodeURIComponent(whatsappMessage);

        // ✅ WhatsApp numbers
        const whatsappNumber1 = '919711413917'; // +91 8898944389

        // ✅ Function to open WhatsApp
        const openWhatsApp = () => {
          console.log('📱 Opening WhatsApp with message:', whatsappMessage);

          // Open first WhatsApp
          const whatsappUrl1 = `https://wa.me/${whatsappNumber1}?text=${encodedMessage}`;
          window.open(whatsappUrl1, '_blank');
        };

        // ✅ Show custom confirm dialog
        const userResponse = window.confirm(
          `⚠️ Your credit limit has been exceeded!\n\n` +
          `Please contact support for limit extension:\n` +
          `📞 ${limitData.contactInfo.name}\n` +
          `Mobile: ${limitData.contactInfo.mobile}\n\n` +
          `Would you like to contact support via WhatsApp?`
        );

        // ✅ Open WhatsApp if user clicks OK
        if (userResponse === true) {
          openWhatsApp();
        }
      }

      // Handle duplicate transaction
      else if (error.response?.status === 409) {
        alert('⚠️ This transaction has already been processed.');
      }
      // Handle other errors
      else {
        const errorMessage = error.response?.data?.message || error.message || 'Purchase failed. Please try again.';
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };



  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="credit-purchase-container"style={chatContainerStyle}>
        <div className="credit-content">
          <div className="loading-spinner">
            <p>Loading credit packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-purchase-container"style={chatContainerStyle}>
      {/* Mystical Background Elements */}
     
      {/* Main Content */}
      <div className="credit-content">
        {/* Title Section */}
        <div className="credit-title-section">
          <h1 className="credit-main-title">💎 Get More Cosmic Credits</h1>
          <p className="credit-subtitle">
            Unlock unlimited cosmic wisdom with our credit packages.<br />
            Each question costs 10 credits for Quick Answers and 15 credits for Detailed Answers.
          </p>

          {/* Current Balance Display */}
          <div className="current-balance-display">
            <span className="balance-label">Your Current Balance:</span>
            <span className='dimond'>💎</span>
            <span className="balance-amount"> {user?.credits || 0} Credits</span>
            {user?.credits < 10 && <span className="low-credits-warning">⚠️ Low Credits</span>}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Credit Packages Grid */}
        <div className="credit-packages-grid">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`credit-package ${pkg.badgeColor} ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
              onClick={() => handlePackageSelect(pkg)}
            >
              {/* Badge */}
              <div className={`package-badge badge-${pkg.badgeColor}`}>
                {pkg.badge}
              </div>

              <div className="package-content">
                {/* Selection Indicator */}
                {selectedPackage?.id === pkg.id && (
                  <div className="selection-indicator">
                    <span>✓</span>
                  </div>
                )}

                {/* Credits Display */}
                <div className="package-credits">{pkg.credits}</div>
                <div className="credits-label">
                  <span className='dimond'>💎</span>
                  <span>Credits</span>
                </div>

                {/* Bonus Credits */}
                {pkg.bonus > 0 && (
                  <div className="bonus-credits">
                    🎁 +{pkg.bonus} Bonus Credits
                  </div>
                )}

                {/* Price */}
                <div className="package-price">₹{pkg.price}</div>

                {/* Description */}
                <div className="package-description">{pkg.description}</div>

                {/* Value Calculation */}
                <div className="package-value">
                  Total: {pkg.totalCredits} credits •
                  ₹{(pkg.price / pkg.totalCredits).toFixed(1)} per credit
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Section */}
        <div className="purchase-section" ref={purchaseSectionRef}>
          <button
            className={`main-purchase-btn ${selectedPackage ? 'enabled' : 'disabled'}`}
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="btn-icon">⏳</span>
                <span>Processing Payment...</span>
              </>
            ) : selectedPackage ? (
              <>
                <span className="btn-icon">🛒</span>
                <span>Purchase {selectedPackage.badge} - ₹{selectedPackage.price}</span>
              </>
            ) : (
              <>
                <span className="btn-icon">📦</span>
                <span>Select a Package to Continue</span>
              </>
            )}
          </button>

          {/* Security Info */}
          <div className="security-info">
            <span>🔒</span>
            <span>Secure payment powered by Razorpay • 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditPurchase;