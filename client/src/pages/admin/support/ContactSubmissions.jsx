import { useState, useEffect } from 'react';
import contactService from '../../../services/contactService';

const ContactSubmissions = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await contactService.getContactMessages();
      if (res.success && res.data) {
        setMessages(res.data.messages || res.data);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await contactService.markAsRead(id);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    try {
      await contactService.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selectedMsg?._id === id) setSelectedMsg(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  return (
    <div className="bg-[#F8FAFC]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wider text-slate-900">Contact Submissions</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Manage inquiries submitted through the contact form.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Subject & Message</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                    Loading messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg._id} className={`hover:bg-slate-50/60 transition-colors ${!msg.isRead ? 'bg-blue-50/40 font-semibold' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{msg.name}</div>
                      <a href={`mailto:${msg.email}`} className="text-xs font-medium text-blue-600 hover:underline">{msg.email}</a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 mb-1">{msg.subject || 'General Inquiry'}</div>
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-md font-medium">{msg.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold tracking-wider uppercase rounded-full ${
                        !msg.isRead ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {!msg.isRead ? 'NEW / UNREAD' : 'READ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedMsg(msg);
                          if (!msg.isRead) handleMarkAsRead(msg._id);
                        }} 
                        className="text-blue-600 hover:text-blue-700 font-bold"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDelete(msg._id)} 
                        className="text-red-600 hover:text-red-700 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
                {selectedMsg.subject || 'Message Details'}
              </h3>
              <button onClick={() => setSelectedMsg(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 rounded-lg">✕</button>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <p><strong className="text-slate-900">From:</strong> {selectedMsg.name} ({selectedMsg.email})</p>
              {selectedMsg.phone && <p><strong className="text-slate-900">Phone:</strong> {selectedMsg.phone}</p>}
              <p><strong className="text-slate-900">Date:</strong> {new Date(selectedMsg.createdAt).toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
              {selectedMsg.message}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <a href={`mailto:${selectedMsg.email}?subject=RE: ${encodeURIComponent(selectedMsg.subject || 'Support Request')}`} className="btn-primary text-xs px-4 py-2 font-bold">
                Reply via Email
              </a>
              <button onClick={() => setSelectedMsg(null)} className="btn-secondary text-xs px-4 py-2 font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;
