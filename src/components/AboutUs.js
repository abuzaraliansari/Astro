import React from 'react';
import { useNavigate } from 'react-router-dom';

function AboutUs() {
    const navigate = useNavigate();

    const containerStyle = {
        padding: '4rem',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'transparent',
        color: '#fff',
        minHeight: '100vh',
        textAlign: 'left',

    };

    const h1Style = {
        fontSize: '1.5rem',
        marginTop: '1rem',
        marginBottom: '0.5rem',
        color: '#fff'
        , textAlign: 'center'
    };

    const h2Style = {
        fontSize: '1.1rem',
        marginTop: '1.5rem',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#fff'
    };

    const ulStyle = {
        paddingLeft: '2.5rem',
        lineHeight: '1.8',
        marginBottom: '1rem'
    };

    const liStyle = {
        marginBottom: '0.5rem',
        color: '#fff'
    };

    const pStyle = {
        color: '#fff',
        lineHeight: '1.6',
        marginBottom: '1rem'
    };

    const buttonStyle = {
        marginBottom: '1rem',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600'
    };

    const linkStyle = {
        color: '#fff',
        textDecoration: 'none'
    };
    const chatContainerStyle = {
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(/uploads/chat.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '4rem',
        
        margin: '0 auto',
        backgroundColor: 'transparent',
        color: '#fff',
        minHeight: '100vh',
        textAlign: 'left',
    };


    return (
        <div style={containerStyle}>

            <h1 style={h1Style}>About Us</h1>

            <p style={pStyle}>
                At <strong>AastroG</strong>, we're building the future of astrology by combining the timeless
                wisdom of Vedic Jyotish with the precision of Artificial Intelligence. Our goal is to make
                astrology highly personalized, interactive, and accessible for everyone.
            </p>

            <h2 style={h2Style}>What Makes Us Different</h2>
            <p style={pStyle}>Unlike traditional astrology platforms, AastroG offers:</p>
            <ul style={ulStyle}>
                <li style={liStyle}>
                    <strong>Highly Personalized Chat</strong> → Get instant guidance through our AI + Vedic
                    astrology-powered chat system.
                </li>
                <li style={liStyle}>
                    <strong>1-on-1 Consultations</strong> → Connect directly with expert astrologers for deeper,
                    human-led insights.
                </li>
                <li style={liStyle}>
                    <strong>More Features Coming Soon</strong> → We're actively working on advanced reports,
                    remedies, and interactive tools to make your experience even better.
                </li>
            </ul>

            <h2 style={h2Style}>We're in Beta – and Growing with You</h2>
            <p style={pStyle}>
                AastroG is currently in its <strong>Beta stage</strong>. This means you're among the first to
                experience our vision of AI-powered astrology. While we're refining the platform, we truly
                value your support in shaping it.
            </p>
            <p style={pStyle}>
                If you find a bug, face a glitch, or have an idea for improvement, please share it with us.
                Every suggestion helps us grow and make AastroG better for you and the community.
            </p>

            <h2 style={h2Style}>Our Mission</h2>
            <p style={pStyle}>
                To merge ancient wisdom with modern intelligence so you can:
            </p>
            <ul style={ulStyle}>
                <li style={liStyle}>Gain clarity in personal and professional decisions</li>
                <li style={liStyle}>Explore self-awareness through your birth chart</li>
                <li style={liStyle}>Receive personalized remedies and insights instantly</li>
                <li style={liStyle}>Connect with experts when you need a deeper consultation</li>
            </ul>

            <h2 style={h2Style}>Let's Build Together</h2>
            <p style={pStyle}>
                We're not just building a platform — we're building a <strong>community</strong>.
            </p>
            <p style={pStyle}>
                At AastroG, your feedback is as valuable as the stars themselves. Together, we'll create
                the most personal, powerful, and intelligent astrology platform in the world.
            </p>

            <hr style={{ borderColor: 'rgba(255, 215, 0, 0.3)', margin: '2rem 0' }} />

            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '2rem' }}>
                Join us on this journey •
                <span
          style={linkStyle}
          onClick={() => navigate('/contactus')}
          onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
        >
          Contact Us
        </span>
            </p>
        </div>
    );
}

export default AboutUs;
