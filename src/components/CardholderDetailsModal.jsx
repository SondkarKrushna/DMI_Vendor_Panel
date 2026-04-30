import React from "react";
import Modal from "./Model"; // ✅ Using the common Model.jsx (components/Model.jsx)
import {
  Briefcase,
  Tag,
  CreditCard,
  DollarSign,
  Info,
  User,
  Phone,
  Mail,
  Calendar,
  Hash,
  Layers,
  Receipt,
} from "lucide-react";

/* ─── Status badge helper ─────────────────────────── */
const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  const styles =
    s === "active"
      ? "bg-green-100 text-green-600"
      : s === "pending"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-red-100 text-red-600";
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles}`}
    >
      {status || "—"}
    </span>
  );
};

/* ─── Generic info row ────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value, color = "purple" }) => {
  const colorMap = {
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[color] || colorMap.purple}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SERVICE VIEW  (Services page → viewType: 'service')
   Expected fields: serviceName, serviceId, image, price,
                    discountRate, cardType, status, description
══════════════════════════════════════════════════ */
const ServiceView = ({ data }) => (
  <div className="flex flex-col gap-6">
    {/* Image + basic info */}
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3">
        <div className="aspect-video md:aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <img
            src={data.image}
            alt={data.serviceName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {data.serviceName}
            </h3>
            <p className="text-sm text-purple-600 font-medium mt-1">
              ID: {data.serviceId || "N/A"}
            </p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <DollarSign size={14} />
              <span className="text-xs font-semibold uppercase">Price</span>
            </div>
            <p className="text-lg font-bold text-gray-900">₹{data.price}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Tag size={14} />
              <span className="text-xs font-semibold uppercase">Discount</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {data.discountRate || data.discount || 0}%
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Details grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
      <InfoRow icon={CreditCard} label="Card Category" value={data.cardType} color="purple" />
      <InfoRow icon={Briefcase} label="Service Type" value="Premium Listing" color="blue" />
    </div>

    {/* Description */}
    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
      <div className="flex items-center gap-2 mb-2 text-purple-700">
        <Info size={16} />
        <h4 className="text-sm font-bold uppercase tracking-wide">Service Description</h4>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed italic">
        {data.description || "No description provided for this service."}
      </p>
    </div>

    <div className="flex justify-center pt-2">
      <button
        onClick={data._onClose}
        className="hidden"
      />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   ENROLLMENT VIEW  (Enrolling page → viewType: 'enrollment')
   Expected fields: id, name, contact, cardType,
                    cardNumber, date, status, enrollmentStatus
══════════════════════════════════════════════════ */
const EnrollmentView = ({ data }) => {
  const [mobile, email] = (data.contact || "").split("\n");
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-purple-50/40 rounded-2xl border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-black uppercase">
            {(data.name || "?").substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{data.name || "—"}</h3>
            <p className="text-xs text-purple-600 font-semibold mt-0.5">
              {data.id || "—"}
            </p>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoRow icon={Phone} label="Mobile" value={mobile} color="green" />
        <InfoRow icon={Mail} label="Email" value={email} color="blue" />
        <InfoRow icon={CreditCard} label="Card Type" value={data.cardType} color="purple" />
        <InfoRow icon={Hash} label="Card Number" value={data.cardNumber} color="amber" />
        <InfoRow icon={Calendar} label="Enrollment Date" value={data.date} color="rose" />
        <InfoRow icon={Layers} label="Payment Status" value={data.enrollmentStatus} color="green" />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   PUNCH / CARDHOLDER VIEW  (PunchManagement page → viewType: 'cardholder')
   Expected fields: name, chf, contact, service, date,
                    amount, discount
══════════════════════════════════════════════════ */
const PunchView = ({ data }) => {
  const [mobile, email] = (data.contact || "").split("\n");
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-amber-50/40 rounded-2xl border border-amber-100">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-black uppercase">
          {(data.name || "?").substring(0, 2)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{data.name || "—"}</h3>
          <p className="text-xs text-amber-600 font-semibold mt-0.5"> {data.chf || "—"}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoRow icon={Phone} label="Mobile" value={mobile} color="green" />
        <InfoRow icon={Mail} label="Email" value={email} color="blue" />
        <InfoRow icon={Briefcase} label="Service Used" value={data.service} color="purple" />
        <InfoRow icon={Calendar} label="Punch Date" value={data.date} color="rose" />
        <InfoRow icon={DollarSign} label="Amount Charged" value={data.amount} color="green" />
        <InfoRow icon={Tag} label="Discount Applied" value={data.discount} color="amber" />
      </div>

      {/* Summary Box */}
      <div className="bg-green-50/60 p-5 rounded-2xl border border-green-100">
        <div className="flex items-center gap-2 mb-3 text-green-700">
          <Receipt size={16} />
          <h4 className="text-sm font-bold uppercase tracking-wide">Punch Summary</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span className="font-semibold text-gray-800">{data.service || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-emerald-600">{data.amount || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Discount</span>
            <span className="font-semibold text-gray-800">{data.discount || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN UNIFIED MODAL COMPONENT
   Props expected from every page:
     isOpen   → bool
     onClose  → fn
     data     → row object with `viewType` field
   Pages may also pass `cardholder` prop (alias for `data`)
══════════════════════════════════════════════════ */
const CardholderDetailsModal = ({ isOpen, onClose, data, cardholder }) => {
  // Support both `data` and `cardholder` prop names
  const record = data || cardholder;

  if (!record) return null;

  const viewType = record.viewType || "service"; // default fallback

  const titleMap = {
    service: "Service Details",
    enrollment: "Enrollment Details",
    cardholder: "Punch Details",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleMap[viewType] || "Details"}
      className="max-w-2xl"
    >
      {/* Render the correct view based on viewType */}
      {viewType === "service" && <ServiceView data={record} />}
      {viewType === "enrollment" && <EnrollmentView data={record} />}
      {viewType === "cardholder" && <PunchView data={record} />}

      {/* Close button */}
      <div className="flex justify-center pt-2 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-8 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all active:scale-95"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default CardholderDetailsModal;