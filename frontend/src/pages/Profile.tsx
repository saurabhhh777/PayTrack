import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { MessageCircle, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface TelegramStatus {
  telegramUsername: string | null;
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

  useEffect(() => {
    fetchTelegramStatus();
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
      await api.post('/telegram/add-telegram', { telegramUsername: null });
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>

        {/* User Info */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <p className="text-gray-800 font-medium">{user?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-gray-800 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
              <p className="text-gray-800 font-medium">
                {'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Telegram Username */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-700">Telegram Username</h2>
          </div>

          {telegramStatus.telegramUsername ? (
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-100 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">Telegram username configured!</p>
                  <p className="text-green-600 text-sm">@{telegramStatus.telegramUsername}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRemoveTelegram}
                  disabled={removing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {removing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Remove Telegram Username
                </button>
              </div>

              <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Current username:</strong> @{telegramStatus.telegramUsername}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  To change, enter a new username below and click Update, or click Remove to delete it completely.
                </p>
              </div>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUpdateTelegram}
                  disabled={loading || !telegramUsername.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Update
                </button>
              </div>

              <div className="text-sm text-gray-500">
                <p>• Username must be 3-32 characters long</p>
                <p>• Only letters, numbers, and underscores allowed</p>
                <p>• Don't include the @ symbol</p>
              </div>
            </div>
          )}

          {/* Update Username Section - Always visible when username exists */}
          {telegramStatus.telegramUsername && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">Update Username</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter new Telegram username (without @)"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUpdateTelegram}
                  disabled={loading || !telegramUsername.trim() || telegramUsername === telegramStatus.telegramUsername}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
          )}
        </div>

        {/* Telegram Bot Info */}
        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
              🤖
            </span>
            Telegram Bot Access
          </h2>
          
          {telegramStatus.telegramUsername ? (
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-100 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">Bot access granted!</p>
                  <p className="text-green-600 text-sm">
                    You can now use the PayTrack Telegram bot with username @{telegramStatus.telegramUsername}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-gray-800 mb-2">Available Bot Commands:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-purple-600 mr-2">📊</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">/summary</code>
                    <span className="text-gray-600 ml-2">View analytics</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-600 mr-2">👥</span>
                    <code className="bg-red-100 px-2 py-1 rounded">/workers</code>
                    <span className="text-gray-600 ml-2">List workers</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-600 mr-2">🌾</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">/crops</code>
                    <span className="text-gray-600 ml-2">View agriculture</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-600 mr-2">🏠</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">/properties</code>
                    <span className="text-gray-600 ml-2">View real estate</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">How to use the bot:</h3>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Open Telegram and search for your PayTrack bot</li>
                  <li>Send <code className="bg-blue-100 px-1 rounded">/start</code></li>
                  <li>Use the available commands from the menu</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-yellow-100 rounded-lg border border-yellow-200">
              <XCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">Bot access pending</p>
                <p className="text-yellow-600 text-sm">
                  Add your Telegram username above to access the Telegram bot.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-100 border-green-200 text-green-800' 
              : 'bg-red-100 border-red-200 text-red-800'
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
    </div>
  );
};

export default Profile; 