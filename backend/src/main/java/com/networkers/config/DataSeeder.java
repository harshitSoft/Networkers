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
        // MySQL versions (use these when the MySQL datasource is active):
        // jdbc.execute("alter table users modify role varchar(30)");
        // jdbc.execute("alter table referral modify status varchar(30)");

        // PostgreSQL / Neon versions:
        jdbc.execute("alter table users alter column role type varchar(30) using role::text");
        jdbc.execute("alter table referral alter column status type varchar(30) using status::text");
        migratePostgresLargeObjectText(jdbc, "users", "profile_image");
        migratePostgresLargeObjectText(jdbc, "chapter", "banner_image");
        migratePostgresLargeObjectText(jdbc, "event_image", "image_url");
        // Hibernate may have converted an OID to its numeric identifier before
        // this runner executes. Numeric identifiers are not usable image URLs.
        jdbc.execute("update users set profile_image = null where profile_image ~ '^[0-9]+$'");
        jdbc.execute("update chapter set banner_image = null where banner_image ~ '^[0-9]+$'");
        jdbc.execute("update event_image set image_url = null where image_url ~ '^[0-9]+$'");
    }

    private void migratePostgresLargeObjectText(JdbcTemplate jdbc, String table, String column) {
        Integer oidColumn = jdbc.queryForObject(
                "select count(*) from information_schema.columns where table_schema = current_schema() and table_name = ? and column_name = ? and udt_name = 'oid'",
                Integer.class, table, column);
        if (oidColumn != null && oidColumn > 0) {
            jdbc.execute("alter table " + table + " alter column " + column
                    + " type text using null::text");
        }
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
