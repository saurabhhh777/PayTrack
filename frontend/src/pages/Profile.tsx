import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { MessageCircle, Shield, CheckCircle, XCircle, Trash2, User, Mail, Calendar, Settings, Activity, BarChart3, Edit } from 'lucide-react';
import { format } from 'date-fns'

interface TelegramStatus {
  telegramUsername: string | null;
}

interface ProfileStats {
  totalWorkers: number;
  totalCultivations: number;
  totalProperties: number;
  totalMealRecords: number;
  recentActivities: Array<{
    id: string;
    action: string;
    details: string;
    time: string;
    type: string;
  }>;
}

const Profile = () => {
  const { user } = useAuthStore();
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>({
    telegramUsername: null
  });
  const [telegramUsername, setTelegramUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalWorkers: 0,
    totalCultivations: 0,
    totalProperties: 0,
    totalMealRecords: 0,
    recentActivities: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [memberSince, setMemberSince] = useState<string>('');

  useEffect(() => {
    fetchTelegramStatus();
    fetchProfileStats();
    fetchMemberSince();
  }, []);

  const fetchTelegramStatus = async () => {
    try {
      const response = await api.get('/telegram/status');
      setTelegramStatus(response.data);
      if (response.data.telegramUsername) {
        setTelegramUsername(response.data.telegramUsername);
      }
    } catch (error) {
      console.error('Error fetching Telegram status:', error);
    }
  };

  const fetchProfileStats = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch data from multiple endpoints
      const [workersRes, cultivationsRes, propertiesRes, mealRes] = await Promise.all([
        api.get('/workers').catch(() => ({ data: [] })),
        api.get('/cultivations').catch(() => ({ data: [] })),
        api.get('/properties').catch(() => ({ data: [] })),
        api.get('/meel').catch(() => ({ data: { meelRecords: [] } }))
      ]);

      setProfileStats({
        totalWorkers: Array.isArray(workersRes.data) ? workersRes.data.length : 0,
        totalCultivations: Array.isArray(cultivationsRes.data) ? cultivationsRes.data.length : 0,
        totalProperties: Array.isArray(propertiesRes.data) ? propertiesRes.data.length : 0,
        totalMealRecords: mealRes.data.meelRecords ? mealRes.data.meelRecords.length : 0,
        recentActivities: [] // We'll implement this later when we have activity tracking
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMemberSince = async () => {
    try {
      const me = await api.get('/auth/me');
      if (me.data?.createdAt) {
        setMemberSince(format(new Date(me.data.createdAt), 'MMMM yyyy'))
      }
    } catch (e) {
      console.error('Error fetching member since:', e)
    }
  }

  const handleUpdateTelegram = async () => {
    if (!telegramUsername.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Telegram username' });
      return;
    }

    if (telegramUsername.startsWith('@')) {
      setMessage({ type: 'error', text: 'Please enter username without @ symbol' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/telegram/add-telegram', { telegramUsername });
      setMessage({ type: 'success', text: response.data.message });
      await fetchTelegramStatus();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update Telegram username' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTelegram = async () => {
    if (!confirm('Are you sure you want to remove your Telegram username? This will revoke your access to the Telegram bot.')) {
      return;
    }

    setRemoving(true);
    setMessage(null);

    try {
      await api.post('/telegram/remove-telegram');
      setMessage({ type: 'success', text: 'Telegram username removed successfully' });
      await fetchTelegramStatus();
      setTelegramUsername('');
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to remove Telegram username' 
      });
    } finally {
      setRemoving(false);
    }
  };

  const stats = [
    { 
      label: 'Total Workers', 
      value: statsLoading ? '...' : profileStats.totalWorkers.toString(), 
      change: '', 
      icon: User, 
      color: 'blue' 
    },
    { 
      label: 'Cultivations', 
      value: statsLoading ? '...' : profileStats.totalCultivations.toString(), 
      change: '', 
      icon: BarChart3, 
      color: 'green' 
    },
    { 
      label: 'Properties', 
      value: statsLoading ? '...' : profileStats.totalProperties.toString(), 
      change: '', 
      icon: Calendar, 
      color: 'purple' 
    },
    { 
      label: 'Trading Records', 
      value: statsLoading ? '...' : profileStats.totalMealRecords.toString(), 
      change: '', 
      icon: Activity, 
      color: 'orange' 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-medium mb-2">Profile Settings</h1>
              <p className="text-xl text-blue-100">
                Manage your account information and Telegram integration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Cards */}
            <div>
        <h2 className="text-2xl font-medium text-gray-900 mb-6">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <Edit className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Username</h3>
            <p className="text-base font-medium text-gray-900 break-words overflow-hidden">{user?.username}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <Edit className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
            <p className="text-sm font-medium text-gray-900 break-all overflow-hidden leading-relaxed">{user?.email}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Role</h3>
            <p className="text-lg font-medium text-gray-900">
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Member Since</h3>
            <p className="text-lg font-medium text-gray-900">{memberSince || '—'}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-medium text-gray-900 mb-6">Activity Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600'
            };
            
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {stat.change && (
                    <span className="text-sm text-green-600">{stat.change}</span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.label}</h3>
                <p className="text-3xl font-medium text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Telegram Integration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">Telegram Integration</h3>
                <p className="text-sm text-gray-500">Connect your Telegram account for bot access</p>
              </div>
            </div>
          </div>

          <div className="p-6">
          {telegramStatus.telegramUsername ? (
            <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-2xl border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                    <p className="text-green-800 font-medium">Connected!</p>
                  <p className="text-green-600 text-sm">@{telegramStatus.telegramUsername}</p>
                </div>
              </div>

                <div className="bg-gray-50 p-4 rounded-2xl">
                  <h4 className="font-medium text-gray-800 mb-3">Update Username</h4>
              <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter new username (without @)"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleUpdateTelegram}
                      disabled={loading || !telegramUsername.trim() || telegramUsername === telegramStatus.telegramUsername}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Update
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleRemoveTelegram}
                  disabled={removing}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                >
                  {removing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Remove Connection
                </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Add your Telegram username to access the PayTrack bot and enhance your account security.
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Telegram username (without @)"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUpdateTelegram}
                  disabled={loading || !telegramUsername.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                    Connect
                </button>
              </div>

                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                  <p className="font-medium mb-1">Requirements:</p>
                <p>• Username must be 3-32 characters long</p>
                <p>• Only letters, numbers, and underscores allowed</p>
                <p>• Don't include the @ symbol</p>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-500">Manage your PayTrack data</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/workers'}
                className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200"
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Manage Workers</span>
                </div>
                <span className="text-sm text-blue-600">{profileStats.totalWorkers} workers</span>
              </button>

              <button 
                onClick={() => window.location.href = '/agriculture'}
                className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200"
              >
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">View Cultivations</span>
                </div>
                <span className="text-sm text-green-600">{profileStats.totalCultivations} records</span>
              </button>

              <button 
                onClick={() => window.location.href = '/real-estate'}
                className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200"
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Properties</span>
                </div>
                <span className="text-sm text-purple-600">{profileStats.totalProperties} properties</span>
              </button>

              <button 
                onClick={() => window.location.href = '/meel'}
                className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200"
              >
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="font-medium text-orange-900">Trading Records</span>
                </div>
                <span className="text-sm text-orange-600">{profileStats.totalMealRecords} trades</span>
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* Telegram Bot Info */}
      {telegramStatus.telegramUsername && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">Telegram Bot Commands</h3>
                <p className="text-sm text-gray-500">Available commands for PayTrack bot</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">/summary</code>
                  <p className="text-sm text-gray-600 mt-1">View analytics summary</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">/workers</code>
                  <p className="text-sm text-gray-600 mt-1">List all workers</p>
                  </div>
                  </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mr-3">🌾</span>
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">/crops</code>
                  <p className="text-sm text-gray-600 mt-1">View agriculture data</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl mr-3">🏠</span>
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">/properties</code>
                  <p className="text-sm text-gray-600 mt-1">View real estate</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Getting Started:</h4>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Open Telegram and search for your PayTrack bot</li>
                <li>Send <code className="bg-blue-200 px-1 rounded">/start</code> to begin</li>
                <li>Use any of the commands above to get information</li>
              </ol>
            </div>
          </div>
        </div>
      )}

        {/* Messages */}
        {message && (
        <div className={`p-4 rounded-2xl border ${
            message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}
    </div>
  );
};

export default Profile; 