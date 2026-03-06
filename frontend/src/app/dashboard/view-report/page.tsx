"use client";
import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';

const sampleData = [
  { name: "Jan", personnel: 120, courses: 8, leave: 15, attendance: 95, performance: 85 },
  { name: "Feb", personnel: 135, courses: 10, leave: 12, attendance: 92, performance: 88 },
  { name: "Mar", personnel: 110, courses: 7, leave: 18, attendance: 89, performance: 82 },
  { name: "Apr", personnel: 145, courses: 12, leave: 10, attendance: 96, performance: 90 },
  { name: "May", personnel: 125, courses: 9, leave: 14, attendance: 93, performance: 87 },
  { name: "Jun", personnel: 140, courses: 11, leave: 9, attendance: 94, performance: 89 },
];

const pieData = [
  { name: "Active Personnel", value: 1156, color: "#2563eb" },
  { name: "On Leave", value: 89, color: "#f59e0b" },
  { name: "Training", value: 67, color: "#10b981" },
  { name: "Deployed", value: 234, color: "#ef4444" },
];

const coursePerformanceData = [
  { name: "Excellent (AA)", value: 35, color: "#10b981" },
  { name: "Good (A)", value: 45, color: "#3b82f6" },
  { name: "Average (B)", value: 15, color: "#f59e0b" },
  { name: "Below Average (C)", value: 5, color: "#ef4444" },
];

const leaveTypeData = [
  { name: "Annual Leave", value: 45, color: "#10b981" },
  { name: "Medical Leave", value: 23, color: "#ef4444" },
  { name: "Training Leave", value: 18, color: "#3b82f6" },
  { name: "Emergency Leave", value: 12, color: "#f59e0b" },
  { name: "Other", value: 8, color: "#8b5cf6" },
];

const chartTypes = [
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "line", label: "Line Chart", icon: TrendingUp },
  { value: "pie", label: "Pie Chart", icon: PieChartIcon },
  { value: "area", label: "Area Chart", icon: AreaChartIcon },
];

const dataFields = [
  { value: "personnel", label: "Personnel Count" },
  { value: "courses", label: "Courses" },
  { value: "leave", label: "Leave Requests" },
  { value: "attendance", label: "Attendance %" },
  { value: "performance", label: "Performance %" },
];

const dateRanges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

interface CustomChart {
  id: string;
  type: string;
  title: string;
  dataField: string;
  dateRange: string;
  data: any[];
}

export default function ViewReportPage() {
  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([]);
  const [newChart, setNewChart] = useState({
    type: "bar",
    title: "",
    dataField: "personnel",
    dateRange: "30d",
  });

  const handleAddChart = () => {
    if (!newChart.title.trim()) return;

    const chartData = sampleData.map(item => ({
      name: item.name,
      [newChart.dataField]: item[newChart.dataField as keyof typeof item]
    }));

    const customChart: CustomChart = {
      id: Date.now().toString(),
      type: newChart.type,
      title: newChart.title,
      dataField: newChart.dataField,
      dateRange: newChart.dateRange,
      data: chartData,
    };

    setCustomCharts([...customCharts, customChart]);
    setNewChart({
      type: "bar",
      title: "",
      dataField: "personnel",
      dateRange: "30d",
    });
    setShowAddChartModal(false);
  };

  const removeCustomChart = (id: string) => {
    setCustomCharts(customCharts.filter(chart => chart.id !== id));
  };

  const renderChart = (chart: CustomChart) => {
    const { type, title, data, dataField } = chart;
    const colors = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
              <Bar dataKey={dataField} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
              <Line type="monotone" dataKey={dataField} stroke={colors[0]} strokeWidth={3} dot={{ fill: colors[0], strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
              <Area type="monotone" dataKey={dataField} stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-gray-400">Chart type not supported</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto p-4 lg:p-6">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">View Reports</h1>
          <p className="text-gray-300 text-base lg:text-lg">Analyze key metrics and generate custom reports for your organization.</p>
        </div>
        
        {/* Filters */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-lg">
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <label className="text-gray-400 text-sm">Report Type</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white/10 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Personnel</option>
                <option>Courses</option>
                <option>Leave</option>
                <option>Attendance</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <label className="text-gray-400 text-sm">Date Range</label>
            <input type="date" className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button 
            onClick={() => setShowAddChartModal(true)}
            className="mt-4 lg:mt-6 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
          >
            + Add New Chart
          </button>
        </div>

        {/* Custom Charts */}
        {customCharts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Custom Charts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customCharts.map((chart) => (
                <div key={chart.id} className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-lg relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{chart.title}</h3>
                    <button
                      onClick={() => removeCustomChart(chart.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Remove Chart"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="w-full h-64">
                    {renderChart(chart)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Monthly Trends</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampleData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Bar dataKey="personnel" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="courses" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leave" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Performance & Attendance</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="performance" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Personnel Distribution */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Personnel Distribution</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area Chart */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Leave Trends</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampleData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                  <Area type="monotone" dataKey="leave" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Performance Pie Chart */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Course Performance Distribution</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coursePerformanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {coursePerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Type Distribution */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Leave Type Distribution</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leaveTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Detailed Report Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-400">
              <thead className="bg-white/10 text-gray-300">
                <tr>
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Personnel</th>
                  <th className="px-4 py-2">Courses</th>
                  <th className="px-4 py-2">Leave</th>
                  <th className="px-4 py-2">Attendance %</th>
                  <th className="px-4 py-2">Performance %</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, idx) => (
                  <tr key={row.name} className={idx % 2 === 0 ? "bg-white/5" : ""}>
                    <td className="px-4 py-2 font-medium text-white">{row.name}</td>
                    <td className="px-4 py-2">{row.personnel}</td>
                    <td className="px-4 py-2">{row.courses}</td>
                    <td className="px-4 py-2">{row.leave}</td>
                    <td className="px-4 py-2">{row.attendance}%</td>
                    <td className="px-4 py-2">{row.performance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Chart Modal */}
        {showAddChartModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Add New Chart</h3>
                <button
                  onClick={() => setShowAddChartModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Chart Title */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Chart Title</label>
                  <input
                    type="text"
                    value={newChart.title}
                    onChange={(e) => setNewChart({ ...newChart, title: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter chart title"
                  />
                </div>

                {/* Chart Type */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Chart Type</label>
                  <select
                    value={newChart.type}
                    onChange={(e) => setNewChart({ ...newChart, type: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {chartTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data Field */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Data Field</label>
                  <div className="relative">
                    <select
                      value={newChart.dataField}
                      onChange={(e) => setNewChart({ ...newChart, dataField: e.target.value })}
                      className="w-full appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {dataFields.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Date Range</label>
                  <div className="relative">
                    <select
                      value={newChart.dateRange}
                      onChange={(e) => setNewChart({ ...newChart, dateRange: e.target.value })}
                      className="w-full appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {dateRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddChartModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddChart}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Add Chart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 