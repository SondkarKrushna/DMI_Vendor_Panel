import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { Loader2, ShieldCheck, CreditCard, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useCreatePunchMutation, useVerifyPaymentMutation } from "../../redux/api/punchApi";

// ── Load Razorpay script ──────────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Payload passed from CardHolder via navigate state
  const { punchPayload, cardData, serviceName, finalAmount } =
    location.state || {};

  const [status, setStatus] = useState("idle"); // idle | processing | success | failed
  const [createPunch] = useCreatePunchMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  // If navigated without state, send back
  useEffect(() => {
    if (!punchPayload) {
      toast.error("No payment data found. Redirecting back.");
      navigate("/card-holder");
    }
  }, [punchPayload, navigate]);

  const handlePay = async () => {
    setStatus("processing");

    // ── Step 1: Create order on backend ─────────────────────────────
    let orderData;
    try {
      orderData = await createPunch(punchPayload).unwrap();
      console.log("Backend response:", orderData);
    } catch (err) {
      console.error("Create punch error:", err);
      setStatus("failed");
      return toast.error(err?.data?.message || "Failed to create payment order");
    }

    const rInfo = orderData?.data || orderData;
    console.log("Order info (rInfo):", rInfo);

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setStatus("failed");
      return toast.error("Payment configuration error. Please contact support.");
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setStatus("failed");
      return toast.error("Failed to load Razorpay. Check internet connection.");
    }

    // Validate amount
    if (!rInfo.amount || rInfo.amount <= 0) {
      setStatus("failed");
      return toast.error("Invalid payment amount. Please try again.");
    }

    const options = {
      key: razorpayKey,
      amount: rInfo.amount,
      currency: rInfo.currency || "INR",
      name: "DMI Vendor Panel",
      description: serviceName || "Service Punch",
      // Only include order_id if it exists (for signature verification)
      ...(rInfo.razorpay_order_id && { order_id: rInfo.razorpay_order_id }),
      prefill: {
        name: cardData?.userId?.fullName || cardData?.fullName || "",
        email: cardData?.userId?.email || cardData?.email || "",
        contact: cardData?.userId?.mobile || cardData?.mobile || "",
      },
      theme: { color: "#7E1080" },

      // ── Payment Success Handler ────────────────────────────────────
      handler: async (response) => {
        console.log("Razorpay success response:", response);

        // Validate required response fields
        if (!response.razorpay_payment_id) {
          setStatus("failed");
          return toast.error("Payment verification failed: Missing payment ID");
        }

        // Extract invoiceId from the createPunch response
        const orderInfo = orderData?.data || orderData;
        const invoiceId = orderInfo?.invoiceId || orderInfo?._id || orderInfo?.id;

        if (!invoiceId) {
          setStatus("failed");
          return toast.error("Payment verification failed: Missing invoice ID");
        }

        try {
          // Send verification request
          const verifyData = {
            razorpay_payment_id: response.razorpay_payment_id,
            invoiceId: invoiceId,
            // Include these only if they exist
            ...(response.razorpay_order_id && { razorpay_order_id: response.razorpay_order_id }),
            ...(response.razorpay_signature && { razorpay_signature: response.razorpay_signature }),
          };

          console.log("Verification data:", verifyData);

          await verifyPayment(verifyData).unwrap();

          setStatus("success");
          toast.success("✅ Payment verified! Punch processed successfully.");
        } catch (err) {
          console.error("Verification error:", err);
          setStatus("failed");
          toast.error(err?.data?.message || "Payment verification failed");
        }
      },

      modal: {
        ondismiss: () => {
          setStatus("idle");
          toast.info("Payment cancelled");
        },
      },
    };

    console.log("Razorpay options:", options);

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response);
        setStatus("failed");
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      setStatus("failed");
      toast.error("Failed to initialize payment gateway");
    }
  };

  if (!punchPayload) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-xl">

          {/* Back Button */}
          {status !== "success" && (
            <button
              onClick={() => navigate("/card-holder")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Cardholder
            </button>
          )}

          {/* ── SUCCESS STATE ─────────────────────────────────────── */}
          {status === "success" && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={44} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
              <p className="text-gray-500 mb-2">The punch has been recorded.</p>
              <p className="text-sm text-gray-400 mb-8">
                Cardholder: <span className="font-semibold text-gray-700">{punchPayload.fullName}</span>
              </p>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-8 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold">{serviceName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-green-600">₹{Number(finalAmount || punchPayload.finalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/card-holder")}
                className="w-full bg-[#7E1080] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a1848] transition-all shadow-md"
              >
                Back to Cardholder Punch
              </button>
            </div>
          )}

          {/* ── FAILED STATE ──────────────────────────────────────── */}
          {status === "failed" && (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={44} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
              <p className="text-gray-500 mb-8">Something went wrong. Please try again.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/card-holder")}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setStatus("idle"); }}
                  className="flex-1 bg-[#7E1080] text-white py-3 rounded-2xl font-bold hover:bg-[#4a1848] transition-all shadow-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* ── IDLE / PROCESSING STATE ───────────────────────────── */}
          {(status === "idle" || status === "processing") && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

              {/* Header */}
              <div className="bg-linear-to-r from-[#7E1080] to-[#1A031A] p-6 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <CreditCard size={22} />
                  <h1 className="text-xl font-bold">Confirm & Pay</h1>
                </div>
                <p className="text-white/70 text-sm">Review your order before proceeding to payment</p>
              </div>

              <div className="p-6 space-y-6">

                {/* Cardholder Info */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cardholder Details</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Name</span>
                    <span className="font-semibold text-gray-800">{punchPayload.fullName || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CHF No</span>
                    <span className="font-semibold text-gray-800">{punchPayload.chfNo || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Card Type</span>
                    <span className="font-semibold text-gray-800">{punchPayload.cardType || "—"}</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service</span>
                    <span className="font-semibold">{serviceName || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bill Amount</span>
                    <span className="font-semibold">₹{Number(punchPayload.billAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-orange-600">-{punchPayload.discount || 0}%</span>
                  </div>
                  <div className="pt-3 border-t border-amber-200 flex justify-between items-center">
                    <span className="font-bold text-gray-800">Total Payable</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{Number(punchPayload.finalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                  <ShieldCheck size={14} className="text-green-500" />
                  Secured by Razorpay — 256-bit SSL encryption
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePay}
                  disabled={status === "processing"}
                  className="w-full bg-[#7E1080] hover:bg-[#4a1848] text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-purple-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "processing" ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Opening Payment Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pay ₹{Number(finalAmount || punchPayload.finalAmount || 0).toFixed(2)} via Razorpay
                    </>
                  )}
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default PaymentCheckout;
