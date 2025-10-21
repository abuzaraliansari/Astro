import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getUserReferralCode, generateUserReferralCode, getUserReferralProgress } from '../api';

const Refer = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [generating, setGenerating] = useState(false);

  // ✅ Referral progress state
  const [referralCount, setReferralCount] = useState(0);
  const [creditsEarned, setCreditsEarned] = useState(0);
  const [progressData, setProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Fetch referral code on component mount
  useEffect(() => {
    if (user?.userId) {
      fetchReferralCode();
      fetchReferralProgress();
    }
  }, [user?.userId]);

  const fetchReferralCode = async () => {
    try {
      setLoading(true);
      console.log('🎫 Fetching referral code for user:', user.userId);

      const response = await getUserReferralCode(user.userId);

      if (response.data.success) {
        if (response.data.referralCode) {
          setReferralCode(response.data.referralCode);
          console.log('✅ Referral code loaded:', response.data.referralCode);
        } else {
          console.log('⚠️ No referral code found, generating...');
          await generateCode();
        }
      }
    } catch (error) {
      console.error('❌ Error fetching referral code:', error);
      await generateCode();
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralProgress = async () => {
    try {
      setLoadingProgress(true);
      console.log('📊 Fetching referral progress for user:', user.userId);

      const response = await getUserReferralProgress(user.userId);

      if (response.data.success) {
        setReferralCount(response.data.referralCount || 0);
        setCreditsEarned(response.data.totalCreditsEarned || 0);
        setProgressData(response.data.progress);

        console.log('✅ Referral progress loaded:', {
          referralCount: response.data.referralCount,
          creditsEarned: response.data.totalCreditsEarned,
          completedMilestones: response.data.completedMilestones
        });
      }
    } catch (error) {
      console.error('❌ Error fetching referral progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const generateCode = async () => {
    try {
      setGenerating(true);
      console.log('🎫 Generating new referral code...');

      const response = await generateUserReferralCode(user.userId);

      if (response.data.success) {
        setReferralCode(response.data.referralCode);
        console.log('✅ Referral code generated:', response.data.referralCode);
      }
    } catch (error) {
      console.error('❌ Error generating referral code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?ref=${referralCode}`;
  };

  // ✅ WhatsApp Share Link
  const getWhatsAppLink = () => {
    const referralLink = getReferralLink();
    const message = `🌟 Hey! Join AastroG and get personalized astrological guidance! Use my referral code: ${referralCode}\n\n${referralLink}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  // ✅ NEW: Facebook Share Link
  const getFacebookLink = () => {
    const referralLink = getReferralLink();
    // Facebook doesn't support pre-filled text via URL, so we use the sharer dialog with the link
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
  };

  // ✅ NEW: Instagram - Copy to clipboard (Instagram doesn't support direct sharing links)
  const handleInstagramShare = () => {
    const referralLink = getReferralLink();
    const message = `🌟 Join AastroG for personalized astrological guidance!\n\nUse my referral code: ${referralCode}\n\n${referralLink}`;

    copyToClipboard(message, 'instagram');
    alert('📱 Message copied! Now paste it in your Instagram story, post, or bio.');
  };

  // ✅ NEW: Twitter/X Share Link
  const getTwitterLink = () => {
    const referralLink = getReferralLink();
    const message = `🌟 Join AastroG for personalized astrological guidance! Use my referral code: ${referralCode}`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
  };

  const copyToClipboard = async (text, type) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      console.log('✅ Copied to clipboard:', type);

      setTimeout(() => {
        setCopySuccess('');
      }, 3000);
    } catch (error) {
      console.error('❌ Failed to copy:', error);
      alert('Failed to copy. Please copy manually.');
    } finally {
      setCopying(false);
    }
  };
const chatContainerStyle = {
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(/uploads/chat.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

  return (
    <div className="refer-page"style={chatContainerStyle}>
      <div className="refer-container">
        {/* Header Section */}
        <div className="refer-header">
          <div className="refer-icon">🎁</div>
          <h1>Refer & Earn</h1>
          <p className="refer-subtitle">
            Invite your friends and earn rewards together!
          </p>
        </div>

        {/* Referral Code Display */}
        <div className="referral-code-section">
          <label className="code-label">Your Referral Code</label>
          <div className="code-display-box">
            {generating ? (
              <div className="generating-indicator">
                <div className="spinner-small"></div>
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <span className="referral-code">{referralCode}</span>
                <button
                  className={`copy-btn ${copySuccess === 'code' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(referralCode, 'code')}
                  disabled={copying}
                >
                  {copySuccess === 'code' ? '✓ Copied!' : '📋 Copy'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Referral Link Display */}
        <div className="referral-link-section">
          <label className="link-label">Your Referral Link</label>
          <div className="link-display-box">
            <input
              type="text"
              className="link-input"
              value={getReferralLink()}
              readOnly
            />
            <button
              className={`copy-btn ${copySuccess === 'link' ? 'copied' : ''}`}
              onClick={() => copyToClipboard(getReferralLink(), 'link')}
              disabled={copying}
            >
              {copySuccess === 'link' ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>

        {/* ✅ UPDATED: Share Buttons with Instagram and Facebook */}
        <div className="share-section">
          <h3>Share via</h3>
          <div className="share-buttons">
            {/* WhatsApp */}
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn whatsapp"
            >
              <span className="btn-icon"><a href="https://wa.me/919999999999" class="fa-brands fa-whatsapp"></a></span>
              <span className="btn-text">WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
              href={getFacebookLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn facebook"
            >
              <span className="btn-icon"><a href="https://facebook.com" class="fa-brands fa-facebook"></a>
              </span>
              <span className="btn-text">Facebook</span>
            </a>

            {/* Instagram */}
            <button
              className={`share-btn instagram ${copySuccess === 'instagram' ? 'copied' : ''}`}
              onClick={handleInstagramShare}
            >
              <span className="btn-icon"><a href="https://instagram.com" class="fa-brands fa-instagram"></a>
              </span>
              <span className="btn-text">
                {copySuccess === 'instagram' ? '✓ Copied!' : 'Instagram'}
              </span>
            </button>

            {/* Twitter/X */}
            <a
              href={getTwitterLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn twitter"
             
            >
              <span className="btn-icon" ><a href="https://x.com" class="fa-brands fa-x-twitter"></a>
              </span>
              <span className="btn-text" >Twitter</span>
            </a>

            {/* Copy Link 
            <button
              className="share-btn custom"
              onClick={() => copyToClipboard(getReferralLink(), 'link')}
            >
              <span className="btn-icon">🔗</span>
              <span className="btn-text">Copy Link</span>
            </button>
            */}
          </div>
        </div>


        {/* How it Works */}
        <div className="how-it-works">
          <h3>🚀 How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>📤 Share Your Code</h4>
                <p>Invite your friends by sending your referral link or code.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>📝 Friend Signs Up</h4>
                <p>They register using your referral code - easy and quick!</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>🎉 Earn Rewards</h4>
                <p>Every successful referral brings you closer to bonus credits:</p>
                <ul>
                  <li>👫 <strong>3 referrals</strong> → <strong>50 bonus credits</strong></li>
                  <li>👨‍👩‍👧‍👦 <strong>5 referrals</strong> → <strong>100 bonus credits</strong></li>
                  <li><strong>And many more Reword</strong></li>
                </ul>
                <p>Credits are auto-applied once your referrals complete their first payment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="referral-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              {loadingProgress ? (
                <div className="stat-loading">
                  <div className="spinner-small"></div>
                </div>
              ) : (
                <>
                  <h4>{referralCount}</h4>
                  <p>Friends Referred</p>
                  {progressData?.nextMilestone && (
                    <small className="next-milestone">
                      {progressData.nextMilestone.remaining} more to earn {progressData.nextMilestone.credits} credits!
                    </small>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              {loadingProgress ? (
                <div className="stat-loading">
                  <div className="spinner-small"></div>
                </div>
              ) : (
                <>
                  <h4>{creditsEarned}</h4>
                  <p>Credits Earned</p>
                  {creditsEarned > 0 && (
                    <small className="credits-info">
                      From {progressData?.completedMilestones?.length || 0} milestones
                    </small>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {progressData?.nextMilestone && (
          <div className="progress-section">
            <div className="progress-header">
              <span>Progress to Next Milestone</span>
              <span className="progress-count">
                {referralCount} / {progressData.nextMilestone.count}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(referralCount / progressData.nextMilestone.count) * 100}%`
                }}
              ></div>
            </div>
            <p className="progress-text">
              {progressData.nextMilestone.remaining} more referrals to unlock <strong>{progressData.nextMilestone.credits} credits</strong>!
            </p>
          </div>
        )}

        {/* Refresh Button 
        <div className="refresh-section">
          <button 
            className="refresh-btn"
            onClick={fetchReferralProgress}
            disabled={loadingProgress}
          >
            {loadingProgress ? '🔄 Refreshing...' : '🔄 Refresh Stats'}
          </button>
        </div>*/}
      </div>
    </div>
  );
};

export default Refer;
