import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Calendar,
  MapPin,
  Users,
  Shield,
  Award,
  Settings,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    tournamentName: "",
    season: "",
    startDate: "",
    endDate: "",
    location: "",
    rules: "",
    maxTeams: "",
    maxPlayersPerTeam: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("general");

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("adminToken");
  };

  // ✅ Wrap fetchSettings in useCallback
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setMessage({ type: "error", text: "Please login to access settings" });
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5001/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();

      // ✅ USE the data variable (this fixes the unused 'data' error)
      setSettings({
        tournamentName: data.tournamentName || "",
        season: data.season || "",
        startDate: data.startDate
          ? new Date(data.startDate).toISOString().split("T")[0]
          : "",
        endDate: data.endDate
          ? new Date(data.endDate).toISOString().split("T")[0]
          : "",
        location: data.location || "",
        rules: data.rules || "",
        maxTeams: data.maxTeams || "",
        maxPlayersPerTeam: data.maxPlayersPerTeam || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load settings. Please try again.",
      });
      setLoading(false);
    }
  }, []); // ✅ Empty dependency array since it doesn't depend on any props/state

  // ✅ Add fetchSettings to dependency array
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = getAuthToken();

      if (!token) {
        setMessage({ type: "error", text: "Please login to save settings" });
        setSaving(false);
        return;
      }

      const response = await fetch("http://localhost:5001/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tournamentName: settings.tournamentName,
          season: settings.season,
          startDate: settings.startDate,
          endDate: settings.endDate,
          location: settings.location,
          rules: settings.rules,
          maxTeams: parseInt(settings.maxTeams) || 0,
          maxPlayersPerTeam: parseInt(settings.maxPlayersPerTeam) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      setMessage({
        type: "success",
        text: "✅ Settings saved successfully! Users can now see the updated rules.",
      });

      setSaving(false);

      // Clear success message after 5 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: "Failed to save settings. Please check your connection and try again.",
      });
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "tournament", label: "Tournament", icon: Award },
    { id: "rules", label: "Rules & Limits", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tournament Settings
              </h1>
              <p className="text-gray-600">
                Configure tournament details visible to all users
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 shadow-sm animate-fade-in ${
              message.type === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Public Visibility
              </h3>
              <p className="text-sm text-blue-700">
                All settings saved here will be immediately visible to users in
                the public portal. Users can view tournament name, dates,
                location, rules, and limits in the Rules tab.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  General Information
                </h2>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Visible to Users
                </span>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Award className="w-4 h-4" />
                  Tournament Name *
                </label>
                <input
                  type="text"
                  name="tournamentName"
                  value={settings.tournamentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Keiyo South Tournament"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed as the main tournament title
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Season *
                </label>
                <input
                  type="text"
                  name="season"
                  value={settings.season}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 2024/2025"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current tournament season or year
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={settings.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Keiyo South District"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Main venue or district where tournament is held
                </p>
              </div>
            </div>
          )}

          {/* TOURNAMENT TAB */}
          {activeTab === "tournament" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Tournament Schedule
                </h2>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Visible to Users
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={settings.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When the tournament begins
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={settings.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When the tournament ends
                  </p>
                </div>
              </div>

              {settings.startDate && settings.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">
                        Tournament Duration
                      </h3>
                      <p className="text-sm text-blue-700">
                        From{" "}
                        <strong>
                          {new Date(settings.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </strong>{" "}
                        to{" "}
                        <strong>
                          {new Date(settings.endDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        (
                        {Math.ceil(
                          (new Date(settings.endDate) -
                            new Date(settings.startDate)) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RULES TAB */}
          {activeTab === "rules" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Rules & Limitations
                </h2>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Visible to Users
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4" />
                    Maximum Teams *
                  </label>
                  <input
                    type="number"
                    name="maxTeams"
                    value={settings.maxTeams}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="16"
                    min="2"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of teams allowed
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Max Players Per Team *
                  </label>
                  <input
                    type="number"
                    name="maxPlayersPerTeam"
                    value={settings.maxPlayersPerTeam}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="25"
                    min="11"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum players per team roster
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Tournament Rules & Regulations *
                </label>
                <textarea
                  name="rules"
                  value={settings.rules}
                  onChange={handleInputChange}
                  rows="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all font-mono text-sm"
                  placeholder="Enter tournament rules and regulations here...

Example:
- Standard FIFA rules apply
- Each match is 90 minutes (45 min per half)
- Yellow cards: 2 = suspension
- Red card: immediate suspension
- Fair play expected from all teams"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  These rules will be displayed to all users in the Rules tab.
                  Be clear and comprehensive.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-900 mb-1">
                      Important
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Rules are visible to all users and participants. Make sure
                      they are clear, fair, and comprehensive. Users will see
                      these in the public Rules section.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SAVE BUTTON */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Changes are immediately visible to users after saving
              </p>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
            </div>
            <p className="text-sm text-gray-600">
              Users see changes immediately after you save. No delay or manual
              refresh needed.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Public Access</h3>
            </div>
            <p className="text-sm text-gray-600">
              All tournament info is publicly visible to users without requiring
              login.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Rules Display</h3>
            </div>
            <p className="text-sm text-gray-600">
              Rules appear in a dedicated Rules tab in the user portal with
              proper formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
