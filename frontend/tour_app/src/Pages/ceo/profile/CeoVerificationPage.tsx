import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context/AuthContext";
import api from "../../../Router/api";
import VerificationStatusCard from "../profile/VerificationStatusCard";
import CeoVerificationForm from "./CeoVerificationForm";
import "./CeoVerificationPage.css";

const CeoVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<"NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED">("NOT_VERIFIED");
  const [verificationData, setVerificationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      
      const isVerifiedResponse = await api.get("/api/ceo-verification/is-verified");
      const isVerified = isVerifiedResponse.data.verified;
      
      if (isVerified) {
        setVerificationStatus("VERIFIED");
        const detailsResponse = await api.get("/api/ceo-verification/status");
        setVerificationData(detailsResponse.data);
      } else {
        const statusResponse = await api.get("/api/ceo-verification/user-verification-status");
        const userStatus = statusResponse.data.verificationStatus || statusResponse.data.status;
        
        if (userStatus === "PENDING") {
          setVerificationStatus("PENDING");
          const detailsResponse = await api.get("/api/ceo-verification/status");
          setVerificationData(detailsResponse.data);
        } else if (userStatus === "REJECTED") {
          setVerificationStatus("REJECTED");
          const detailsResponse = await api.get("/api/ceo-verification/status");
          setVerificationData(detailsResponse.data);
        } else {
          setVerificationStatus("NOT_VERIFIED");
          setVerificationData(null);
        }
      }
    } catch (err) {
      console.error("Error fetching verification status:", err);
      setVerificationStatus("NOT_VERIFIED");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleAction = () => {
    setShowVerificationForm(true);
  };

  const handleFormClose = () => {
    setShowVerificationForm(false);
    fetchVerificationStatus();
  };

  if (loading) {
    return (
      <div className="verification-page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (showVerificationForm) {
    return <CeoVerificationForm onClose={handleFormClose} />;
  }

  return (
    <div className="verification-page-container">
      <div className="verification-page-header">
        <h1>✅ احراز هویت مدیر آژانس</h1>
        <p>وضعیت احراز هویت خود را مشاهده کنید</p>
      </div>

      <VerificationStatusCard 
        status={verificationStatus} 
        verificationData={verificationData}
        onAction={handleAction}
      />

      {(verificationStatus === "PENDING" || verificationStatus === "REJECTED") && (
        <div className="info-banner-page">
          <p>پس از تأیید احراز هویت، امکانات کامل پنل برای شما فعال خواهد شد.</p>
        </div>
      )}
    </div>
  );
};

export default CeoVerificationPage;