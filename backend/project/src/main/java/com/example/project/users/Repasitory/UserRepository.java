package com.example.project.users.Repasitory;

import com.example.project.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByMobile(String mobile);
    boolean existsByCustomerCode(String customerCode);

    Optional<User> findByEmail(String email);

    Optional<User> findByMobile(String mobile);

    long countByRoles_Name(String roleName);
    List<User> findByRoles_Name(String roleName);

    List<User> findByEnabledFalse();
}
