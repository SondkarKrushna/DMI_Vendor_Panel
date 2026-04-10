import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Graph from "../../components/Graphs/Graph";
import Card from "../../components/cards/Card";
// import Button from "../../components/buttons/Button";
import { Users, ArrowDownToLine, FileSpreadsheet, FileText } from "lucide-react"
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
      return date.toLocaleDateString("en-US", { day: "numeric" });
    }

    if (selectedGraphFilter === "yearly") {
      return date.toLocaleDateString("en-US", { month: "short" });
    }

    return date.toLocaleDateString();
  };

  const revenueData = useMemo(() => {
    if (!apiData?.data?.charts?.revenueOverview) {
      return [
        { month: "Jan", value: 15000 },
        { month: "Feb", value: 22000 },
        { month: "Mar", value: 18000 },
        { month: "Apr", value: 26000 },
        { month: "May", value: 31000 },
        { month: "Jun", value: 28000 },
        { month: "Jul", value: 34000 },
        { month: "Aug", value: 30000 },
        { month: "Sep", value: 38000 },
        { month: "Oct", value: 42000 },
        { month: "Nov", value: 39000 },
        { month: "Dec", value: 45000 },
      ];
    }
    return apiData.data.charts.revenueOverview.map((item) => ({
      label: formatChartLabel(item.date),
      value: item.revenue,
    }));
  }, [apiData, selectedGraphFilter]);

  const usageData = useMemo(() => {
    if (!apiData?.data?.charts?.punchUsage) {
      return [
        { month: "Jan", value: 3000 },
        { month: "Feb", value: 3800 },
        { month: "Mar", value: 4200 },
        { month: "Apr", value: 3900 },
        { month: "May", value: 4600 },
        { month: "Jun", value: 5200 },
        { month: "Jul", value: 4800 },
        { month: "Aug", value: 5500 },
        { month: "Sep", value: 6100 },
        { month: "Oct", value: 5800 },
        { month: "Nov", value: 6400 },
        { month: "Dec", value: 7000 },
      ];
    }
    return apiData.data.charts.punchUsage.map((item) => ({
      label: formatChartLabel(item.date),
      value: item.punches,
    }));
  }, [apiData, selectedGraphFilter]);

  return (
    <Layout>
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
          <div className="bg-white p-5 border border-gray-300 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Expires Offers
            </h2>

            {ExpiredOffers.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-yellow-50 p-4 rounded-xl mb-3"
              >
                <div>
                  <p className="font-medium">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires in {item.daysLeft} Days
                  </p>
                </div>

                <span className="px-3 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">
                  Expiring Soon
                </span>
              </div>
            ))}
          </div>

          {/* Recent Offers */}
          <div className="bg-white p-5 border border-gray-300 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Recent Offers
            </h2>

            <div className="space-y-3">
              {ActiveOffers.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl"
                >
                  {/* Left */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 text-white flex items-center justify-center rounded-full font-bold text-sm">
                      {item.initials}
                    </div>

                    <div>
                      <p className="font-medium text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.offer}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">
                      {item.discount}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;