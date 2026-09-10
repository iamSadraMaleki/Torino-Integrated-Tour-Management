package com.example.project.profile.ceoinfo.repository;


import com.example.project.profile.ceoinfo.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    @Query("SELECT ba FROM BankAccount ba JOIN FETCH ba.user WHERE ba.user.id = :userId")
    Optional<BankAccount> findByUserId(@Param("userId") Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByIban(String iban);

    @Query("SELECT ba FROM BankAccount ba JOIN FETCH ba.user WHERE ba.user.username = :username")
    Optional<BankAccount> findByUsername(@Param("username") String username);

    @Query("SELECT ba FROM BankAccount ba JOIN FETCH ba.user WHERE ba.id = :id")
    Optional<BankAccount> findByIdWithUser(@Param("id") Long id);
}

