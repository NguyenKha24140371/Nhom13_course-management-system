package com.cms.config;

import com.cms.model.Role;
import com.cms.model.User;
import com.cms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdminAccount(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            // 1. Tạo tài khoản Admin (ROLE_ADMIN)
            if (!userRepository.existsByUsername("admin") && !userRepository.existsByEmail("admin123@gmail.com")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("123"));
                admin.setEmail("admin123@gmail.com");
                admin.setFullName("System Administrator");
                admin.setActive(true);
                admin.setRoles(Set.of(Role.ROLE_ADMIN));

                userRepository.save(admin);
                System.out.println(">>> ĐÃ TẠO TÀI KHOẢN ADMIN: admin / 123");
            }

            // 2. Tạo tài khoản Giảng viên (ROLE_INSTRUCTOR)
            if (!userRepository.existsByUsername("instructor") && !userRepository.existsByEmail("instructor@gmail.com")) {
                User instructor = new User();
                instructor.setUsername("instructor");
                instructor.setPassword(passwordEncoder.encode("123"));
                instructor.setEmail("instructor@gmail.com");
                instructor.setFullName("Giảng viên Nguyễn Văn A");
                instructor.setActive(true);
                instructor.setRoles(Set.of(Role.ROLE_INSTRUCTOR));

                userRepository.save(instructor);
                System.out.println(">>> ĐÃ TẠO TÀI KHOẢN GIẢNG VIÊN: instructor / 123");
            }

            // 3. Tạo tài khoản Học viên (ROLE_USER)
            if (!userRepository.existsByUsername("student") && !userRepository.existsByEmail("student@gmail.com")) {
                User student = new User();
                student.setUsername("student");
                student.setPassword(passwordEncoder.encode("123"));
                student.setEmail("student@gmail.com");
                student.setFullName("Học viên Trần Văn B");
                student.setActive(true);
                student.setRoles(Set.of(Role.ROLE_STUDENT));

                userRepository.save(student);
                System.out.println(">>> ĐÃ TẠO TÀI KHOẢN HỌC VIÊN: student / 123");
            }
        };
    }
}