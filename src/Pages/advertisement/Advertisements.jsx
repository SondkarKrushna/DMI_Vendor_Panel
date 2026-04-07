import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Search from "../../components/search/Search";
import Button from "../../components/buttons/Button";
import advertisement from "../../../public/images/advertisement.png";

import {
  Megaphone,
  CheckCircle,
  XCircle,
  Clock,
  SquarePen,
  Trash2,
  ArrowDownToLine,
} from "lucide-react";

const Advertisements = () => {
  const [activeTab, setActiveTab] = useState("Classified");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = ["Classified", "Commercial"];

  const ads = new Array(6).fill(0); // dummy data

  return (
    <Layout>
      <div className="p-1 sm:p-2 space-y-5 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Advertisements</h1>
            <p className="text-sm text-gray-500">Manage Classified And Commercial Ads</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button text="Add Ad" className="flex-1 sm:flex-none" onClick={() => setIsModalOpen(true)} />
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Top Cards (4 column grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="Total Ads"
            amount="7"
            percentage={42}
            statusText="Increased by last month"
            icon={Megaphone}
          />
          <Card
            title="Active Ads"
            amount="5"
            percentage={-30}
            statusText="Decreased by last month"
            isDecrease
            icon={CheckCircle}
          />
          <Card
            title="Expired Ads"
            amount="400"
            percentage={42}
            statusText="Increased by last month"
            icon={XCircle}
          />
          {/* <Card
            title="Pending Ads"
            amount="12"
            percentage={15}
            statusText="Increased by last month"
            icon={Clock}
          /> */}
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <Search />

        {/* Advertisement Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ads.map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-3"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={advertisement}
                  alt="ad"
                  className="w-full h-32 object-cover rounded-xl"
                />

                {/* Status Badge */}
                <span
                  className={`absolute top-2 right-2 text-xs px-3 py-1 rounded-full text-white ${
                    index % 3 === 0
                      ? "bg-yellow-400 text-black"
                      : index % 3 === 1
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                >
                  {index % 3 === 0
                    ? "Pending"
                    : index % 3 === 1
                    ? "Rejected"
                    : "Approved"}
                </span>
              </div>

              {/* Content */}
              <div className="mt-3">
                <h3 className="text-sm font-semibold">Free IT Courses</h3>
                <p className="text-xs text-gray-500">IT Company</p>
                <p className="text-xs text-gray-400 mt-1">
                  Valid Till 20 Feb 2026
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-3">
                <button className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <SquarePen size={14} />
                </button>
                <button className="p-2 rounded-lg bg-red-100 text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
      {isModalOpen && (
  <div
    onClick={() => setIsModalOpen(false)}  // ✅ correct state + close on outside click
    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur"
  >

    <div
      onClick={(e) => e.stopPropagation()} // ✅ prevent closing when clicking inside
      className="bg-white w-[400px] rounded-2xl p-6 shadow-xl relative"
    >

      <h2 className="text-lg font-semibold mb-4">
        Add Advertisement
      </h2>

      <div className="space-y-4">

        {/* Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-black">
              Advertisement Type
            </label>
            <input
              placeholder="Select"
              className="px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-black">
              Business Vertical
            </label>
            <input
              placeholder="Select"
              className="px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm"
            />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-black">Title</label>
          <input
            placeholder="Enter"
            className="w-full px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm"
          />
        </div>

        {/* Valid Till */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-black">Valid Till</label>
          <input
            type="date"
            placeholder="Enter"
            className="w-full px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm"
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-black">Image</label>
          <input
            type="file"
            className="w-full px-4 py-3 rounded-xl bg-gray-100 outline-none text-sm"
          />
        </div>

        {/* Button */}
        <div className="flex justify-center pt-4">
          <button className="px-10 py-3 rounded-xl bg-gradient-to-b from-[#7E1080] to-[#1A031A] text-white font-semibold">
            + Add Ad
          </button>
        </div>

      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default Advertisements;