import React from "react";
import Modal from "./Model";
import { MdRemoveRedEye } from "react-icons/md";

const CardholderDetailsModal = ({ isOpen, onClose, cardholder, viewType }) => {
  if (!cardholder) return null;

  const type = viewType || (cardholder.serviceName || cardholder.price != null || cardholder.amount != null || cardholder.discount != null || cardholder.discountRate != null ? "service" : cardholder.referrals != null || cardholder.code != null || cardholder.points != null ? "referral" : "cardholder");
  const isService = type === "service";
  const isReferral = type === "referral";

  const title = isService ? "Service Details" : isReferral ? "Referral Details" : "Cardholder Details";
  const displayName = cardholder.name || cardholder.fullName || cardholder.serviceName || "—";
  const idValue = cardholder.serviceId || cardholder.id || cardholder.cardNumber || cardholder._id || cardholder.user || "—";

  const contactParts = !isService && !isReferral && cardholder.contact ? cardholder.contact.split("\n") : [];
  const mobile = !isService && !isReferral ? contactParts[0] || cardholder.mobile || "—" : cardholder.mobile || "—";
  const email = !isService && !isReferral ? contactParts[1] || cardholder.email || "—" : cardholder.email || "—";
  const status = cardholder.status || "Active";

  const servicePrice = cardholder.price != null ? cardholder.price : cardholder.amount != null ? cardholder.amount : cardholder.mobile;
  const serviceDiscount = cardholder.discount != null ? `${cardholder.discount}%` : cardholder.discountRate != null ? `${cardholder.discountRate}%` : typeof cardholder.email === "string" && cardholder.email.startsWith("Discount") ? cardholder.email : "—";

  const details = isService
    ? [
        { label: "Price", value: servicePrice != null ? (typeof servicePrice === "number" ? `₹${servicePrice.toLocaleString("en-IN")}` : servicePrice) : "—" },
        { label: "Discount", value: serviceDiscount },
        { label: "Type", value: cardholder.cardType || "—" },
        { label: "Status", value: status },
      ]
    : isReferral
    ? [
        { label: "Total Referrals", value: cardholder.referrals || "—" },
        { label: "Points Earned", value: cardholder.points || "—" },
        { label: "Referral Code", value: cardholder.code || "—" },
        { label: "User", value: cardholder.user || "—" },
      ]
    : [
        { label: "Mobile", value: mobile },
        { label: "CHF #", value: cardholder.cardNumber || cardholder.chf || cardholder.chfNo || "—" },
        { label: "Email", value: email },
        { label: "Status", value: status },
      ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-xl w-full">
      <div className="flex flex-col gap-6 p-2">
        {/* Header with Avatar */}
        <div className="flex items-center gap-4 border-b pb-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#7E1080] flex items-center justify-center font-bold text-xl uppercase border border-purple-100">
            {isReferral ? (displayName?.charAt(0) || "R") : (displayName?.substring(0, 2) || "CH")}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-purple-100 text-[#7E1080] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {isReferral ? "Referral" : (cardholder.cardType || (isService ? "Service" : "—"))}
              </span>
              <span className="text-xs text-gray-400">
                {isReferral ? `User: ${idValue}` : (isService ? `Service ID: ${idValue}` : `ID: ${idValue}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {details.map((item) => (
            <div key={item.label} className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{item.label}</p>
              <p className="font-bold text-gray-800 truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* KYC Documents */}
        {!isReferral && (
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4">KYC Documents</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#7E1080] transition-all bg-white group cursor-pointer shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MdRemoveRedEye size={20} />
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-[#7E1080]">Aadhar Card</span>
              </div>
              <div className="border rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#7E1080] transition-all bg-white group cursor-pointer shadow-sm">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MdRemoveRedEye size={20} />
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-[#7E1080]">PAN Card</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CardholderDetailsModal;
