import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setActionError(null);
      // Fetch up to 100 users so all users in DB are displayed
      const response = await adminService.getUsers({ limit: 100 });
      if (response.success && response.data) {
        const userList = response.data.users || response.data;
        setUsers(userList);
        setTotalCount(response.data.pagination?.total || userList.length);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setActionError('Failed to load user list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}" (${user.email})? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionError(null);
      await adminService.deleteUser(user._id);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to delete user:', error);
      setActionError(error.response?.data?.message || 'Failed to delete user account.');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    try {
      setActionError(null);
      await adminService.updateUserStatus(user._id, { isActive: newStatus });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: newStatus } : u));
    } catch (error) {
      console.error('Failed to update status:', error);
      setActionError(error.response?.data?.message || 'Failed to update user status.');
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-[#F8FAFC]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wider text-slate-900">
            Users Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Total Database Users: <strong className="text-blue-600 font-extrabold">{users.length}</strong> (showing all registered accounts)
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold shadow-sm">
          🚨 {actionError}
        </div>
      )}

      {/* Filter / Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Filter users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-md text-xs font-medium"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Joined Date</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                    Loading registered users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-sm uppercase">
                          {user.firstName ? user.firstName[0] : 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                          <div className="text-xs font-medium text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
                        user.role === 'admin' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full cursor-pointer transition-colors ${
                          user.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-red-100 hover:text-red-700' : 'bg-red-100 text-red-700 border border-red-200 hover:bg-emerald-100 hover:text-emerald-700'
                        }`}
                        title="Click to toggle Active/Inactive"
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-colors"
                      >
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
