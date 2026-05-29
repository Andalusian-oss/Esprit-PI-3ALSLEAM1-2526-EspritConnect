package com.esprit.messageservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs once after Hibernate has created/updated the schema to ensure
 * the contenu columns can hold large base64-encoded voice messages.
 */
@Component
public class SchemaMigrator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void migrateSchema() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE messages MODIFY COLUMN contenu MEDIUMTEXT NOT NULL"
            );
        } catch (Exception ignored) {}

        try {
            jdbcTemplate.execute(
                "ALTER TABLE group_messages MODIFY COLUMN contenu MEDIUMTEXT NOT NULL"
            );
        } catch (Exception ignored) {}
    }
}
