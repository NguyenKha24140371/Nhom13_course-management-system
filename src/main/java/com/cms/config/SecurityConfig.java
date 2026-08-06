package com.cms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                // Session STATELESS cho JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // 1. Mở quyền truy cập Giao diện Web (HTML, CSS, JS, Static Files)
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/*.html",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/static/**",
                                "/favicon.ico",
                                "/error"
                        ).permitAll()

                        // 2. Mở quyền Đăng nhập / Đăng ký
                        .requestMatchers("/api/auth/**").permitAll()

                        // 3. Mở quyền Swagger UI
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // 4. Quyền ADMIN hệ thống
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // 5. 🔴 BỔ SUNG: Quyền quản lý KHÓA HỌC (/api/courses/**)
                        // Chỉ INSTRUCTOR và ADMIN được Tạo, Sửa, Xóa khóa học
                        .requestMatchers(HttpMethod.POST, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                        // Học viên (USER) và các role khác chỉ được xem danh sách/chi tiết khóa học
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").authenticated()

                        // 6. Quyền quản lý BÀI HỌC (/api/lessons/**)
                        // Chỉ INSTRUCTOR và ADMIN được Tạo, Sửa, Xóa bài học
                        .requestMatchers(HttpMethod.POST, "/api/lessons/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/lessons/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/lessons/**").hasAnyRole("INSTRUCTOR", "ADMIN")
                        // Học viên (USER) chỉ được xem bài học
                        .requestMatchers(HttpMethod.GET, "/api/lessons/**").authenticated()

                        // 7. Tất cả các request còn lại bắt buộc phải đăng nhập
                        .anyRequest().authenticated()
                )

                // Thêm Filter kiểm tra JWT
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}