import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function CreditPurchase() {
  const navigate = useNavigate();
  const { user, addCredits, refreshCredits } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null); // ✅ NEW: Selected package state

  const creditPackages = [
    {
      id: 1,
      credits: 50,
      price: 99,
      badge: "STARTER",
      badgeColor: "starter",
      bonus: 0,
      description: "Perfect for casual users"
    },
    {
      id: 2,
      credits: 120,
      price: 199,
      badge: "MOST POPULAR",
      badgeColor: "popular",
      bonus: 20,
      description: "Most popular choice"
    },
    {
      id: 3,
      credits: 250,
      price: 399,
      badge: "BEST VALUE",
      badgeColor: "value",
      bonus: 50,
      description: "Best value for money"
    },
    {
      id: 4,
      credits: 500,
      price: 699,
      badge: "PREMIUM",
      badgeColor: "premium",
      bonus: 100,
      description: "For astrology enthusiasts"
    }
  ];

  // ✅ NEW: Handle package selection
  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData);
    console.log('📦 Package selected:', packageData);
  };

  // ✅ UPDATED: Purchase handler for selected package only
  const handlePurchase = async () => {
    if (!selectedPackage || isProcessing) {
      if (!selectedPackage) {
        alert('⚠️ Please select a credit package first!');
      }
      return;
    }
    
    setIsProcessing(true);
    console.log('💳 Processing purchase:', selectedPackage);

    try {
      const totalCredits = selectedPackage.credits + selectedPackage.bonus;
      const packageInfo = {
        packageId: selectedPackage.id,
        baseCredits: selectedPackage.credits,
        bonusCredits: selectedPackage.bonus,
        price: selectedPackage.price,
        description: selectedPackage.description,
        badge: selectedPackage.badge
      };

      // ✅ Add credits through database API
      const result = await addCredits(
        totalCredits, 
        `Credits purchased - ${selectedPackage.description}`, 
        packageInfo
      );

      if (result && result.success) {
        // ✅ Refresh credits to ensure sync
        await refreshCredits();

        const successMessage = `🎉 Successfully purchased ${totalCredits} credits!\n\n` +
          `Package: ${selectedPackage.badge} (${selectedPackage.description})\n` +
          `Previous Balance: ${result.previousCredits} credits\n` +
          `Credits Added: +${result.addedAmount} credits\n` +
          `New Balance: ${result.currentCredits} credits`;

        alert(successMessage);
        console.log('✅ Purchase successful:', result);
        
        // ✅ Reset selection after successful purchase
        setSelectedPackage(null);
        navigate('/chat');
      } else {
        throw new Error(result?.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      alert(`❌ Purchase failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const goBack = () => {
    navigate('/chat');
  };

  return (
    <div className="credit-purchase-container">
      {/* Mystical Background Elements */}
      <div className="bg-element bg-diamond">💎</div>
      <div className="bg-element bg-star">⭐</div>
      <div className="bg-element bg-crystal">🔮</div>


      {/* Main Content */}
      <div className="credit-content">
        {/* Title Section */}
        <div className="credit-title-section">
          <h1 className="credit-main-title">💎 Get More Cosmic Credits</h1>
          <p className="credit-subtitle">
            Unlock unlimited cosmic wisdom with our credit packages.<br/>
            Each question costs 5 credits • First question: 10 credits
          </p>
          {/* ✅ Enhanced current balance display */}
          <div className="current-balance-display">
            <span className="balance-label">Your Current Balance:</span>
            <span className="balance-amount">💎 {user?.credits || 0} Credits</span>
            {user?.credits < 10 && <span className="low-credits-warning">⚠️ Low Credits</span>}
          </div>
        </div>

        {/* ✅ NEW: Selected Package Display */}
        {selectedPackage && (
          <div className="selected-package-display">
            <h3 className="selected-title">
              <span>🎯</span>
              <span>Selected Package</span>
            </h3>
            <div className="selected-info">
              <span className="selected-badge">{selectedPackage.badge}</span>
              <span className="selected-credits">{selectedPackage.credits + selectedPackage.bonus} Total Credits</span>
              <span className="selected-price">₹{selectedPackage.price}</span>
            </div>
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
              {/* Enhanced Badge */}
              <div className={`package-badge badge-${pkg.badgeColor}`}>
                {pkg.badge}
              </div>

              <div className="package-content">
                {/* Selection Indicator */}
                {selectedPackage?.id === pkg.id && (
                  <div className="selection-indicator">
                    <span>✓</span>
                    <span>SELECTED</span>
                  </div>
                )}

                {/* Credits Display */}
                <div className="package-credits">{pkg.credits}</div>
                <div className="credits-label">
                  <span>💎</span>
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
                  Total: {pkg.credits + pkg.bonus} credits • 
                  ₹{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(1)} per credit
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ NEW: Single Purchase Button */}
        <div className="purchase-section">
          <button
            className={`main-purchase-btn ${selectedPackage ? 'enabled' : 'disabled'}`}
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="btn-icon">⏳</span>
                <span>Processing...</span>
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
          
          {/* ✅ Payment Security Info */}
          <div className="security-info">
            <span>🔒</span>
            <span>Secure payment powered by Stripe • Your data is protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditPurchase;
