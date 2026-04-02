import "./Contact.css";
import { FaInstagram, FaTwitter, FaGithub, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import React, { useState } from "react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Recipient details (user provided)
  const waPhoneIntl = "2349032792049"; // +2349032792049
  const igHandle = "muheezjago";

  const openWhatsApp = (payload) => {
    const text = encodeURIComponent(payload);
    const url = `https://wa.me/${waPhoneIntl}?text=${text}`;
    window.open(url, "_blank");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = `Hi Muheez (IG: ${igHandle})!\n\nName: ${name || 'Anonymous'}\nEmail: ${email || 'no-reply'}\nMessage: ${message || 'No message'}`;
    openWhatsApp(payload);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="contact">
      {/* HERO */}
      <section className="contact-hero">
        <h1>Get In Touch 📩</h1>
        <p>
          We’d love to hear from you. Whether it’s feedback, collaboration,
          or support — reach out anytime. Messages go directly to Muheez via WhatsApp.
        </p>
      </section>

      {/* CONTENT */}
      <section className="contact-content">
        {/* FORM */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Muheez a Message</h2>

          <input 
            type="text" 
            placeholder="Your Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            aria-label="Your Name"
          />
          <input 
            type="email" 
            placeholder="Your Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            aria-label="Your Email"
          />
          <textarea 
            placeholder="Your Message" 
            rows="5" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            required 
            aria-label="Your Message"
          />

          <button type="submit" className="btn-submit">Send via WhatsApp 📲</button>
        </form>

        {/* INFO */}
        <div className="contact-info">
          <h2>Connect With Muheez</h2>
          <p>
            Reach Muheez directly on WhatsApp or follow on Instagram for updates and recipes.
          </p>

          <div className="social-links">
            <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noreferrer" className="social instagram" aria-label="Instagram">
              <FaInstagram />
              <span>Instagram (@{igHandle})</span>
            </a>

            <a href="#" className="social twitter" aria-label="Twitter">
              <FaTwitter />
              <span>Twitter</span>
            </a>

            <a href="#" className="social github" aria-label="GitHub">
              <FaGithub />
              <span>GitHub</span>
            </a>

            <a href="mailto:berrytech12@gmail.com" className="social email" aria-label="Email">
              <FaEnvelope />
              <span>Email</span>
            </a>

            <a href={`https://wa.me/${waPhoneIntl}`} target="_blank" rel="noreferrer" className="social whatsapp" aria-label="WhatsApp">
              <FaWhatsapp />
              <span>WhatsApp (+234 903 279 2049)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
