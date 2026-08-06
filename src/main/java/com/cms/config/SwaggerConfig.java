package com.cms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // Định nghĩa scheme xác thực bằng Bearer Token (JWT)
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("📚 Course Management System API")
                        .description("API cho hệ thống quản lý khóa học: Đăng ký, Đăng nhập, Quản lý User, Khóa học, Bài học, Enrollment...")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Nhóm phát triển CMS")
                                .email("cms-team@example.com"))
                        .license(new License()
                                .name("MIT License")))
                // Khai báo security scheme JWT Bearer
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập JWT token nhận được sau khi đăng nhập. Ví dụ: eyJhbGci...")));
    }
}
