import React from "react";
import Header from "../common/header/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../home/Home";
import Footer from "../common/footer/Footer";
import About from "../about/About";
import Pricing from "../pricing/Pricing";
import Blog from "../blog/Blog";
import Services from "../services/Services";
import Contact from "../contact/Contact";
import AuthForm from "../auth/AuthForm";
import PropertyRegistrationForm from "../register_property/PropertyRegistrationForm";
import PropertyListingPage from "../all_properties/PropertyListingPage";
import PropertyDetails from "../property_detail/PropertyDetails";
import VerifyPropertyPage from "../verify_property/VerifyProperty";
import SearchResults from "../search_result/SearchResults";
import UserDashboard from "../user_dashboard/UserDashboard";
import ChatWidget from "../chat/ChatWidget";
// import SearchResultsPage from "../property_list/PropertyList";

const Pages = () => {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/property" element={<PropertyRegistrationForm />} />
          <Route path="/all-property" element={<PropertyListingPage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/verify-properties" element={<VerifyPropertyPage />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          

        </Routes>
        <Footer />
        <ChatWidget />
      </Router>
    </>
  );
};

export default Pages;
