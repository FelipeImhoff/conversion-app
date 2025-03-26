import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ConversionData } from '../types';
import { api } from '../api';
import clsx from 'clsx';

const ORIGINS = ['email', 'wpp', 'MOBILE'] as const;
type Origin = typeof ORIGINS[number];

const STATUSES = [1, 2, 3, 4, 5, 6] as const;
type Status = typeof STATUSES[number];

interface CombinedData {
  origin: string;
  percentage: string;
  count: number;
}

export default function ConversionChart() {
  const [selectedOrigin, setSelectedOrigin] = useState<Origin>('email');
  const [selectedStatus, setSelectedStatus] = useState<Status>(4);
  const [data, setData] = useState<ConversionData | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCombinedLoading, setIsCombinedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [combinedError, setCombinedError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<ConversionData>(`/conversion-rate?origin=${selectedOrigin}`);
        setData(response.data);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    ORIGINS.forEach(origin => {
      if (origin !== selectedOrigin) {
        api.get(`/conversion-rate?origin=${origin}`).catch(console.error);
      }
    });
  }, [selectedOrigin]);

  useEffect(() => {
    async function loadCombinedData() {
      try {
        setIsCombinedLoading(true);
        setCombinedError(null);
        
        const results = await Promise.all(
          ORIGINS.map(async (origin) => {
            const response = await api.get<ConversionData>(`/conversion-rate?origin=${origin}`);
            const data = response.data;
            const statusData = data.conversionRates.find(rate => rate.status === selectedStatus);
            return {
              origin,
              percentage: statusData?.percentage || "0",
              count: statusData?.count || 0
            };
          })
        );
        
        setCombinedData(results);
      } catch (err) {
        setCombinedError('Failed to load combined data');
        console.error(err);
      } finally {
        setIsCombinedLoading(false);
      }
    }

    loadCombinedData();
  }, [selectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversion Rates</h1>
        <div className="flex flex-wrap gap-2">
          {ORIGINS.map((origin) => (
            <button
              key={origin}
              onClick={() => setSelectedOrigin(origin)}
              className={clsx(
                'px-3 py-2 text-sm sm:text-base rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                selectedOrigin === origin
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {origin.charAt(0).toUpperCase() + origin.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-4 sm:p-6">
          <div className="relative h-[300px] sm:h-[400px] w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center text-red-600 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium">{error}</span>
                  <button
                    onClick={() => setSelectedOrigin(selectedOrigin)}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.conversionRates}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="status"
                    label={{ value: 'Status', position: 'bottom', offset: 20 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    label={{
                      value: 'Percentage',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10
                    }}
                  />
                  <Tooltip
                    formatter={(value: string) => [`${value}%`, 'Percentage']}
                    labelFormatter={(label) => `Status ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.96)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey={(data) => parseFloat(data.percentage)}
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    name="Percentage"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {data && (
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-gray-600">
              <div className="text-sm sm:text-base">
                Total conversions: <span className="font-medium">{data.total.toLocaleString()}</span>
              </div>
              <div className="text-sm sm:text-base">
                Source: <span className="font-medium capitalize">{data.origin}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Combined Chart Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Combined Status Comparison</h2>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={clsx(
                    'px-3 py-2 text-sm sm:text-base rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    selectedStatus === status
                      ? 'bg-green-600 text-white shadow-sm hover:bg-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Status {status}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[300px] sm:h-[400px] w-full">
            {isCombinedLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
              </div>
            )}

            {combinedError && (
              <div className="absolute inset-0 flex items-center justify-center text-red-600 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium">{combinedError}</span>
                  <button
                    onClick={() => setSelectedStatus(selectedStatus)}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={combinedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="origin"
                  label={{ value: 'Origin', position: 'bottom', offset: 20 }}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  label={{
                    value: 'Percentage',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10
                  }}
                />
                <Tooltip
                  formatter={(value: string) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey={(data) => parseFloat(data.percentage)}
                  fill="#22C55E"
                  radius={[4, 4, 0, 0]}
                  name="Percentage"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-sm sm:text-base text-gray-600">
            Showing Status {selectedStatus} comparison across all origins
          </div>
        </div>
      </div>
    </div>
  );
}