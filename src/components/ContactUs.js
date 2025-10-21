import React from 'react';
import { useNavigate } from 'react-router-dom';

function ContactUs() {
    const navigate = useNavigate();

    const containerStyle = {
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'transparent',
        color: '#fff',
        minHeight: '100vh',
    };

    const h1Style = {
        fontSize: '1.8rem',
        marginTop: '1rem',
        marginBottom: '1rem',
        color: '#ffd700',
        textAlign: 'center',
    };

    const pStyle = {
        color: '#fff',
        lineHeight: '1.6',
        marginBottom: '1.5rem',
        textAlign: 'center',
    };

    const contactCardStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    };

    const iconStyle = {
        fontSize: '2rem',
        minWidth: '50px',
        textAlign: 'center',
    };

    // handle clicks
    const handleFeedbackClick = () => navigate('/feedback');
    const handleWhatsAppClick = () =>
        window.open('https://wa.me/919711413917', '_blank');

    return (
        <div style={containerStyle}>
            <h1 style={h1Style}>Contact Us</h1>
            <p style={pStyle}>
                We'd love to hear from you! Reach out to us through any of the following
                channels:
            </p>

            {/* Email */}
            <a
                href="mailto:aastrogai@gmail.com"
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
                <div
                    style={{
                        ...contactCardStyle,
                    }}
                >
                    <div style={iconStyle}>📧</div>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                color: '#fff',
                                marginBottom: '0.25rem',
                                fontSize: '0.9rem',
                            }}
                        >
                            Email Us
                        </div>
                        aastrogai@gmail.com
                    </div>
                </div>
            </a>

            {/* Feedback Card */}
            <div
                role="button"
                tabIndex={0}
                style={{
                    ...contactCardStyle,
                    transition: 'all 0.2s ease',
                }}
                onClick={handleFeedbackClick}
                onKeyDown={(e) => e.key === 'Enter' && handleFeedbackClick()}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ffd700')}
                onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)')
                }
            >
                <div style={iconStyle}>💬</div>
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            color: '#fff',
                            marginBottom: '0.25rem',
                            fontSize: '0.9rem',
                        }}
                    >
                        Feedback
                    </div>
                    Share your feedback
                </div>
            </div>

            {/* WhatsApp Card */}
            <div
                role="button"
                tabIndex={0}
                style={{
                    ...contactCardStyle,
                    transition: 'all 0.2s ease',
                }}
                onClick={handleWhatsAppClick}
                onKeyDown={(e) => e.key === 'Enter' && handleWhatsAppClick()}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#25D366')}
                onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)')
                }
            >
                <div style={iconStyle}>
                    <i
                        className="fa-brands fa-whatsapp"
                        style={{ fontSize: '1.5rem', color: '#fff' }}
                    ></i>
                </div>
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            color: '#fff',
                            marginBottom: '0.25rem',
                            fontSize: '0.9rem',
                        }}
                    >
                        WhatsApp
                    </div>
                    Chat on WhatsApp
                </div>
            </div>

            {/* Social Media */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ ...pStyle, marginBottom: '1rem' }}>
                    Follow us on social media:
                </p>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        fontSize: '2rem',
                    }}
                >
                    <a
                        href="https://facebook.com/aastrog"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', transition: 'color 0.3s' }}
                        onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                        onMouseLeave={(e) => (e.target.style.color = '#fff')}
                    >
                        <i className="fa-brands fa-facebook"></i>
                    </a>
                    <a
                        href="https://instagram.com/aastrog"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', transition: 'color 0.3s' }}
                        onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                        onMouseLeave={(e) => (e.target.style.color = '#fff')}
                    >
                        <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a
                        href="https://x.com/aastrog"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', transition: 'color 0.3s' }}
                        onMouseEnter={(e) => (e.target.style.color = '#ffd700')}
                        onMouseLeave={(e) => (e.target.style.color = '#fff')}
                    >
                        <i className="fa-brands fa-x-twitter"></i>
                    </a>
                </div>
            </div>

            <hr
                style={{ borderColor: 'rgba(255, 215, 0, 0.3)', margin: '2rem 0' }}
            />

            <p
                style={{
                    fontSize: '0.9rem',
                    color: '#999',
                    textAlign: 'center',
                }}
            >
                AastroG your personal  Astro Guru
            </p>
        </div>
    );
}

export default ContactUs;
