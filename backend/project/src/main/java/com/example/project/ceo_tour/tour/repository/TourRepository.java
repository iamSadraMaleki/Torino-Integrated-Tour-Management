package com.example.project.ceo_tour.tour.repository;


import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.ceo_tour.tour.model.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {

    List<Tour> findAllByCreatedByUsernameOrderByDepartureDateDesc(String username);

    Optional<Tour> findByIdAndCreatedByUsername(Long id, String username);

    List<Tour> findAllByBaseTourId(Long baseTourId);

    Optional<Tour> findById(Long id);

    List<Tour> findAllByCreatedByUsernameAndStatusOrderByDepartureDateDesc(String username, TourStatus status);

    /** همه تورهای سیستم — برای پنل ادمین (همراه با پایه‌تور و مدیر آژانس) */
    @Query("SELECT DISTINCT t FROM Tour t JOIN FETCH t.baseTour JOIN FETCH t.createdBy ORDER BY t.departureDate DESC")
    List<Tour> findAllByOrderByDepartureDateDesc();

    /**
     * تورهای قابل رزرو برای کاربر:
     * - وضعیت ACTIVE
     * - تاریخ حرکت نگذشته (هنوز قابل رزرو)
     * - تاریخ بازگشت نگذشته (منقضی نشده)
     */
    @Query("SELECT DISTINCT t FROM Tour t " +
            "JOIN FETCH t.baseTour " +
            "JOIN FETCH t.createdBy " +
            "WHERE (t.status = 'ACTIVE' OR t.status IS NULL) " +
            "ORDER BY t.departureDate ASC")
    List<Tour> findAllBookableTours();

    @Query("SELECT t FROM Tour t " +
            "JOIN FETCH t.baseTour " +
            "JOIN FETCH t.createdBy " +
            "WHERE t.id = :tourId " +
            "AND (t.status = 'ACTIVE' OR t.status IS NULL)")
    Optional<Tour> findBookableById(@Param("tourId") Long tourId);

    /** @deprecated use {@link #findAllBookableTours()} */
    @Deprecated
    @Query("SELECT DISTINCT t FROM Tour t JOIN FETCH t.baseTour JOIN FETCH t.createdBy " +
            "WHERE (t.status = 'ACTIVE' OR t.status IS NULL)")
    List<Tour> findAllActiveTours();

    /** @deprecated use {@link #findBookableById(Long)} */
    @Deprecated
    @Query("SELECT t FROM Tour t JOIN FETCH t.baseTour JOIN FETCH t.createdBy " +
            "WHERE t.id = :tourId AND (t.status = 'ACTIVE' OR t.status IS NULL)")
    Optional<Tour> findActiveById(@Param("tourId") Long tourId);
}
