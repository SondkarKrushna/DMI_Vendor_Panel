import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard/Dashboard';
import Offers from '../Pages/offers/Offers';
import Services from "../Pages/Services/Services";
import Invoice from "../Pages/Payment and invoices/Invoice";
import Enrolling from "../Pages/Enrolling and billing/Enrolling";
import CardHolder from "../Pages/cardholder/CardHolder";
import PaymentCheckout from "../Pages/cardholder/PaymentCheckout";
import CallNotepad from "../Pages/Call notepad/CallNotepad";
import PunchManagement from "../Pages/Punch management/PunchManagement";
import Advertisements from "../Pages/advertisement/Advertisements";
import Affilation from "../Pages/Affilation/Affilation";
import BusinessProfile from "../Pages/Business profile/BusinessProfile";
import Support from "../Pages/Support/Support";
import Login from '../Pages/Auth/Login';
import Register from '../Pages/Auth/Register';
import NotFound from '../components/404';
// import NotificationsModal from "../components/notifications/NotificationsModal";

import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/Invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
        <Route path="/enrolling" element={<ProtectedRoute><Enrolling /></ProtectedRoute>} />
        <Route path="/card-holder" element={<ProtectedRoute><CardHolder /></ProtectedRoute>} />
        <Route path="/payment-checkout" element={<ProtectedRoute><PaymentCheckout /></ProtectedRoute>} />
        <Route path="/call-notepad" element={<ProtectedRoute><CallNotepad /></ProtectedRoute>} />
        <Route path="/punch-management" element={<ProtectedRoute><PunchManagement /></ProtectedRoute>} />
        <Route path="/advertisements" element={<ProtectedRoute><Advertisements /></ProtectedRoute>} />
        <Route path="/affilation" element={<ProtectedRoute><Affilation /></ProtectedRoute>} />
        <Route path="/Business-profile" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ This handles ALL unknown routes */}
        <Route path="/*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes