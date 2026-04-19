import React from "react";
import { useNavigate } from "react-router-dom";
import { footer } from "../../data/Data";
import "./footer.css";

const Footer = () => {
  const navigate = useNavigate(); // Initialize navigate for redirection

  const handleContactClick = () => {
    navigate('/contact'); // Redirect to /contact on button click
  };

  return (
    <>
      <section className='footerContact'>
        <div className='container'>
          <div className='send flex'>
            <div className='text'>
              <h1>Do You Have Questions?</h1>
              <p>We'll help you to grow your career and growth.</p>
            </div>
            <button className='btn5' onClick={handleContactClick}>Contact Us Today</button>
          </div>
        </div>
      </section>

      <footer>
        <div className='container footer-grid'>
          <div className='box'>
            <div className='logo'>
              <img src='../images/logo-light.png' alt='' />
              <h2>Do You Need Help With Anything?</h2>
              <p>Receive updates, hot deals, tutorials, discounts sent straight to your inbox every month.</p>

              <div className='input flex'>
                <input type='text' placeholder='Email Address' />
                <button>Subscribe</button>
              </div>
            </div>
          </div>

          {footer.map((val, index) => (
            <div className='box' key={index}>
              <h3>{val.title}</h3>
              <ul>
                {val.text.map((items, idx) => (
                  <li key={idx}>{items.list}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
      <div className='legal'>
        <span>© 2021 RentUP. Designed By GorkCoder.</span>
      </div>
    </>
  );
};

export default Footer;
