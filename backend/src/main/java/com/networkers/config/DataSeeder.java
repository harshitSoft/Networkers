package com.networkers.config;

import com.networkers.user.Role;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedSuperAdmin(UserRepository users, PasswordEncoder encoder, JdbcTemplate jdbc) {
        return args -> {
            normalizeLegacyEnumColumns(jdbc);
            migrateLegacyRoles(users);
            if (!users.existsByEmail("admin@networkers.com")) {
                User admin = new User();
                admin.setFullName("Networkers Super Admin");
                admin.setEmail("admin@networkers.com");
                admin.setMobile("9999999999");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole(Role.SUPER_ADMIN);
                admin.setEnabled(true);
                users.save(admin);
            }
        };
    }

    private void normalizeLegacyEnumColumns(JdbcTemplate jdbc) {
        jdbc.execute("alter table users modify role varchar(30)");
        jdbc.execute("alter table referral modify status varchar(30)");
    }

    private void migrateLegacyRoles(UserRepository users) {
        users.findAll().forEach(user -> {
            if (user.getRole() == Role.BUSINESS_USER) {
                user.setRole(Role.USER);
                users.save(user);
            }
            if ("admin@networkers.com".equalsIgnoreCase(user.getEmail()) && user.getRole() == Role.ADMIN) {
                user.setRole(Role.SUPER_ADMIN);
                users.save(user);
            }
        });
    }
}
