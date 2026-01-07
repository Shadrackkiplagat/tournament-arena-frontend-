import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';

// Simple fetch wrapper (replace with your API service)
const teamsAPI = {
  getAll: async (page = 1) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5001/api/admin/teams?page=${page}&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  create: async (formData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5001/api/admin/teams', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
  update: async (id, formData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5001/api/admin/teams/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
  delete: async (id) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5001/api/admin/teams/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

export default function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    coach: '',
    logo: null,
  });

  // ✅ Wrap fetchTeams in useCallback to fix ESLint warning
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamsAPI.getAll(currentPage);
      setTeams(data.teams);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching teams: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage]); // ✅ Add currentPage as dependency

  // ✅ Add fetchTeams to dependency array
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('city', formData.city);
      formDataObj.append('coach', formData.coach);
      if (formData.logo) formDataObj.append('logo', formData.logo);

      await teamsAPI.create(formDataObj);

      setFormData({ name: '', description: '', city: '', coach: '', logo: null });
      setShowForm(false);
      fetchTeams();
      alert('Team created successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateTeam = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('city', formData.city);
      formDataObj.append('coach', formData.coach);
      if (formData.logo) formDataObj.append('logo', formData.logo);

      await teamsAPI.update(editingTeam._id, formDataObj);

      setEditingTeam(null);
      setShowForm(false);
      setFormData({ name: '', description: '', city: '', coach: '', logo: null });
      fetchTeams();
      alert('Team updated successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamsAPI.delete(id);
        fetchTeams();
        alert('Team deleted successfully!');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      city: team.city || '',
      coach: team.coach || '',
      logo: null,
    });
    setShowForm(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Teams Management
        </h1>
        <button
          onClick={() => {
            setEditingTeam(null);
            setFormData({ name: '', description: '', city: '', coach: '', logo: null });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50"
        >
          <Plus className="w-5 h-5" />
          Add Team
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No teams found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Logo</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Team Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">City</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Coach</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Stats</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Points</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Players</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teams.map((team) => (
                    <tr key={team._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        {team.logo ? (
                          <img
                            src={`http://localhost:5001${team.logo}`}
                            alt={team.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{team.name}</td>
                      <td className="px-6 py-4 text-gray-600">{team.city || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{team.coach || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {team.wins}W - {team.draws}D - {team.losses}L
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-orange-600">{team.points}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {team.players?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTeam(team)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit Team"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Team"
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

      {/* Create/Edit Team Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTeam(null);
                  setFormData({ name: '', description: '', city: '', coach: '', logo: null });
                }}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Team Alpha"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Nairobi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Coach</label>
                <input
                  type="text"
                  value={formData.coach}
                  onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Team description"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Team Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, logo: e.target.files[0] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                {formData.logo && <p className="text-sm text-green-600 mt-2">✓ File selected: {formData.logo.name}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={editingTeam ? handleUpdateTeam : handleCreateTeam}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all"
                >
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTeam(null);
                    setFormData({ name: '', description: '', city: '', coach: '', logo: null });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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