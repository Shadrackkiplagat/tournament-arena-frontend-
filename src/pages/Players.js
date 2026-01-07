import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, User } from 'lucide-react';

const playersAPI = {
  getAll: async (filters = {}, page = 1) => {
    const token = localStorage.getItem('adminToken');
    const params = new URLSearchParams({ page, limit: 10, ...filters });
    const response = await fetch(`http://localhost:5001/api/admin/players?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
  create: async (formData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5001/api/admin/players', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
  update: async (id, formData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5001/api/admin/players/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
  delete: async (id) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5001/api/admin/players/${id}`, {
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

export default function PlayersManagement() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    position: 'FWD',
    jerseyNumber: '',
    age: '',
    nationality: '',
    height: '',
    weight: '',
    bio: '',
    team: '',
    photo: null,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchesPlayed: 0,
  });

  const positions = ['GK', 'DEF', 'MID', 'FWD'];

  // ✅ Wrap fetchPlayers in useCallback
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterTeam) filters.team = filterTeam;
      if (filterPosition) filters.position = filterPosition;
      const data = await playersAPI.getAll(filters, currentPage);
      setPlayers(data.players);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching players: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterTeam, filterPosition]); // ✅ Add dependencies

  const fetchTeams = useCallback(async () => {
    try {
      const data = await teamsAPI.getAll();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  // ✅ Add fetchPlayers and fetchTeams to dependency array
  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [fetchPlayers, fetchTeams]);

  const handleCreatePlayer = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('position', formData.position);
      formDataObj.append('jerseyNumber', formData.jerseyNumber);
      formDataObj.append('age', formData.age);
      formDataObj.append('nationality', formData.nationality);
      formDataObj.append('height', formData.height);
      formDataObj.append('weight', formData.weight);
      formDataObj.append('bio', formData.bio);
      formDataObj.append('team', formData.team);
      formDataObj.append('goals', formData.goals);
      formDataObj.append('assists', formData.assists);
      formDataObj.append('yellowCards', formData.yellowCards);
      formDataObj.append('redCards', formData.redCards);
      formDataObj.append('matchesPlayed', formData.matchesPlayed);
      if (formData.photo) formDataObj.append('photo', formData.photo);

      await playersAPI.create(formDataObj);
      setFormData({
        name: '',
        position: 'FWD',
        jerseyNumber: '',
        age: '',
        nationality: '',
        height: '',
        weight: '',
        bio: '',
        team: '',
        photo: null,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        matchesPlayed: 0,
      });
      setShowForm(false);
      fetchPlayers();
      alert('Player created successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdatePlayer = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('position', formData.position);
      formDataObj.append('jerseyNumber', formData.jerseyNumber);
      formDataObj.append('age', formData.age);
      formDataObj.append('nationality', formData.nationality);
      formDataObj.append('height', formData.height);
      formDataObj.append('weight', formData.weight);
      formDataObj.append('bio', formData.bio);
      formDataObj.append('team', formData.team);
      formDataObj.append('goals', formData.goals);
      formDataObj.append('assists', formData.assists);
      formDataObj.append('yellowCards', formData.yellowCards);
      formDataObj.append('redCards', formData.redCards);
      formDataObj.append('matchesPlayed', formData.matchesPlayed);
      if (formData.photo) formDataObj.append('photo', formData.photo);

      await playersAPI.update(editingPlayer._id, formDataObj);
      setEditingPlayer(null);
      setShowForm(false);
      setFormData({
        name: '',
        position: 'FWD',
        jerseyNumber: '',
        age: '',
        nationality: '',
        height: '',
        weight: '',
        bio: '',
        team: '',
        photo: null,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        matchesPlayed: 0,
      });
      fetchPlayers();
      alert('Player updated successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeletePlayer = async (id) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playersAPI.delete(id);
        fetchPlayers();
        alert('Player deleted successfully!');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      jerseyNumber: player.jerseyNumber || '',
      age: player.age || '',
      nationality: player.nationality || '',
      height: player.height || '',
      weight: player.weight || '',
      bio: player.bio || '',
      team: player.team?._id || '',
      photo: null,
      goals: player.goals || 0,
      assists: player.assists || 0,
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
      matchesPlayed: player.matchesPlayed || 0,
    });
    setShowForm(true);
  };

  const getPositionColor = (position) => {
    const colors = {
      GK: 'bg-purple-100 text-purple-800',
      DEF: 'bg-blue-100 text-blue-800',
      MID: 'bg-green-100 text-green-800',
      FWD: 'bg-red-100 text-red-800',
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Players Management
        </h1>
        <button
          onClick={() => {
            setEditingPlayer(null);
            setFormData({
              name: '',
              position: 'FWD',
              jerseyNumber: '',
              age: '',
              nationality: '',
              height: '',
              weight: '',
              bio: '',
              team: '',
              photo: null,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
              matchesPlayed: 0,
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50"
        >
          <Plus className="w-5 h-5" />
          Add Player
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
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

        <select
          value={filterPosition}
          onChange={(e) => {
            setFilterPosition(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading players...</div>
        ) : players.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No players found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Photo</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Team</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Position</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Jersey</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Age</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Goals</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Assists</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Matches</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {players.map((player) => (
                    <tr key={player._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        {player.photo ? (
                          <img
                            src={`http://localhost:5001${player.photo}`}
                            alt={player.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{player.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{player.team?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPositionColor(player.position)}`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{player.jerseyNumber || '-'}</td>
                      <td className="px-6 py-4 text-center">{player.age || '-'}</td>
                      <td className="px-6 py-4 text-center font-bold text-orange-600">{player.goals || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-green-600">{player.assists || 0}</td>
                      <td className="px-6 py-4 text-center">{player.matchesPlayed || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPlayer(player)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit Player"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Player"
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

      {/* Modal code continues but is too long - keeping existing modal code */}
     
      {/* Create/Edit Player Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingPlayer(null);
                  setFormData({
                    name: '',
                    position: 'FWD',
                    jerseyNumber: '',
                    age: '',
                    nationality: '',
                    height: '',
                    weight: '',
                    bio: '',
                    team: '',
                    photo: null,
                    goals: 0,
                    assists: 0,
                    yellowCards: 0,
                    redCards: 0,
                    matchesPlayed: 0,
                  });
                }}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Player name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="e.g., Kenya"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Age"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Height</label>
                    <input
                      type="text"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="e.g., 1.85m"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 82kg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Career Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Career Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {positions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jersey Number</label>
                    <input
                      type="number"
                      value={formData.jerseyNumber}
                      onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                      placeholder="e.g., 10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Goals</label>
                    <input
                      type="number"
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assists</label>
                    <input
                      type="number"
                      value={formData.assists}
                      onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Matches</label>
                    <input
                      type="number"
                      value={formData.matchesPlayed}
                      onChange={(e) => setFormData({ ...formData, matchesPlayed: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Yellow Cards</label>
                    <input
                      type="number"
                      value={formData.yellowCards}
                      onChange={(e) => setFormData({ ...formData, yellowCards: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Red Cards</label>
                    <input
                      type="number"
                      value={formData.redCards}
                      onChange={(e) => setFormData({ ...formData, redCards: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Media & Biography</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Player Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    {formData.photo && <p className="text-sm text-green-600 mt-2">✓ File selected: {formData.photo.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Biography</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Player biography"
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={editingPlayer ? handleUpdatePlayer : handleCreatePlayer}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50"
                >
                  {editingPlayer ? 'Update Player' : 'Create Player'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlayer(null);
                    setFormData({
                      name: '',
                      position: 'FWD',
                      jerseyNumber: '',
                      age: '',
                      nationality: '',
                      height: '',
                      weight: '',
                      bio: '',
                      team: '',
                      photo: null,
                      goals: 0,
                      assists: 0,
                      yellowCards: 0,
                      redCards: 0,
                      matchesPlayed: 0,
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