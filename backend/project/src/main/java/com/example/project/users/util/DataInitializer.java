package com.example.project.users.util;



import com.example.project.users.model.Role;
import com.example.project.users.Repasitory.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class DataInitializer {
    private final RoleRepository roleRepository;


    @PostConstruct
    public void init() {
        createRoleIfMissing("ROLE_USER");
        createRoleIfMissing("ROLE_CEO");
        createRoleIfMissing("ROLE_SUPERADMIN");
    }


    private void createRoleIfMissing(String name) {
        if (!roleRepository.existsByName(name)) {
            roleRepository.save(Role.builder().name(name).build());
        }
    }
}
