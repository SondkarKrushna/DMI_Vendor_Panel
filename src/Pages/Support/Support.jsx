import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Search,
  User,
  CreditCard,
  Settings,
  History,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const Support = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    {
      title: "Account & Profile",
      desc: "Manage your account, password, and security settings.",
      icon: <User className="text-purple-600" size={24} />,
      id: "account"
    },
    {
      title: "Payments & Invoices",
      desc: "Track payments, download invoices, and manage billing.",
      icon: <CreditCard className="text-blue-600" size={24} />,
      id: "payments"
    },
    {
      title: "Punches & Services",
      desc: "Support for service punches and active service management.",
      icon: <History className="text-green-600" size={24} />,
      id: "services"
    },
    {
      title: "Technical Support",
      desc: "Get help with website issues or login problems.",
      icon: <Settings className="text-orange-600" size={24} />,
      id: "tech"
    }
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Go to the profile section in your dashboard and click on Security settings. You will find an option to change your password there."
    },
    {
      question: "Why is my payment not showing in the history?",
      answer: "Payments usually take 5-10 minutes to reflect. If it has been longer, please check your bank statement and contact us with the transaction ID."
    },
    {
      question: "How can I add a new service?",
      answer: "To add a new service, go to the 'Services' menu and click on 'Add Service'. Follow the prompts to set the price and categories."
    },
    {
      question: "What is a 'Punch' in the vendor panel?",
      answer: "A punch is a record of a service provided to a cardholder. It tracks the transaction and updates the cardholder's usage."
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">

        {/* ── HERO SECTION ────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            How Can We <span className="text-[#7E1080]">Help You?</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Search our help center or choose a category below to get the support you need.
          </p>

          <div className="relative max-w-xl mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7E1080] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search for articles, solutions, or guides..."
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-4 focus:ring-purple-100 focus:border-[#7E1080] outline-none transition-all text-gray-700"
            />
          </div>
        </div>

        {/* ── CATEGORIES GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{cat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* ── FAQ SECTION (Left/Center) ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="text-[#7E1080]" />
              <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{faq.question}</span>
                    <ChevronDown
                      className={`text-gray-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}
                      size={20}
                    />
                  </button>
                  <div
                    className={`px-6 transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-40 py-5 border-t border-gray-50 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-50 rounded-3xl p-8 mt-12 border border-purple-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#7E1080] shadow-sm flex-shrink-0">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-purple-900 mb-1">Didn't find what you're looking for?</h3>
                <p className="text-purple-700/80 mb-4 sm:mb-0">Our dedicated support team is available 24/7 to help you with any issues.</p>
              </div>
              <button className="sm:ml-auto px-6 py-3 bg-[#7E1080] text-white rounded-xl font-bold hover:bg-[#581c56] transition-all shadow-lg active:scale-95 whitespace-nowrap">
                Submit a Ticket
              </button>
            </div>
          </div>

          {/* ── CONTACT METHODS (Right Sidebar) ───────────────────── */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>

            {/* Phone */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Call Us</p>
                <p className="text-gray-800 font-bold text-lg">+91 1800-123-4567</p>
                <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  9:00 AM - 6:00 PM (IST)
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email Us</p>
                <p className="text-gray-800 font-bold">support@dmivendor.com</p>
                <p className="text-xs text-gray-400 mt-1">Response time: ~4 hours</p>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-[#7E1080] flex-shrink-0">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Live Chat</p>
                <p className="text-gray-800 font-bold">Chat with our experts</p>
                <button className="mt-3 text-sm font-bold text-[#7E1080] hover:underline flex items-center gap-1">
                  Start Conversation →
                </button>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 mt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Service Hours</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mon - Fri</span>
                  <span className="text-gray-800 font-medium">9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sat - Sun</span>
                  <span className="text-gray-800 font-medium">10:00 - 16:00</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Support;
