import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/cards/Card";
import Button from "../../components/buttons/Button";
import { Tag, SquarePen, Trash2, ArrowDownToLine } from "lucide-react";
import offer from "../../../public/images/offer.png";

const Offers = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <Layout>
      <div className="p-1 md:p-2 bg-white min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Offers Management</h1>
            <p className="text-sm text-gray-500">Manage All Offers From Here</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              text="Add Offer"
              className="flex-1 sm:flex-none"
              onClick={() => setIsModalOpen(true)}
            />
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

          <Card
            title="Total Offers"
            amount="2100"
            percentage={42}
            statusText="Increased by Yesterday"
            icon={Tag}
          />

          <Card
            title="Pending Offers"
            amount="20"
            percentage={30}
            statusText="Decreased by Yesterday"
            isDecrease={true}
            icon={Tag}
          />

          <Card
            title="Active Offers"
            amount="04"
            percentage={42}
            statusText="Increased by Last Month"
            icon={Tag}
          />

          <Card
            title="Expired Offers"
            amount="12"
            percentage={42}
            statusText="Increased by Last Month"
            icon={Tag}
          />
        </div>


        {/* Tabs */}
        <div className="flex gap-2 mt-6 flex-wrap">
          {["Active", "Pending", "Expired"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 rounded-lg transition 
                  ${activeTab === tab
                  ? "bg-yellow-400 text-black font-semibold"
                  : "bg-gray-200 text-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Offer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">

          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow overflow-hidden"
            >
              {/* Image */}
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={offer}
                  alt="Offer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-md">
                  20% Off On Development Courses
                </h3>

                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>
                    Discount: <span className="font-medium">10%</span>
                  </p>
                  <p>
                    Valid Till:{" "}
                    <span className="font-medium">
                      Feb 15, 2025
                    </span>
                  </p>
                  <p>
                    Terms:{" "}
                    <span className="font-medium">
                      Min Billing ₹1000
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between mt-4">
                  <button className="border bg-[#FFEAFF] border-[#7E1080] text-[#7E1080] px-3 py-1 rounded-lg text-sm w-full sm:w-auto flex items-center justify-center gap-2">
                    <SquarePen size={16} />{" | "}
                    Edit Offer Details
                  </button>

                  <button className="border bg-[#FFEAFF] border-[#7E1080] px-3 py-1 rounded-lg text-sm w-full sm:w-auto flex items-center justify-center">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Model */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-[90]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-[400px] rounded-2xl p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Add offer</h2>

            <div className="space-y-4">

              {/* Image Upload */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Offer Title
                </label>
                <input
                  type="text"
                  placeholder="e.g 20% off on dev courses"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Discount + Date */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-sm text-black mb-1">
                    Discount
                  </label>
                  <input
                    type="number"
                    placeholder="e.g 10%"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-sm text-black mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  placeholder="Enter terms & conditions"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Button */}
            <div className="mt-6 flex justify-center">
              <button className="px-6 py-2 rounded-xl bg-gradient-to-b from-[#7E1080] to-[#1A031A] text-white">
                + Add Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Offers;