import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUser, deleteUser } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CosmicButton, GlassCard, LoadingSpinner } from './CosmicUI';
import toast from 'react-hot-toast';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, isInitializing, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser._id, editingUser);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8 text-white relative overflow-auto">
      <div className="max-w-6xl mx-auto z-10 relative mt-[2rem]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-glow">Admin Dashboard</h1>
          <CosmicButton onClick={() => { logout(); navigate('/login'); }} variant="glass">Exit Admin</CosmicButton>
        </div>

        {editingUser ? (
          <GlassCard className="p-6 mb-8 bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <h2 className="text-xl font-bold mb-4 font-display">Edit User</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-cosmic bg-black/60 border border-violet-500/30 text-white focus:border-fuchsia-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-cosmic bg-black/60 border border-violet-500/30 text-white focus:border-fuchsia-500 focus:outline-none"
                >
                  <option value="user" className="bg-black">User</option>
                  <option value="admin" className="bg-black">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <CosmicButton type="submit" variant="primary">Save Changes</CosmicButton>
                <CosmicButton type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancel</CosmicButton>
              </div>
            </form>
          </GlassCard>
        ) : null}

        <GlassCard className="p-6 overflow-x-auto bg-black/40 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-3 px-4 font-display text-white/80">ID</th>
                <th className="py-3 px-4 font-display text-white/80">Email</th>
                <th className="py-3 px-4 font-display text-white/80">Name</th>
                <th className="py-3 px-4 font-display text-white/80">Role</th>
                <th className="py-3 px-4 font-display text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white/60 text-sm">{u._id}</td>
                  <td className="py-3 px-4 text-white">{u.email}</td>
                  <td className="py-3 px-4 text-white/80">{u.name || 'No Name'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-violet-600/30 text-violet-400' : 'bg-fuchsia-600/30 text-fuchsia-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => setEditingUser(u)} className="text-violet-400 hover:text-fuchsia-400 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(u._id)} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center py-8 text-white/50">No users found.</p>}
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
