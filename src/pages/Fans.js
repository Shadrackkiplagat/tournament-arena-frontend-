import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Heart, Users } from 'lucide-react';

const fansAPI = {
  getAll: async (teamId = '', page = 1) => {
    const token = localStorage.getItem('adminToken');
    let url = `http://localhost:5001/api/admin/fans?page=${page}&limit=10`;
    if (teamId) url += `&team=${teamId}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  create: async (fanData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5001/api/admin/fans', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fanData),
    });
    return response.json();
  },
  update: async (id, fanData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5001/api/admin/fans/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fanData),
    });
    return response.json();
  },
  delete: async (id) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5001/api/admin/fans/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

const teamsAPI = {
  getAll: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5001/api/admin/teams?page=1&limit=100', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

export default function FansManagement() {
  const [fans, setFans] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFan, setEditingFan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTeam, setFilterTeam] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    team: '',
    joinDate: new Date().toISOString().split('T')[0],
    membershipLevel: 'regular',
    interests: [],
    bio: '',
  });

  const membershipLevels = ['regular', 'premium', 'vip'];
  const interestOptions = ['News', 'Match Updates', 'Statistics', 'Events', 'Merchandise', 'Community'];

  // ✅ Wrap fetchFans in useCallback
  const fetchFans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fansAPI.getAll(filterTeam, currentPage);
      setFans(data.fans || []);
      setTotalPages(Math.ceil((data.total || 0) / 10));
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching fans: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterTeam]); // ✅ Add dependencies

  const fetchTeams = useCallback(async () => {
    try {
      const data = await teamsAPI.getAll();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  // ✅ Add fetchFans and fetchTeams to dependency array
  useEffect(() => {
    fetchFans();
    fetchTeams();
  }, [fetchFans, fetchTeams]);

  const handleCreateFan = async () => {
    try {
      await fansAPI.create(formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        team: '',
        joinDate: new Date().toISOString().split('T')[0],
        membershipLevel: 'regular',
        interests: [],
        bio: '',
      });
      setShowForm(false);
      fetchFans();
      alert('Fan added successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateFan = async () => {
    try {
      await fansAPI.update(editingFan._id, formData);
      setEditingFan(null);
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        team: '',
        joinDate: new Date().toISOString().split('T')[0],
        membershipLevel: 'regular',
        interests: [],
        bio: '',
      });
      fetchFans();
      alert('Fan updated successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteFan = async (id) => {
    if (window.confirm('Are you sure you want to delete this fan?')) {
      try {
        await fansAPI.delete(id);
        fetchFans();
        alert('Fan deleted successfully!');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleEditFan = (fan) => {
    setEditingFan(fan);
    setFormData({
      name: fan.name,
      email: fan.email || '',
      phone: fan.phone || '',
      team: fan.team?._id || '',
      joinDate: fan.joinDate ? fan.joinDate.split('T')[0] : new Date().toISOString().split('T')[0],
      membershipLevel: fan.membershipLevel || 'regular',
      interests: fan.interests || [],
      bio: fan.bio || '',
    });
    setShowForm(true);
  };

  const toggleInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter((i) => i !== interest)
        : [...formData.interests, interest],
    });
  };

  const getMembershipColor = (level) => {
    const colors = {
      regular: 'bg-gray-100 text-gray-800',
      premium: 'bg-purple-100 text-purple-800',
      vip: 'bg-yellow-100 text-yellow-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Fans Management
        </h1>
        <button
          onClick={() => {
            setEditingFan(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              team: '',
              joinDate: new Date().toISOString().split('T')[0],
              membershipLevel: 'regular',
              interests: [],
              bio: '',
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50"
        >
          <Plus className="w-5 h-5" />
          Add Fan
        </button>
      </div>

      {/* Filter */}
      <div className="mb-8">
        <select
          value={filterTeam}
          onChange={(e) => {
            setFilterTeam(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Fans</p>
              <p className="text-3xl font-bold mt-2">{fans.length}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Premium Members</p>
              <p className="text-3xl font-bold mt-2">{fans.filter((f) => f.membershipLevel === 'premium').length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">VIP Members</p>
              <p className="text-3xl font-bold mt-2">{fans.filter((f) => f.membershipLevel === 'vip').length}</p>
            </div>
            <Heart className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading fans...</div>
        ) : fans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No fans found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Team</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Membership</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Join Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Interests</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fans.map((fan) => (
                    <tr key={fan._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{fan.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{fan.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{fan.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{fan.team?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMembershipColor(fan.membershipLevel)}`}>
                          {fan.membershipLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {fan.joinDate ? new Date(fan.joinDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {fan.interests?.slice(0, 2).map((interest) => (
                            <span key={interest} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                              {interest}
                            </span>
                          ))}
                          {fan.interests && fan.interests.length > 2 && (
                            <span className="text-gray-500 text-xs">+{fan.interests.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditFan(fan)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit Fan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFan(fan._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Fan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Fan Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingFan ? 'Edit Fan' : 'Add New Fan'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingFan(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    team: '',
                    joinDate: new Date().toISOString().split('T')[0],
                    membershipLevel: 'regular',
                    interests: [],
                    bio: '',
                  });
                }}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Fan name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="fan@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254712345678"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Team & Membership */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Team & Membership</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Team</label>
                      <select
                        value={formData.team}
                        onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Team</option>
                        {teams.map((team) => (
                          <option key={team._id} value={team._id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Membership Level</label>
                      <select
                        value={formData.membershipLevel}
                        onChange={(e) => setFormData({ ...formData, membershipLevel: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        {membershipLevels.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Join Date</label>
                    <input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Interests</h3>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Biography</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Fan biography or additional notes"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={editingFan ? handleUpdateFan : handleCreateFan}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50"
                >
                  {editingFan ? 'Update Fan' : 'Add Fan'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingFan(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      team: '',
                      joinDate: new Date().toISOString().split('T')[0],
                      membershipLevel: 'regular',
                      interests: [],
                      bio: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}