package com.esprit.foyerservice.config;

import io.swagger.v3.oas.models.*; import io.swagger.v3.oas.models.info.Info; import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        final String s = "bearerAuth";
        return new OpenAPI().info(new Info().title("Foyer Service API").version("1.0.0").description("Résidence, Chambre, Réservation, Incident — EspritConnect"))
            .addSecurityItem(new SecurityRequirement().addList(s))
            .components(new Components().addSecuritySchemes(s, new SecurityScheme().name(s).type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
