import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Main Application Component
 * Manages the game state and user interactions for the Points Master Arena
 */
function App() {
  // State Management
  const [users, setUsers] = useState([]); // Stores all players and their scores
  const [selectedUser, setSelectedUser] = useState(''); // Currently selected player
  const [newUsername, setNewUsername] = useState(''); // New player username input
  const [lastPoints, setLastPoints] = useState(null); // Last points earned
  const [loading, setLoading] = useState(false); // Loading state for animations
  const [pointHistory, setPointHistory] = useState([]); // Game history log

  // Initial data fetch on component mount
  useEffect(() => {
    fetchUsers();
    fetchPointHistory();
  }, []);

  /**
   * Fetches point history from the server
   * Updates the pointHistory state with the latest game actions
   */
  const fetchPointHistory = async () => {
    try {
      const response = await axios.get('https://task-backend-2-wmhm.onrender.com/point-history');
      setPointHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  /**
   * Fetches and sorts users by points
   * Updates the users state with sorted leaderboard data
   */
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://task-backend-2-wmhm.onrender.com/users');
      setUsers(response.data.sort((a, b) => b.points - a.points));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  /**
   * Handles new player registration
   * @param {Event} e - Form submission event
   */
  const addUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    try {
      await axios.post('https://task-backend-2-wmhm.onrender.com/users', { username: newUsername });
      setNewUsername('');
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  /**
   * Handles point claiming action
   * Updates user points and history
   */
  const claimPoints = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const response = await axios.post(`https://task-backend-2-wmhm.onrender.com/claim-points`, {
        userId: selectedUser
      });
      setLastPoints(response.data.pointsAwarded);

      // Fetch users and history in sequence to ensure state is updated after backend changes
      await fetchUsers();
      await fetchPointHistory();

      // Optionally, force a re-render by updating selectedUser (if needed)
      // setSelectedUser(selectedUser);
    } catch (error) {
      console.error('Error claiming points:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '8px',
            border: '2px solid #10B981',
          }
        }}
      />
      
      {/* Navigation Header */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-5xl font-bold animate-shine text-center">
            Points Master Arena
          </h1>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Game Controls Panel */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6 neo-brutalism hover:-translate-y-1 transition-transform duration-200">
              <h2 className="card-title mb-6">
                Game Controls
              </h2>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">New Player</label>
                  <form onSubmit={addUser} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full rounded-lg bg-slate-700/50 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Enter username"
                    />
                    <button
                      type="submit"
                      className="whitespace-nowrap bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                    >
                      Add
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Select Player</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => {
                      setSelectedUser(e.target.value);
                      setLastPoints(null); // Clear lastPoints when user changes
                    }}
                    className="w-full rounded-lg bg-slate-700/50 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    <option value="">Choose a player</option>
                    {users.length === 0 && (
                      <option disabled>No users found</option>
                    )}
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={claimPoints}
                  disabled={!selectedUser || loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  {loading ? 'Rolling...' : 'Roll for Points'}
                </button>

                {lastPoints && (
                  <div className="animate-bounce text-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <span className="text-green-700 font-semibold text-lg">+{lastPoints} points!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard Display */}
          <div className="lg:col-span-5">
            <div className="glass-card neo-brutalism overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Master Rankings
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead>
                    <tr className="bg-slate-800/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Player</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map((user, index) => (
                      <tr 
                        key={user._id} 
                        className={`${
                          selectedUser === String(user._id)
                            ? 'bg-blue-900/30' 
                            : 'hover:bg-slate-700/30'
                        } transition-colors duration-150`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-blue-200">#{index + 1}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-white">{user.username}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-400">{user.points}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Point History Log */}
          <div className="lg:col-span-4">
            <div className="glass-card neo-brutalism overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Point History
                </h2>
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                <div className="divide-y divide-slate-700">
                  {pointHistory.length === 0 && (
                    <div className="p-4 text-slate-400 text-center">No history yet.</div>
                  )}
                  {pointHistory.map((record) => (
                    <div key={record._id} className="p-4 hover:bg-slate-700/30">
                      <p className="text-sm text-slate-300">
                        <span className="font-medium text-white">
                          {
                            typeof record.userId === 'object' && record.userId !== null
                              ? record.userId.username
                              : typeof record.userId === 'string'
                                ? (
                                    users.find(u => String(u._id) === String(record.userId))?.username ||
                                    record.userId // fallback to userId string
                                  )
                                : 'Unknown'
                          }
                        </span>
                        {' '}claimed{' '}
                        <span className="font-medium text-emerald-400">
                          +{record.pointsAwarded}
                        </span>
                        {' '}points
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">About</h3>
              <p className="text-slate-400">
                A modern points-based leaderboard game where players compete for the top spot.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="footer-link">How to Play</a></li>
                <li><a href="#" className="footer-link">Rules</a></li>
                <li><a href="#" className="footer-link">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="footer-link">Twitter</a>
                <a href="#" className="footer-link">Discord</a>
                <a href="#" className="footer-link">GitHub</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>© 2024 Points Master Arena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
