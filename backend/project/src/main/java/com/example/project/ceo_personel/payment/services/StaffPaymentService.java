package com.example.project.ceo_personel.payment.services;

import com.example.project.ceo_personel.payment.dto.StaffPaymentRequest;
import com.example.project.ceo_personel.payment.dto.StaffPaymentResponse;
import com.example.project.ceo_personel.payment.dto.StaffPaymentStatsResponse;

import java.util.List;

public interface StaffPaymentService {

    /** ثبت پرداخت (حقوق/پاداش) به یک کارمند */
    StaffPaymentResponse recordPayment(String ceoUsername, StaffPaymentRequest request);

    /** همه پرداخت‌های کارمندان مدیر آژانس */
    List<StaffPaymentResponse> getPayments(String ceoUsername);

    /** پرداخت‌های یک کارمند خاص */
    List<StaffPaymentResponse> getPaymentsByStaff(String ceoUsername, Long staffId);

    /** آمار پرداخت‌ها (کل + به تفکیک کارمند + به تفکیک ماه) */
    StaffPaymentStatsResponse getStatistics(String ceoUsername);

    /** حذف یک پرداخت */
    void deletePayment(String ceoUsername, Long paymentId);
}
