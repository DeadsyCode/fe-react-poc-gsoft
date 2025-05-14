import { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout/Layout';
import { isAuthenticated } from '../services/authService';
import PieChart, { PieChartData } from '../components/Charts/PieChart';
import './Dashboard.css';
import '../components/Charts/PieChart.css';
// Import string operations utility


// Import services
import { getAllUsers, User } from '../services/userService';
import { getAllClients, Client } from '../services/clientService';
import { getAllMatters, Matter } from '../services/matterService';
import { getAllTimeEntries, TimeEntry } from '../services/timeEntryService';

interface CardProps {
  title: string;
  value: string | number;
  icon?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}
const getInitials = (name: string) => {

  const firstInitial = name ? name.charAt(0) : '';
  const lastInitial = name ? name.split(' ')[1].charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

const StatCard = ({ title, value, icon = '📊', change, trend }: CardProps) => {
  return (
    <div className="stat-card">
      {/* <div className="stat-icon">{icon}</div> */}
      <div className="stat-details">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {/* {change && (
          <div className={`stat-change ${trend}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
          </div>
        )} */}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const { t } = useTranslation();

  // Data state hooks
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Growth trend states (mock data for UI display)
  const [userGrowth] = useState<string>('+12%');
  const [clientGrowth] = useState<string>('+8%');
  const [matterGrowth] = useState<string>('+15%');
  const [hoursGrowth] = useState<string>('+10%');

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  // Define all helper functions and memoized values BEFORE conditional returns
  // to ensure React hooks are called in the same order every render

  // Calculate total hours from time entries
  const calculateTotalHours = (): number => {
    return timeEntries.reduce((sum, entry) => {
      // Calculate hours if start and end time exist
      if (entry.startTime && entry.endTime) {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + diffHours;
      }
      return sum;
    }, 0);
  };

  // Get upcoming tasks (any task from today and beyond)
  const getUpcomingTasks = (): TimeEntry[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    return timeEntries.filter(entry => {
      if (!entry.timeEntryDate) return false;
      const entryDate = new Date(entry.timeEntryDate);
      entryDate.setHours(0, 0, 0, 0); // Start of entry date
      return entryDate >= today;
    }).sort((a, b) => {
      const dateA = a.timeEntryDate ? new Date(a.timeEntryDate) : new Date();
      const dateB = b.timeEntryDate ? new Date(b.timeEntryDate) : new Date();
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Prepare data for matters per client chart
  const mattersPerClientData = useMemo(() => {
    if (!matters.length || !clients.length) return [];

    // Create a map of client IDs to matter counts
    const clientMattersMap = new Map<number, number>();

    // Initialize counts for all clients
    clients.forEach(client => clientMattersMap.set(client.id, 0));

    // Count matters per client
    matters.forEach(matter => {
      if (matter.clientId) {
        const currentCount = clientMattersMap.get(matter.clientId) || 0;
        clientMattersMap.set(matter.clientId, currentCount + 1);
      }
    });

    // Convert to PieChartData format, only including clients with matters
    const result: PieChartData[] = [];
    clients.forEach(client => {
      const matterCount = clientMattersMap.get(client.id) || 0;
      if (matterCount > 0) {
        result.push({
          x: client.shortName,
          y: matterCount
        });
      }
    });

    // Sort by matter count descending, and limit to top 8 for readability
    return result
      .sort((a, b) => b.y - a.y)
      .slice(0, 8);
  }, [matters, clients]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch data from services in parallel
        const [usersData, clientsData, mattersData, timeEntriesData] = await Promise.all([
          getAllUsers(),
          getAllClients(),
          getAllMatters(),
          getAllTimeEntries()
        ]);

        setUsers(usersData);
        setClients(clientsData);
        setMatters(mattersData);
        setTimeEntries(timeEntriesData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    // Only fetch data if authenticated
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  if (authenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state
  if (loading && authenticated) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>{t('common.retry')}</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{t('dashboard.title')}</h1>
          <p>{t('dashboard.summary')}</p>
        </div>

        <div className="stats-grid">
          <StatCard
            title={t('analytics.totalUsers')}
            value={users.length}
            icon="👥"
            change={userGrowth}
            trend="up"
          />
          <StatCard
            title={t('analytics.totalClients')}
            value={clients.length}
            icon="💼"
            change={clientGrowth}
            trend="up"
          />
          <StatCard
            title={t('analytics.totalMatters')}
            value={matters.length}
            icon="🗂️"
            change={matterGrowth}
            trend="up"
          />
          <StatCard
            title={t('analytics.totalHours')}
            value={calculateTotalHours().toFixed(1)}
            icon="⏱️"
            change={hoursGrowth}
            trend="up"
          />
        </div>

        <div className="dashboard-grid">
          {/* <div className="dashboard-card activities-card">
            <h2 className='ac-card-title'>{t('dashboard.recentActivities')}</h2>
            <div className="activities-list">
              {timeEntries.length > 0 ? (
                [...timeEntries]
                  .sort((a, b) => {
                    const dateA = a.timeEntryDate ? new Date(a.timeEntryDate).getTime() : 0;
                    const dateB = b.timeEntryDate ? new Date(b.timeEntryDate).getTime() : 0;
                    return dateB - dateA; // Sort by newest first
                  })
                  .slice(0, 5)
                  .map((entry) => (
                    <div key={entry.id} className="activity-item">
                      <div className="activity-icon"></div>
                      <div className="activity-content">
                        <div className="activity-title">
                          {entry.description || `Activity for ${entry.clientName || 'Client'}`}
                        </div>
                        <div className="activity-time">
                          {entry.timeEntryDate
                            ? `${new Date(entry.timeEntryDate).toLocaleDateString()}`
                            : 'No date'}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-activities">
                  <p>{t('dashboard.noRecentActivities')}</p>
                </div>
              )}
            </div>
          </div> */}

          <div className="dashboard-card">
            <h2 >{t('dashboard.mattersPerClient')}</h2>
            <div className="dashboard-chart-container">
              <PieChart
                title=""
                data={mattersPerClientData}
                innerRadius="40%"
                legendPosition="Bottom"
                height="250px"
              />
            </div>
          </div>

          <div className="dashboard-card">
            <h2 >{t('dashboard.upcomingTasks')}</h2>
            <div className="tasks-list">
              {getUpcomingTasks().length > 0 ? (
                getUpcomingTasks().slice(0, 5).map((task) => (
                  <div key={task.id} className="task-item">

                    <label htmlFor={`task-${task.id}`}>
                      {task.description || `Task for ${task.clientName || 'Client'}`}
                      <div className="task-date">
                        {task.timeEntryDate ? new Date(task.timeEntryDate).toLocaleDateString() : 'No date'}
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="no-tasks">
                  <p>{t('dashboard.noUpcomingTasks')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h2 >{t('dashboard.teamMembers')}</h2>
            <div className="team-list">
              {users.length > 0 ? (
                users.slice(0, 5).map((user) => (
                  <div key={user.id} className="team-item">
                    <div className="team-avatar">{getInitials(`${user.firstName} ${user.lastName}`)}</div>
                    <div className="team-details">
                      <div className="team-name">{`${user.firstName} ${user.lastName}`}</div>
                      <div className="team-role">{user.roleName || 'Team Member'}</div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="no-team-members">
                  <p>{t('dashboard.noTeamMembers')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
