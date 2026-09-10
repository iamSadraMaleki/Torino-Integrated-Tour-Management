package com.example.project.users.config;

import com.example.project.users.Repasitory.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ OPTIONS برای همه مسیرها آزاد (برای preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ مسیرهای عمومی (بدون نیاز به هیچ احراز هویتی)
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        // محتوای صفحه معرفی — عمومی برای نمایش، ویرایش فقط توسط ادمین
                        .requestMatchers("/api/landing").permitAll()
                        .requestMatchers("/api/admin/landing/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")

                        // ✅ مسیر /api/users/me رو برای همه کاربران احراز شده آزاد کن
                        .requestMatchers("/api/users/me").hasAnyAuthority("ROLE_USER", "ROLE_SUPERADMIN", "ROLE_CEO")
                        .requestMatchers("/api/users/**").hasAnyAuthority("ROLE_USER", "ROLE_SUPERADMIN", "ROLE_CEO")

                        // مسیرهای خاص با نقش
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/files/**").authenticated()
                        .requestMatchers("/api/user/tour-chat/**").hasAuthority("ROLE_USER")
                        .requestMatchers("/api/ceo/tour-chat/**").hasAuthority("ROLE_CEO")
                        .requestMatchers("/api/admin/tour-chat/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers("/api/user/inbox/**").hasAuthority("ROLE_USER")
                        .requestMatchers("/api/ceo/inbox/**").hasAuthority("ROLE_CEO")
                        .requestMatchers("/api/admin/inbox/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers("/api/admin/tours/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers("/api/phonebook/**").hasAnyAuthority("ROLE_USER", "ROLE_CEO")
                        .requestMatchers("/api/admin/phonebook/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers("/api/admin/finance/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers("/api/ceo/finance/**").hasAuthority("ROLE_CEO")
                        .requestMatchers("/api/user/reviews/**").hasAuthority("ROLE_USER")
                        .requestMatchers("/api/ceo/reviews/**").hasAuthority("ROLE_CEO")
                        .requestMatchers("/api/admin/reviews/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers("/api/ceo/discounts/**").hasAuthority("ROLE_CEO")
                        .requestMatchers("/api/admin/discounts/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERADMIN")
                        .requestMatchers("/api/ceo/**").hasAuthority("ROLE_CEO")
                        .requestMatchers("/api/users/**").hasAuthority("ROLE_USER")
                        .requestMatchers("/api/admin/auth/register-superadmin").hasAuthority("ROLE_SUPERADMIN")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(daoAuthenticationProvider())
                // ✅ مهم: فیلتر JWT رو فقط برای مسیرهایی که نیاز دارن اجرا کن
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        logger.info("Security filter chain configured successfully");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedOrigin("http://localhost:5174");
        configuration.addAllowedMethod("*");  // همه متدها مجاز
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        configuration.addExposedHeader("Authorization");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        logger.info("CORS configured for http://localhost:5173");
        return source;
    }
    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .map(u -> org.springframework.security.core.userdetails.User
                        .withUsername(u.getUsername())
                        .password(u.getPassword())
                        .authorities(
                                u.getRoles().stream()
                                        .map(r -> r.getName())
                                        .toArray(String[]::new)
                        )
                        .accountLocked(!u.isEnabled())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}