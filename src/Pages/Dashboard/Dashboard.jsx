import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Graph from "../../components/Graphs/Graph";
import Card from "../../components/cards/Card";
// import Button from "../../components/buttons/Button";
import { Users, ArrowDownToLine, FileSpreadsheet, FileText, Percent, Tag, Clock } from "lucide-react"
import { toast } from "react-toastify";
import { useGetDashboardQuery } from "../../redux/api/dashboardApi"
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const Dashboard = () => {
  const graphOptions = ["weekly", "monthly", "yearly"];
  const [selectedGraphFilter, setSelectedGraphFilter] = useState("weekly");
  const [showExportOptions, setShowExportOptions] = useState(false);

  const {
    data: apiData,
    isFetching,
    refetch,
  } = useGetDashboardQuery({ graphFilter: selectedGraphFilter });

  // Extract API data with fallbacks
  const dashboardStats = useMemo(() => {
    if (!apiData?.data?.stats) return [];
    return apiData.data.stats;
  }, [apiData]);
  const ExpiredOffers = useMemo(() => {
    if (!apiData?.data?.offers.expiring) return [];
    return apiData.data.offers.expiring;
  }, [apiData]);
  const ActiveOffers = useMemo(() => {
    if (!apiData?.data?.offers.recent) return [];
    return apiData.data.offers.recent;
  }, [apiData]);

  const exportToExcel = () => {
    if (!dashboardStats.length) { toast.error("No dashboard data to export"); return; }
    const header = [["Metric", "Value", "Change", "Trend"]];
    const rows = dashboardStats.map((s) => [s.title, s.formatted || s.value, s.percent, s.trend]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "7E1080" } }, alignment: { horizontal: "center" } };
    }
    ws["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
    XLSX.writeFile(wb, "Dashboard_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!dashboardStats.length) { toast.error("No dashboard data to export"); return; }
    const doc = new jsPDF();
    doc.text("Dashboard Summary Report", 14, 10);
    autoTable(doc, {
      head: [["Metric", "Value", "Change", "Trend"]],
      body: dashboardStats.map((s) => [s.title, s.formatted || s.value, s.percent, s.trend]),
      startY: 20,
    });
    doc.save("dashboard_report.pdf");
  };

  const formatChartLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    if (selectedGraphFilter === "weekly") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    if (selectedGraphFilter === "monthly") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    if (selectedGraphFilter === "yearly") {
      return date.toLocaleDateString("en-US", { month: "short" });
    }

    return date.toLocaleDateString();
  };

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getInitials = (title) => {
    if (!title) return "O";
    return title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const revenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (selectedGraphFilter === "yearly") {
      const baseYearly = months.map(m => ({ label: m, value: 0 }));
      if (apiData?.data?.charts?.revenueOverview) {
        apiData.data.charts.revenueOverview.forEach(item => {
          const monthLabel = formatChartLabel(item.date);
          const target = baseYearly.find(b => b.label === monthLabel);
          if (target) target.value += item.revenue;
        });
      }
      return baseYearly;
    }

    if (selectedGraphFilter === "monthly") {
      const weeks = [
        { label: "Week 1", value: 0 },
        { label: "Week 2", value: 0 },
        { label: "Week 3", value: 0 },
        { label: "Week 4", value: 0 },
      ];
      if (apiData?.data?.charts?.revenueOverview) {
        apiData.data.charts.revenueOverview.forEach(item => {
          const day = new Date(item.date).getDate();
          if (day <= 7) weeks[0].value += item.revenue;
          else if (day <= 14) weeks[1].value += item.revenue;
          else if (day <= 21) weeks[2].value += item.revenue;
          else weeks[3].value += item.revenue;
        });
      }
      return weeks;
    }

    if (!apiData?.data?.charts?.revenueOverview) {
      return [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 }
      ];
    }

    return apiData.data.charts.revenueOverview.map((item) => ({
      label: formatChartLabel(item.date),
      value: item.revenue,
    }));
  }, [apiData, selectedGraphFilter]);

  const usageData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (selectedGraphFilter === "yearly") {
      const baseYearly = months.map(m => ({ label: m, value: 0 }));
      if (apiData?.data?.charts?.punchUsage) {
        apiData.data.charts.punchUsage.forEach(item => {
          const monthLabel = formatChartLabel(item.date);
          const target = baseYearly.find(b => b.label === monthLabel);
          if (target) target.value += item.punches;
        });
      }
      return baseYearly;
    }

    if (selectedGraphFilter === "monthly") {
      const weeks = [
        { label: "Week 1", value: 0 },
        { label: "Week 2", value: 0 },
        { label: "Week 3", value: 0 },
        { label: "Week 4", value: 0 },
      ];
      if (apiData?.data?.charts?.punchUsage) {
        apiData.data.charts.punchUsage.forEach(item => {
          const day = new Date(item.date).getDate();
          if (day <= 7) weeks[0].value += item.punches;
          else if (day <= 14) weeks[1].value += item.punches;
          else if (day <= 21) weeks[2].value += item.punches;
          else weeks[3].value += item.punches;
        });
      }
      return weeks;
    }

    if (!apiData?.data?.charts?.punchUsage) {
      return [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 }
      ];
    }

    return apiData.data.charts.punchUsage.map((item) => ({
      label: formatChartLabel(item.date),
      value: item.punches,
    }));
  }, [apiData, selectedGraphFilter]);

  return (
    <Layout title="Dashboard">
      <div className="p-1 md:p-2 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Hello !! Tech Spark Technologies</h1>
            <p className="text-sm text-gray-500">Here's what's happening with your business today</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(prev => !prev)}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold flex items-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
                Export
              </button>
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => { exportToExcel(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => { exportToPDF(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <FileText size={16} className="text-red-500" />
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {
            dashboardStats.map((stat, index) => (
              <Card
                key={index}
                title={stat.title || ""}
                amount={stat.formatted || stat.value.toString()}
                percentage={parseFloat(stat.percent) || 0}
                statusText={stat.subText || `${stat.trend} from yesterday`}
                isDecrease={stat.trend === 'down'}
                icon={Users}
              />
            ))
          }
        </div>

        {/* Graph Section */}
        <div className="mb-6">
          <Graph
            revenueData={revenueData}
            usageData={usageData}
            filterOptions={graphOptions}
            selectedFilter={selectedGraphFilter}
            onFilterChange={setSelectedGraphFilter}
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Expiring Offers */}
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Expires Offers
            </h2>

            <div className="space-y-4">
              {ExpiredOffers.length > 0 ? ExpiredOffers.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-[#FFFCF0] border border-[#FEF3C7] rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FBBF24] rounded-xl flex items-center justify-center text-white">
                      <Percent size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">Expires in {item.daysLeft || 0} Days</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-white border border-[#FBBF24] text-[#FBBF24] text-xs font-bold rounded-xl shadow-sm">
                    Expiring Soon
                  </span>
                </div>
              )) : (
                <div className="py-10 text-center text-gray-400">
                  <Tag className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No offers expiring soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Offers */}
          <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Recent Offers
            </h2>

            <div className="space-y-4">
              {ActiveOffers.length > 0 ? ActiveOffers.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {getInitials(item.title)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">Special Offer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      {item.discount}%
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                      <Clock size={10} />
                      {getRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-gray-400">
                  <Clock className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No recent offers found</p>
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