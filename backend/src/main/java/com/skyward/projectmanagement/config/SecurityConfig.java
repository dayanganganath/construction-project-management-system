package com.skyward.projectmanagement.config;

import com.skyward.projectmanagement.security.JwtAuthenticationFilter;

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

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

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
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * =========================================================
                         * CORS PREFLIGHT
                         * =========================================================
                         */
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        /*
                         * =========================================================
                         * PUBLIC AUTH
                         * =========================================================
                         */
                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()

                        /*
                         * =========================================================
                         * ADMIN ONLY
                         * =========================================================
                         */
                        .requestMatchers(
                                "/api/users/**",
                                "/api/user-project-assignments/**"
                        )
                        .hasRole("ADMIN")

                        /*
                         * =========================================================
                         * ADMIN / MANAGER ONLY
                         * =========================================================
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
                         * =========================================================
                         * CLIENT ONLY
                         * =========================================================
                         */
                        .requestMatchers(
                                "/api/client/**"
                        )
                        .hasRole("CLIENT")

                        /*
                         * =========================================================
                         * SUPERVISOR ONLY
                         * =========================================================
                         */
                        .requestMatchers(
                                "/api/supervisor/**"
                        )
                        .hasRole("SUPERVISOR")

                        /*
                         * =========================================================
                         * ALL OTHER API ENDPOINTS
                         * =========================================================
                         */
                        .requestMatchers(
                                "/api/**"
                        )
                        .authenticated()

                        /*
                         * =========================================================
                         * OTHER REQUESTS
                         * =========================================================
                         */
                        .anyRequest()
                        .permitAll()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /*
     * =========================================================
     * CORS CONFIGURATION
     * =========================================================
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
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

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}