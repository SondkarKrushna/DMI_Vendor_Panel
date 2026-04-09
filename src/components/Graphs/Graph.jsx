import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const Graph = ({ 
  revenueData = [], 
  usageData = [], 
  selectedFilter = "yearly", 
  onFilterChange,
  filterOptions = ["weekly", "monthly", "yearly"] 
}) => {

  /**
   * SENIOR LOGIC: Configuration Object
   * Instead of messy IF/ELSE statements in the JSX, we define the 
   * behavior for each timeframe here.
   */
  const chartConfigs = {
    weekly: {
      dataKey: "label",
      formatter: (val) => val,
      xAxisLabel: "Day"
    },
    monthly: {
      dataKey: "label",
      formatter: (val) => val,
      xAxisLabel: "Date"
    },
    yearly: {
      dataKey: "label",
      formatter: (val) => val,
      xAxisLabel: "Month"
    }
  };

  const currentConfig = chartConfigs[selectedFilter] || chartConfigs.yearly;

  // Formatting Y-Axis for Revenue ($)
  const currencyFormatter = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Formatting Y-Axis for Usage (Numbers)
  const numberFormatter = (val) => 
    new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

  return (
    <div className="w-full p-6 bg-white rounded-3xl border border-gray-200 shadow-sm font-sans">
      
      {/* Header & Filter Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Business Analytics</h2>
          <p className="text-sm text-gray-500">Real-time performance tracking</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => onFilterChange(opt)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                selectedFilter === opt 
                ? "bg-white text-violet-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Chart */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {/* Displaying Grid Lines clearly */}
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0f0f0" />
                
                <XAxis 
                  dataKey={currentConfig.dataKey}
                  tickFormatter={currentConfig.formatter}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  minTickGap={5}
                />
                
                <YAxis 
                  tickFormatter={currencyFormatter}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [currencyFormatter(value), "Revenue"]}
                  labelFormatter={currentConfig.formatter}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Punch Usage</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0f0f0" />
                
                <XAxis 
                  dataKey={currentConfig.dataKey}
                  tickFormatter={currentConfig.formatter}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                
                <YAxis 
                  tickFormatter={numberFormatter}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelFormatter={currentConfig.formatter}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Graph;