import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/buttons/Button";
import cardDesign from "../../../public/images/card-design.png";
import logo from "../../../public/logo.png";
import { Search as SearchIcon } from "lucide-react";
import DMIPremiumCard from '../../components/DMIPremiumCard'
const CardHolder = () => {
  const [activeTab, setActiveTab] = useState("Punch");

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Cardholder Punch</h1>
            <p className="text-sm text-gray-500">Process Service Punches For Cardholders</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#f5c518] hover:bg-[#d4a017] text-black font-semibold shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2">
              <span className="text-xl leading-none">⇊</span> Export
            </button>
          </div>
        </div>

        {/* Search & Card Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">

          {/* Search Cardholder */}
          <div className="lg:w-3/5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Search Cardholder
            </h2>

            <div className="flex flex-col sm:flex-row items-end gap-4 mb-6">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  CHF Number
                </label>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="flex items-center justify-center py-3 text-gray-400 font-bold px-2">
                OR
              </div>

              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            <div className="mt-auto">
              <button className="w-full bg-[#581c56] hover:bg-[#4a1848] text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all shadow-md">
                <SearchIcon size={20} />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Card Preview */}

          <DMIPremiumCard cardNumber={"4545 1456 6766 7871"} />
        </div>

        {/* Punch Details Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Punch Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Select Service
              </label>
              <select className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
                <option>Select</option>
                <option>Web Development</option>
                <option>Design</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Date
              </label>
              <input
                type="date"
                defaultValue="2026-02-01"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Bill Amount
              </label>
              <input
                type="text"
                placeholder="Enter"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Discount
              </label>
              <input
                type="text"
                placeholder="E.g 10%"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>

          {/* Punch Summary */}
          <div className="bg-[#FFFDF4] rounded-2xl p-6 border border-[#FEF3C7] mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">
              Punch Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">Web Developement</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bill Amount</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold">0%</span>
              </div>
              <div className="pt-3 border-t border-[#FEF3C7] flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-gray-800">
                  Final Amount
                </span>
                <span className="text-2xl font-bold text-green-600">
                  $0.00
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="bg-[#581c56] hover:bg-[#4a1848] text-white px-10 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95">
              Process Punch
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardHolder;
