package com.esprit.messageservice.config;

import io.swagger.v3.oas.models.*; import io.swagger.v3.oas.models.info.Info; import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        final String s = "bearerAuth";
        return new OpenAPI().info(new Info().title("Message Service API").version("1.0.0").description("Messages, Conversations, Notifications + WebSocket — EspritConnect"))
            .addSecurityItem(new SecurityRequirement().addList(s))
            .components(new Components().addSecuritySchemes(s, new SecurityScheme().name(s).type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
