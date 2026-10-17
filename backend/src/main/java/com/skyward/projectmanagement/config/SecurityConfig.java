package com.skyward.projectmanagement.config;

import com.skyward.projectmanagement.security.JwtAuthenticationFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(
                        csrf -> csrf.disable()
                )

                .cors(
                        Customizer.withDefaults()
                )

                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )

                .authorizeHttpRequests(
                        auth -> auth

                                /*
                                 * ==========================================
                                 * CORS / PREFLIGHT
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()

                                /*
                                 * ==========================================
                                 * PUBLIC
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/auth/**"
                                )
                                .permitAll()

                                /*
                                 * ==========================================
                                 * ADMIN ONLY
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/users/**",
                                        "/api/user-project-assignments/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * ==========================================
                                 * CLIENT PORTAL
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/client/**"
                                )
                                .hasRole("CLIENT")

                                /*
                                 * ==========================================
                                 * SUPERVISOR PORTAL
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/supervisor/**"
                                )
                                .hasRole("SUPERVISOR")

                                /*
                                 * ==========================================
                                 * CONTRACTOR PORTAL
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/contractor/**"
                                )
                                .hasRole("CONTRACTOR")

                                /*
                                 * ==========================================
                                 * NOTIFICATIONS + AUDIT
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/notifications/**",
                                        "/api/audit-logs/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MANAGER"
                                )

                                /*
                                 * ==========================================
                                 * CONTRACTOR MANAGEMENT
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/contractors/**",
                                        "/api/contractor-bills/**",
                                        "/api/contractor-ledger/**",
                                        "/api/subcontractor-payments/**",
                                        "/api/contractor-project-assignments/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MANAGER"
                                )

                                /*
                                 * ==========================================
                                 * CLIENT / PROJECT / BOQ / DASHBOARD
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/clients/**",
                                        "/api/projects/**",
                                        "/api/boq/**",
                                        "/api/boq-items/**",
                                        "/api/dashboard/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MANAGER"
                                )

                                /*
                                 * ==========================================
                                 * FINANCIAL MANAGEMENT
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/expenses/**",
                                        "/api/payments/**",
                                        "/api/accounts/**",
                                        "/api/site-cost-summary/**",
                                        "/api/site-report/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MANAGER"
                                )

                                /*
                                 * ==========================================
                                 * LABOUR MANAGEMENT
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/workers/**",
                                        "/api/labour-attendance/**",
                                        "/api/labour-payments/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MANAGER"
                                )

                                /*
                                 * ==========================================
                                 * SITE / DOCUMENT MANAGEMENT
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/material-requests/**",
                                        "/api/site-photos/**",
                                        "/api/site-issues/**",
                                        "/api/project-documents/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MANAGER"
                                )

                                /*
                                 * ==========================================
                                 * DAILY PROGRESS
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/progress/**",
                                        "/api/daily-progress/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "MANAGER"
                                )

                                /*
                                 * ==========================================
                                 * ALL OTHER API ENDPOINTS
                                 * ==========================================
                                 */
                                .requestMatchers(
                                        "/api/**"
                                )
                                .authenticated()

                                .anyRequest()
                                .permitAll()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        List<String> origins =
                Arrays.stream(
                                allowedOrigins.split(",")
                        )
                        .map(String::trim)
                        .filter(
                                value ->
                                        !value.isEmpty()
                        )
                        .toList();

        configuration.setAllowedOrigins(
                origins
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(
                true
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}