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


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/offers" element={<Offers />} />
        <Route path="/services" element={<Services />} />
        <Route path="/Invoice" element={<Invoice />} />
        <Route path="/enrolling" element={<Enrolling />} />
        <Route path="/card-holder" element={<CardHolder />} />
        <Route path="/payment-checkout" element={<PaymentCheckout />} />
        <Route path="/call-notepad" element={<CallNotepad />} />
        <Route path="/punch-management" element={<PunchManagement />} />
        <Route path="/advertisements" element={<Advertisements />} />
        <Route path="/affilation" element={<Affilation />} />
        <Route path="/Business-profile" element={<BusinessProfile />} />
        <Route path="/support" element={<Support />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes