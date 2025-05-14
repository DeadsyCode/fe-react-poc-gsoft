import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Analytics.css';
import Layout from '../components/Layout/Layout';

// Import SyncFusion components
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  PieSeries,
  AccumulationLegend,
  AccumulationTooltip,
  AccumulationDataLabel,
  Inject
} from '@syncfusion/ej2-react-charts';

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Category,
  ColumnSeries,
  Tooltip,
  Legend,
  LineSeries,
  DateTime,
  DataLabel,
  SplineAreaSeries,
  Axis
} from '@syncfusion/ej2-react-charts';

import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject as GridInject,
  Filter,
  Group,
  Sort
} from '@syncfusion/ej2-react-grids';

// Import services
import { getAllUsers, User } from '../services/userService';
import { getAllClients, Client } from '../services/clientService';
import { getAllMatters, Matter } from '../services/matterService';
import { getAllTimeEntries, TimeEntry } from '../services/timeEntryService';
import { getAllProcessTypes } from '../services/workflowService';

// Define card component
const KpiCard = ({ title, value, trend, trendValue, icon }: {
  title: string,
  value: number | string,
  trend: 'up' | 'down' | 'neutral',
  trendValue: string,
  icon: string
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-card-icon">
        <i className={icon}></i>
      </div>
      <div className="kpi-card-content">
        <h3 className="kpi-card-title">{title}</h3>
        <div className="kpi-card-value">{value}</div>
        <div className={`kpi-card-trend ${trend}`}>
          <i className={trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'arrow-right'}></i>
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
};

const Analytics = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for "growth" - in a real app, this would come from an API that provides historical data
  const [userGrowth] = useState<string>('+12%');
  const [clientGrowth] = useState<string>('+8%');
  const [matterGrowth] = useState<string>('+15%');

  // Mock time tracking data by month
  const timeTrackingData = [
    { month: 'Jan', hours: 180 },
    { month: 'Feb', hours: 210 },
    { month: 'Mar', hours: 245 },
    { month: 'Apr', hours: 270 },
    { month: 'May', hours: 320 },
    { month: 'Jun', hours: 310 },
    { month: 'Jul', hours: 350 },
    { month: 'Aug', hours: 370 },
    { month: 'Sep', hours: 390 },
    { month: 'Oct', hours: 410 },
    { month: 'Nov', hours: 430 },
    { month: 'Dec', hours: 450 }
  ];

  // Mock client distribution data
  const clientDistributionData = [
    { x: 'Corporate', y: 35 },
    { x: 'Individual', y: 25 },
    { x: 'Government', y: 15 },
    { x: 'Non-profit', y: 25 }
  ];

  // Mock matter status data
  const matterStatusData = [
    { x: 'Active', y: 65 },
    { x: 'Pending', y: 20 },
    { x: 'Completed', y: 15 }
  ];

  // Mock matter by type data
  const matterByTypeData = [
    { x: 'Contract Review', y: 35 },
    { x: 'Litigation', y: 25 },
    { x: 'Corporate', y: 20 },
    { x: 'IP', y: 15 },
    { x: 'Other', y: 5 }
  ];

  // Mock top clients data
  const topClientsData = [
    { ClientName: 'Acme Corp', TotalMatters: 12, TotalHours: 450, Revenue: '$45,000' },
    { ClientName: 'Globex Inc', TotalMatters: 8, TotalHours: 320, Revenue: '$32,000' },
    { ClientName: 'Wayne Enterprises', TotalMatters: 6, TotalHours: 280, Revenue: '$28,000' },
    { ClientName: 'Stark Industries', TotalMatters: 5, TotalHours: 210, Revenue: '$21,000' },
    { ClientName: 'Oscorp', TotalMatters: 4, TotalHours: 180, Revenue: '$18,000' }
  ];

  // Mock time entries trend
  const monthlyTimeEntriesData = [
    { x: new Date(2023, 0, 1), y: 850 },
    { x: new Date(2023, 1, 1), y: 920 },
    { x: new Date(2023, 2, 1), y: 980 },
    { x: new Date(2023, 3, 1), y: 1050 },
    { x: new Date(2023, 4, 1), y: 1100 },
    { x: new Date(2023, 5, 1), y: 1150 },
    { x: new Date(2023, 6, 1), y: 1230 },
    { x: new Date(2023, 7, 1), y: 1280 },
    { x: new Date(2023, 8, 1), y: 1350 },
    { x: new Date(2023, 9, 1), y: 1420 },
    { x: new Date(2023, 10, 1), y: 1500 },
    { x: new Date(2023, 11, 1), y: 1580 }
  ];

  // Mock user productivity data
  const userProductivityData = [
    { lawyer: 'John Smith', hours: 180, matters: 12 },
    { lawyer: 'Jane Doe', hours: 210, matters: 15 },
    { lawyer: 'Robert Johnson', hours: 165, matters: 10 },
    { lawyer: 'Emily Wang', hours: 195, matters: 13 },
    { lawyer: 'Michael Brown', hours: 150, matters: 8 }
  ];

  // Chart palette
  const palette = ['#357cd2', '#e56590', '#f8b883', '#70ad47', '#dd8abd', '#7f84e8', '#7bb4eb', '#ea7a57'];

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

    fetchData();
  }, []);

  const loadChart = (args: any) => {
    // Theme handling for charts
    let selectedTheme = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    if (args.chart) {
      args.chart.theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
        .replace(/contrast/i, 'Contrast')
        .replace(/-dark/i, "Dark");
    } else if (args.accumulation) {
      args.accumulation.theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
        .replace(/contrast/i, 'Contrast')
        .replace(/-dark/i, "Dark");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="analytics-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="analytics-page">
        <h1 className="analytics-title">{t('analytics.title')}</h1>

        {/* KPI Cards Section */}
        <div className="kpi-cards-container">
          <KpiCard
            title={t('analytics.totalUsers')}
            value={users.length}
            trend="up"
            trendValue={userGrowth}
            icon="users-icon"
          />
          <KpiCard
            title={t('analytics.totalClients')}
            value={clients.length}
            trend="up"
            trendValue={clientGrowth}
            icon="clients-icon"
          />
          <KpiCard
            title={t('analytics.totalMatters')}
            value={matters.length}
            trend="up"
            trendValue={matterGrowth}
            icon="matters-icon"
          />
          <KpiCard
            title={t('analytics.totalHours')}
            value={timeEntries.length > 0 ?
              timeEntries.reduce((sum, entry) => {
                // Calculate hours if start and end time exist
                if (entry.startTime && entry.endTime) {
                  const start = new Date(entry.startTime);
                  const end = new Date(entry.endTime);
                  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  return sum + diffHours;
                }
                return sum;
              }, 0).toFixed(1) : '0'
            }
            trend="up"
            trendValue="+10%"
            icon="time-icon"
          />
        </div>

        {/* Charts Row 1 */}
        {/* <div className="analytics-charts-row">
          <div className="analytics-chart-container">
            <h2 className="chart-title">{t('analytics.monthlyHoursTracked')}</h2>
            <ChartComponent
              id="hoursTrackedChart"
              primaryXAxis={{
                valueType: 'Category',
                majorGridLines: { width: 0 },
                labelStyle: { size: '14px' }
              }}
              primaryYAxis={{
                title: 'Hours',
                minimum: 0,
                maximum: 500,
                interval: 100,
                labelFormat: '{value}',
                labelStyle: { size: '14px' }
              }}
              chartArea={{ border: { width: 0 } }}
              tooltip={{ enable: true }}
              palettes={palette}
              load={loadChart}
            >
              <Inject services={[ColumnSeries, DateTime, Legend, Tooltip, DataLabel, Category]} />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={timeTrackingData}
                  xName='month'
                  yName='hours'
                  name='Hours Tracked'
                  type='Column'
                  cornerRadius={{
                    topLeft: 5,
                    topRight: 5
                  }}
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>

          <div className="analytics-chart-container">
            <h2 className="chart-title">{t('analytics.clientDistribution')}</h2>
            <AccumulationChartComponent
              id="clientDistribution"
              legendSettings={{ visible: true, position: 'Bottom' }}
              enableSmartLabels={true}
              enableAnimation={true}
              tooltip={{ enable: true }}
              load={loadChart}
            >
              <Inject services={[AccumulationLegend, PieSeries, AccumulationTooltip, AccumulationDataLabel]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={clientDistributionData}
                  xName='x'
                  yName='y'
                  innerRadius='40%'
                  dataLabel={{
                    visible: true,
                    name: 'text',
                    position: 'Inside',
                    font: {
                      fontWeight: '600',
                      color: '#ffffff'
                    }
                  }}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          </div>
        </div> */}

        {/* Charts Row 2 */}
        {/* <div className="analytics-charts-row">
          <div className="analytics-chart-container">
            <h2 className="chart-title">{t('analytics.matterStatus')}</h2>
            <AccumulationChartComponent
              id="matterStatus"
              legendSettings={{ visible: true, position: 'Bottom' }}
              enableSmartLabels={true}
              enableAnimation={true}
              tooltip={{ enable: true }}
              load={loadChart}
            >
              <Inject services={[AccumulationLegend, PieSeries, AccumulationTooltip, AccumulationDataLabel]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={matterStatusData}
                  xName='x'
                  yName='y'
                  innerRadius='0%'
                  dataLabel={{
                    visible: true,
                    name: 'text',
                    position: 'Inside',
                    font: {
                      fontWeight: '600',
                      color: '#ffffff'
                    }
                  }}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          </div>

          <div className="analytics-chart-container">
            <h2 className="chart-title">{t('analytics.mattersByType')}</h2>
            <ChartComponent
              id="mattersByType"
              primaryXAxis={{
                valueType: 'Category',
                majorGridLines: { width: 0 },
                labelStyle: { size: '12px' }
              }}
              primaryYAxis={{
                minimum: 0,
                maximum: 40,
                interval: 10,
                labelFormat: '{value}%',
                labelStyle: { size: '14px' }
              }}
              chartArea={{ border: { width: 0 } }}
              tooltip={{ enable: true }}
              palettes={palette}
              load={loadChart}
            >
              <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category]} />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={matterByTypeData}
                  xName='x'
                  yName='y'
                  name='Percentage'
                  type='Column'
                  cornerRadius={{
                    topLeft: 5,
                    topRight: 5
                  }}
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>
        </div> */}

        {/* Top Clients Grid */}


        {/* Charts Row 3 */}
        {/* <div className="analytics-charts-row">
          <div className="analytics-chart-container">
            <h2 className="chart-title">{t('analytics.monthlyTimeEntries')}</h2>
            <ChartComponent
              id="timeEntriesTrend"
              primaryXAxis={{
                valueType: 'DateTime',
                labelFormat: 'MMM',
                majorGridLines: { width: 0 },
                intervalType: 'Months',
                edgeLabelPlacement: 'Shift',
                labelStyle: { size: '14px' }
              }}
              primaryYAxis={{
                minimum: 800,
                maximum: 1600,
                interval: 200,
                title: 'Time Entries',
                labelStyle: { size: '14px' }
              }}
              chartArea={{ border: { width: 0 } }}
              tooltip={{ enable: true }}
              palettes={palette}
              load={loadChart}
              legendSettings={{ visible: false }}
            >
              <Inject services={[SplineAreaSeries, DateTime, Legend, Tooltip]} />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={monthlyTimeEntriesData}
                  xName='x'
                  yName='y'
                  name='Time Entries'
                  type='SplineArea'
                  opacity={0.6}
                  border={{ width: 3 }}
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>

          <div className="analytics-chart-container">
            <h2 className="chart-title">{t('analytics.lawyerProductivity')}</h2>
            <ChartComponent
              id="lawyerProductivity"
              primaryXAxis={{
                valueType: 'Category',
                majorGridLines: { width: 0 },
                labelStyle: { size: '14px' }
              }}
              primaryYAxis={{
                title: 'Hours',
                minimum: 0,
                maximum: 250,
                interval: 50,
                labelStyle: { size: '14px' }
              }}
              tooltip={{ enable: true, shared: true }}
              palettes={palette}
              load={loadChart}
            >
              <Inject services={[ColumnSeries, LineSeries, Legend, Tooltip, DataLabel, Category, Axis]} />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={userProductivityData}
                  xName='lawyer'
                  yName='hours'
                  name='Hours'
                  type='Column'
                  cornerRadius={{
                    topLeft: 5,
                    topRight: 5
                  }}
                />
                <SeriesDirective
                  dataSource={userProductivityData}
                  xName='lawyer'
                  yName='matters'
                  name='Matters'
                  type='Line'
                  width={3}
                  marker={{
                    visible: true,
                    width: 10,
                    height: 10,
                    shape: 'Pentagon'
                  }}
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>
        </div> */}
      </div>
    </Layout>
  );
};

export default Analytics;