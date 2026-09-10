package com.example.project.tour_chat.repository;

import com.example.project.tour_chat.model.TourConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourConversationRepository extends JpaRepository<TourConversation, Long> {

    /** هر (تور، مسافر) فقط یک گفتگو دارد */
    Optional<TourConversation> findByTourIdAndPassengerId(Long tourId, Long passengerId);

    /** گفتگوهای یک مسافر — مرتب بر اساس آخرین پیام */
    List<TourConversation> findByPassengerIdOrderByLastMessageAtDesc(Long passengerId);

    /** گفتگوهای تورهای یک مدیر آژانس — مرتب بر اساس آخرین پیام */
    List<TourConversation> findByTourCeoIdOrderByLastMessageAtDesc(Long tourCeoId);

    boolean existsByTourIdAndPassengerId(Long tourId, Long passengerId);
}
