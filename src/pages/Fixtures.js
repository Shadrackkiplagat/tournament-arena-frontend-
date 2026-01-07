import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Play, CheckCircle, Clock, X } from 'lucide-react';
// Assuming these services use axios or standard fetch and handle auth headers internally
import { matchesAPI, teamsAPI } from '../services/api'; 

// Helper function to format date/time
const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

export default function FixturesManagement() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // Initial state for match creation/editing
  const initialFormState = {
    team1: '',
    team2: '',
    startTime: '',
    location: '',
    venue: '',
    referee: '',
    description: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Initial state for score updates
  const initialScoreState = {
    score1: 0,
    score2: 0,
    progress: 0,
    status: 'live',
    matchStats: {
      possession1: 50,
      possession2: 50,
      shots1: 0,
      shots2: 0,
      fouls1: 0,
      fouls2: 0,
    },
  };
  const [scoreData, setScoreData] = useState(initialScoreState);

  // Unified function to close all modals and clear editing state
  const closeModal = () => {
    setIsModalOpen(false);
    setIsScoreModalOpen(false);
    setEditingMatch(null);
    setFormData(initialFormState);
    setScoreData(initialScoreState);
    setError(null);
  };

  // --- Data Fetching Logic ---
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // API call adjusted to match typical service structure (assuming data is nested under 'data')
      const response = await matchesAPI.getAll(selectedStatus || null, currentPage);
      setMatches(response.data.matches || []); // Handle potential empty response structure
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to fetch matches.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, currentPage]);

  const fetchTeams = useCallback(async () => {
    try {
      // API call adjusted for expected structure
      const response = await teamsAPI.getAll(1);
      setTeams(response.data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to fetch teams data.');
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, [fetchMatches, fetchTeams]);

  // --- Action Handlers ---

  const handleCreateOrUpdateMatch = async () => {
    try {
      if (editingMatch) {
        await matchesAPI.update(editingMatch._id, formData);
        alert('Match updated successfully!');
      } else {
        await matchesAPI.create(formData);
        alert('Match created successfully!');
      }
      closeModal();
      fetchMatches(); // Refresh list
    } catch (err) {
      console.error('Error handling match operation:', err);
      setError('Error saving match: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateScoreSubmit = async () => {
    try {
      if (!editingMatch?._id) return;
      await matchesAPI.updateScore(editingMatch._id, scoreData);
      alert('Score updated successfully!');
      closeModal();
      fetchMatches(); // Refresh list
    } catch (err) {
      console.error('Error updating score:', err);
      setError('Error updating score: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteMatch = async (id) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await matchesAPI.delete(id);
        fetchMatches();
      } catch (err) {
        console.error('Error deleting match:', err);
        alert('Error deleting match: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setFormData({
      team1: match.team1?._id || '',
      team2: match.team2?._id || '',
      // Ensures the date format is compatible with input type="datetime-local"
      startTime: match.startTime.slice(0, 16), 
      location: match.location || '',
      venue: match.venue || '',
      referee: match.referee || '',
      description: match.description || '',
    });
    setIsModalOpen(true);
  };

  const handleEditScore = (match) => {
    setEditingMatch(match);
    // Initialize score data ensuring nested matchStats is handled correctly
    setScoreData({
      score1: match.score1 || 0,
      score2: match.score2 || 0,
      progress: match.progress || 0,
      status: match.status,
      matchStats: match.matchStats || initialScoreState.matchStats,
    });
    setIsScoreModalOpen(true);
  };

  // --- UI Helpers ---
  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-red-100 text-red-800 animate-pulse',
      completed: 'bg-green-100 text-green-800',
    };
    const icons = {
      scheduled: <Clock className="w-4 h-4" />,
      live: <Play className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // --- Render Functions ---

  const renderMatchRow = (match) => (
    <tr key={match._id} className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4">
            <div className="font-semibold text-gray-900">
                {match.team1?.name || 'TBD'} <span className="text-orange-500">vs</span> {match.team2?.name || 'TBD'}
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
            {formatDateTime(match.startTime)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
            {match.venue || match.location || 'TBD'}
        </td>
        <td className="px-6 py-4 font-bold text-gray-900">
            {match.status === 'scheduled'
                ? '— : —'
                : `${match.score1 || 0} : ${match.score2 || 0}`}
        </td>
        <td className="px-6 py-4">
            {getStatusBadge(match.status)}
        </td>
        <td className="px-6 py-4 flex items-center gap-3">
            <button
                onClick={() => handleEditMatch(match)}
                title="Edit Match Details"
                className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-100"
            >
                <Edit2 className="w-5 h-5" />
            </button>
            <button
                onClick={() => handleEditScore(match)}
                title="Update Score & Status"
                className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded-full hover:bg-orange-100"
            >
                <Play className="w-5 h-5" />
            </button>
            <button
                onClick={() => handleDeleteMatch(match._id)}
                title="Delete Match"
                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-100"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </td>
    </tr>
  );

  const renderCreateEditModal = () => (
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                  {editingMatch ? 'Edit Match Details' : 'Create New Match'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
              </button>
          </div>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); handleCreateOrUpdateMatch(); }} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Team 1</label>
                  <select
                      value={formData.team1}
                      onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                  >
                      <option value="">Select Team 1</option>
                      {teams.map(team => (<option key={team._id} value={team._id}>{team.name}</option>))}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Team 2</label>
                  <select
                      value={formData.team2}
                      onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                  >
                      <option value="">Select Team 2</option>
                      {teams.map(team => (<option key={team._id} value={team._id}>{team.name}</option>))}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                  />
              </div>
              {/* Other fields for Venue, Referee, etc. handled similarly */}
              <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Referee</label>
                  <input type="text" value={formData.referee} onChange={(e) => setFormData({ ...formData, referee: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
              </div>
              
              <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                      {editingMatch ? 'Update Match' : 'Create Match'}
                  </button>
              </div>
          </form>
      </div>
  );

  const renderScoreModal = () => (
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Update Score & Stats</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
              </button>
          </div>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); handleUpdateScoreSubmit(); }} className="space-y-4">
              <div className="flex gap-4">
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Score Team 1</label>
                      <input
                          type="number"
                          value={scoreData.score1}
                          onChange={(e) => setScoreData({ ...scoreData, score1: parseInt(e.target.value) })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          min="0"
                      />
                  </div>
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Score Team 2</label>
                      <input
                          type="number"
                          value={scoreData.score2}
                          onChange={(e) => setScoreData({ ...scoreData, score2: parseInt(e.target.value) })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          min="0"
                      />
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                      value={scoreData.status}
                      onChange={(e) => setScoreData({ ...scoreData, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                  </select>
              </div>
              
              {scoreData.status === 'live' && (
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Progress (%)</label>
                      <input
                          type="range"
                          min="0"
                          max="100"
                          value={scoreData.progress}
                          onChange={(e) => setScoreData({ ...scoreData, progress: parseInt(e.target.value) })}
                          className="mt-1 block w-full"
                      />
                      <span className="text-sm text-gray-500">{scoreData.progress}%</span>
                  </div>
              )}

              <h3 className='font-semibold mt-4 text-gray-800'>Match Statistics</h3>
              <div className='grid grid-cols-2 gap-4'>
                  <div>
                      <label className="block text-sm text-gray-700">Possession T1 (%)</label>
                      <input type="number" min="0" max="100" value={scoreData.matchStats.possession1} 
                          onChange={e => setScoreData({...scoreData, matchStats: {...scoreData.matchStats, possession1: parseInt(e.target.value)}})} />
                  </div>
                   <div>
                      <label className="block text-sm text-gray-700">Possession T2 (%)</label>
                      <input type="number" min="0" max="100" value={scoreData.matchStats.possession2} 
                          onChange={e => setScoreData({...scoreData, matchStats: {...scoreData.matchStats, possession2: parseInt(e.target.value)}})} />
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                      Update Score
                  </button>
              </div>
          </form>
      </div>
  );
  
  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Fixtures & Results
          </h1>
          <button
            onClick={() => {
              setEditingMatch(null);
              setFormData(initialFormState);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Match
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {['', 'scheduled', 'live', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedStatus === status
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </button>
          ))}
        </div>
        
        {error && !loading && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                {error}
            </div>
        )}

        {/* Matches Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No matches found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Match</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date & Time</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Venue</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Score</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {matches.map(renderMatchRow)}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {matches.length > 0 && (
            <div className="flex justify-between items-center mt-8 text-white">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-orange-500 rounded disabled:opacity-50 hover:bg-orange-600"
                >
                    Previous
                </button>
                <span>Page {currentPage}</span>
                <button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
                >
                    Next
                </button>
            </div>
        )}
      </div>

      {/* --- Modal Container --- */}
      {(isModalOpen || isScoreModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            {isModalOpen && renderCreateEditModal()}
            {isScoreModalOpen && renderScoreModal()}
        </div>
      )}
    </div>
  );
}
