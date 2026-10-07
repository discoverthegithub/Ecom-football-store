import { useState } from 'react';
import SEO from '../components/SEO';
import contactService from '../services/contactService';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await contactService.submitContactMessage(formData);
      setStatus({ type: 'success', message: 'Matchday dispatch received! The Dugout squad will contact you shortly.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to dispatch message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <SEO title="The Dugout | Matchday Support | False Nine" />

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-blue-50/70 via-slate-50 to-[#F8FAFC] py-16 border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">PITCHSIDE HEADQUARTERS</span>
          <h1 className="text-4xl font-extrabold uppercase text-slate-900 mt-2 sm:text-5xl">
            THE DUGOUT SUPPORT
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Need help sizing a vintage kit, tracking a matchday order, or inquiring about custom squad printing? Our support team is in the dugout 24/7.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          
          {/* Support Info */}
          <div className="lg:col-span-1 space-y-6 mb-12 lg:mb-0">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">MATCHDAY SUPPORT</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">Our kit specialists respond within 2-4 hours on matchdays.</p>
              <a href="mailto:dugout@falsenine.com" className="text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center gap-2 transition-colors">
                <span>dugout@falsenine.com</span>
              </a>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">PITCHSIDE HQ</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                False Nine Football Apparel Co.<br />
                74 Stadium Way, Suite 900<br />
                London, UK & New York, NY<br />
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">SQUAD PRINTING & RETRO INQUIRIES</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                For custom nameset requests or rare vintage kit sourcing, select "Vintage Sourcing" in the subject line.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-extrabold uppercase text-slate-900 mb-6">DISPATCH A MESSAGE</h2>
              
              {status.message && (
                <div className={`mb-6 p-4 rounded-xl text-xs font-semibold border ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field text-xs font-medium"
                      placeholder="e.g. Eric Cantona"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field text-xs font-medium"
                      placeholder="eric@falsenine.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Subject / Inquiry *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field text-xs font-medium"
                  >
                    <option value="">Select an Inquiry Type</option>
                    <option value="Order Tracking">Matchday Order Tracking</option>
                    <option value="Vintage Sourcing">Vintage Kit Sourcing Request</option>
                    <option value="Sizing Advice">Kit Sizing & Printing Advice</option>
                    <option value="General Support">General Dugout Support</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="input-field text-xs font-medium"
                    placeholder="Write your matchday inquiry here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full sm:w-auto text-xs px-8 py-3.5 font-extrabold"
                >
                  {isSubmitting ? 'DISPATCHING...' : 'SEND TO THE DUGOUT'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
