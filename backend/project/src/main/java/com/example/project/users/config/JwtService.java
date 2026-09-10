package com.example.project.users.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtService {

    private final Key key;
    private final long expirationMillis;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expiration-minutes}") long expirationMinutes) {

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMinutes * 60_000L;
    }

    // =========================
    // Generate Token
    // =========================
    public String generateToken(String username, Set<String> roles) {

        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // =========================
    // Extract Username
    // =========================
    public String extractUsername(String token) {
        return parseClaims(token).getBody().getSubject();
    }

    // =========================
    // Extract Roles
    // =========================
    public Set<String> extractRoles(String token) {

        Object claim = parseClaims(token).getBody().get("roles");

        if (claim instanceof Collection<?>) {

            Collection<?> collection = (Collection<?>) claim;
            Set<String> roles = new HashSet<>();

            for (Object item : collection) {
                if (item != null) {
                    roles.add(item.toString());
                }
            }

            return roles;
        }

        return Set.of();
    }

    // =========================
    // Validate Token
    // =========================
    public boolean isValid(String token) {

        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // =========================
    // Parse Claims
    // =========================
    private Jws<Claims> parseClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}