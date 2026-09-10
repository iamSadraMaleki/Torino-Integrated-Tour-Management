package com.example.project.user_reservation.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * هنگام استارت‌آپ اصلاحات دیتابیسی را انجام می‌دهد که Hibernate (ddl-auto=update) انجام نمی‌دهد:
 * ۱) تبدیل ستون‌هایی که قبلاً با varchar(255) ساخته شده‌اند به TEXT (رفع «value too long»)
 * ۲) بازسازی چک کانسترینت وضعیت جدول refund_requests (وضعیت جدید REFUND_RECEIPT_UPLOADED)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseColumnFixer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        fixColumns();
        fixRefundStatusCheckConstraint();
        fixTourChatMessageColumns();
    }

    /**
     * ستون‌های جدید جدول پیام چت (is_edited / is_deleted) وقتی به جدول موجود اضافه شدند
     * برای ردیف‌های قبلی NULL شدند و Hibernate نمی‌تواند NULL را در boolean primitive بخواند
     * («Null value was assigned to a property ... of primitive type») — اینجا NULL را به false تبدیل می‌کنیم.
     */
    private void fixTourChatMessageColumns() {
        try {
            jdbcTemplate.execute("UPDATE tour_chat_messages SET is_edited = false WHERE is_edited IS NULL");
            jdbcTemplate.execute("UPDATE tour_chat_messages SET is_deleted = false WHERE is_deleted IS NULL");
            // پیش‌فرض ستون را برای ردیف‌های آینده هم false می‌کنیم (حتی اگر INSERT مستقیم ستون را ننویسد)
            jdbcTemplate.execute("ALTER TABLE tour_chat_messages ALTER COLUMN is_edited SET DEFAULT false");
            jdbcTemplate.execute("ALTER TABLE tour_chat_messages ALTER COLUMN is_deleted SET DEFAULT false");
            log.info("✅ tour_chat_messages is_edited/is_deleted NULL values backfilled to false");
        } catch (Exception e) {
            log.warn("Skipped tour_chat_messages column fix: {}", e.getMessage());
        }
    }

    private void fixColumns() {
        String[][] fixes = {
                {"refund_requests", "cancelled_passenger_ids"},
                {"refund_requests", "cancelled_seat_ids"},
                {"refund_requests", "receipt_image_url"},
                {"payment_proofs", "receipt_image_url"},
        };
        for (String[] f : fixes) {
            try {
                jdbcTemplate.execute("ALTER TABLE " + f[0] + " ALTER COLUMN " + f[1] + " TYPE TEXT");
                log.info("✅ Column {}.{} converted to TEXT", f[0], f[1]);
            } catch (Exception e) {
                log.warn("Skipped column fix {}.{}: {}", f[0], f[1], e.getMessage());
            }
        }
    }

    /**
     * چک کانسترینت status جدول refund_requests را با وضعیت‌های فعلی بازسازی می‌کند.
     * (وقتی جدول ساخته شد وضعیت REFUND_RECEIPT_UPLOADED هنوز وجود نداشت و کانسترینت آن را رد می‌کرد)
     */
    private void fixRefundStatusCheckConstraint() {
        try {
            jdbcTemplate.execute("ALTER TABLE refund_requests DROP CONSTRAINT IF EXISTS refund_requests_status_check");
            // نگاشت وضعیت قدیمی PROCESSED (که دیگر در enum نیست) به CONFIRMED تا بازسازی کانسترینت شکست نخورد
            jdbcTemplate.execute("UPDATE refund_requests SET status = 'CONFIRMED' WHERE status = 'PROCESSED'");
            jdbcTemplate.execute("ALTER TABLE refund_requests ADD CONSTRAINT refund_requests_status_check " +
                    "CHECK (status IN ('PENDING','REFUND_RECEIPT_UPLOADED','CONFIRMED','REJECTED'))");
            log.info("✅ refund_requests status check constraint updated with REFUND_RECEIPT_UPLOADED");
        } catch (Exception e) {
            log.warn("Skipped status check constraint fix: {}", e.getMessage());
        }
    }
}
