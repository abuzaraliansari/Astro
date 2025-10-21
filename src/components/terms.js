import React from 'react';
import { useNavigate } from 'react-router-dom';

function Terms() {
  const navigate = useNavigate();

  const containerStyle = { 
    padding: '2rem', 
    maxWidth: '900px', 
    margin: '5% auto', 
    backgroundColor: 'transparent', 
    color: '#fff',
    minHeight: '100vh'
    
  };
  
  const h1Style = { 
    fontSize: '1.5rem', 
    marginTop: '1rem', 
    marginBottom: '0.5rem', 
    color: '#fff' 
    //centered text
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
    lineHeight: '1.6' 
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
    color: '#ffd700', 
    textDecoration: 'underline' 
  };

  return (
    <div style={containerStyle}>

      <h1 style={h1Style}>Terms and Conditions</h1>

      <p style={pStyle}>
        This Disclaimer applies to the website, mobile applications, and services offered by 
        <strong> AastroG</strong> ("Company," "we," "our," or "us"). By accessing or using AastroG, 
        you acknowledge and agree to the terms set forth below. If you do not agree, please 
        discontinue use of our services immediately.
      </p>

      <h2 style={h2Style}>Informational Purposes Only</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>All content, predictions, horoscopes, compatibility reports, and remedies provided through AastroG are for general informational and educational purposes only.</li>
        <li style={liStyle}>Astrology is a belief-based system and should not be considered an exact science.</li>
        <li style={liStyle}>The insights generated are intended for self-reflection and guidance, not as absolute or guaranteed outcomes.</li>
      </ul>

      <h2 style={h2Style}>No Professional Advice</h2>
      <p style={pStyle}>AastroG does not provide medical, legal, financial, or psychological advice. Nothing on our platform should be interpreted as professional consultation.</p>
      <ul style={ulStyle}>
        <li style={liStyle}>For health concerns, please consult a licensed physician.</li>
        <li style={liStyle}>For legal or financial matters, consult a qualified attorney or advisor.</li>
        <li style={liStyle}>For mental health issues, seek support from a certified professional.</li>
        <li style={liStyle}>You agree that you will not rely solely on AastroG for making decisions in these areas.</li>
      </ul>

      <h2 style={h2Style}>Accuracy of Information</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>Our reports and insights are generated based on the birth data you provide (date, time, place of birth).</li>
        <li style={liStyle}>Any errors or inaccuracies in your input may impact results.</li>
        <li style={liStyle}>While our AI models are designed to reduce human error, astrology involves interpretations and probabilities.</li>
        <li style={liStyle}>We make no warranties or guarantees, express or implied, about the accuracy, reliability, or completeness of the information provided.</li>
      </ul>

      <h2 style={h2Style}>No Liability</h2>
      <p style={pStyle}>
        To the fullest extent permitted by law, AastroG, its founders, employees, partners, and 
        affiliates shall not be held liable for any direct, indirect, incidental, consequential, 
        or special damages resulting from the use of our services, including but not limited to:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}>Loss of income or business opportunities</li>
        <li style={liStyle}>Relationship or personal matters</li>
        <li style={liStyle}>Health-related decisions or outcomes</li>
      </ul>
      <p style={pStyle}>Your use of AastroG is at your own discretion and risk.</p>

      <h2 style={h2Style}>Remedies and Spiritual Guidance</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>Any remedies suggested (including mantras, gemstones, rituals, lifestyle adjustments, or donations) are voluntary and provided as guidance only.</li>
        <li style={liStyle}>AastroG does not claim, promise, or guarantee any specific results or outcomes from following such remedies.</li>
      </ul>

      <h2 style={h2Style}>Privacy of Data</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>We respect your privacy.</li>
        <li style={liStyle}>Personal data, including birth details, are collected solely for the purpose of generating astrological reports.</li>
        <li style={liStyle}>This data will not be sold or shared with third parties without consent, except as required by law.</li>
        <li style={liStyle}>Please refer to our Privacy Policy for further details.</li>
      </ul>

      <h2 style={h2Style}>External Resources</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>Our platform may contain links to third-party websites or resources.</li>
        <li style={liStyle}>AastroG does not endorse, guarantee, or take responsibility for the content, accuracy, or reliability of such external sites.</li>
        <li style={liStyle}>Accessing them is at your own risk.</li>
      </ul>

      <h2 style={h2Style}>Updates to Disclaimer</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>We reserve the right to modify or update this Disclaimer at any time, without prior notice.</li>
        <li style={liStyle}>The updated version will be effective upon posting.</li>
        <li style={liStyle}>It is your responsibility to review this Disclaimer periodically.</li>
      </ul>

      <h2 style={h2Style}>Age Requirement</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>By using AastroG, you confirm that you are at least 18 years old.</li>
        <li style={liStyle}>Or are accessing the platform under the supervision of a parent or legal guardian.</li>
      </ul>

      <h2 style={h2Style}>Consent and Agreement</h2>
      <p style={pStyle}>By accessing or using AastroG, you:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Confirm that you have read and understood this Disclaimer.</li>
        <li style={liStyle}>Acknowledge that astrology is a guidance tool, not an absolute predictor of future events.</li>
        <li style={liStyle}>Agree to release AastroG and its affiliates from any liability associated with your use of the platform.</li>
      </ul>

      <h2 style={h2Style}>Contact Us</h2>
      <p style={pStyle}>
        For questions or concerns, please contact us at:{' '}
        <a href="mailto:aastrogai@gmail.com" style={linkStyle}>aastrogai@gmail.com</a>
      </p>

      <hr style={{ borderColor: 'rgba(255, 215, 0, 0.3)', margin: '2rem 0' }} />
      

    </div>
  );
}

export default Terms;
