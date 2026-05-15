package com.esprit.authservice.mapper;

import com.esprit.authservice.dto.request.RegisterRequestDTO;
import com.esprit.authservice.dto.response.UserResponseDTO;
import com.esprit.authservice.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-14T20:55:38+0100",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(RegisterRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.email( dto.getEmail() );
        user.prenom( dto.getPrenom() );
        user.nom( dto.getNom() );
        user.role( dto.getRole() );
        user.promo( dto.getPromo() );
        user.avatarUrl( dto.getAvatarUrl() );
        user.espritId( dto.getEspritId() );
        user.cin( dto.getCin() );
        user.specialite( dto.getSpecialite() );
        user.parcours( dto.getParcours() );

        return user.build();
    }

    @Override
    public UserResponseDTO toResponseDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponseDTO.UserResponseDTOBuilder userResponseDTO = UserResponseDTO.builder();

        userResponseDTO.id( user.getId() );
        userResponseDTO.email( user.getEmail() );
        userResponseDTO.prenom( user.getPrenom() );
        userResponseDTO.nom( user.getNom() );
        userResponseDTO.role( user.getRole() );
        userResponseDTO.promo( user.getPromo() );
        userResponseDTO.avatarUrl( user.getAvatarUrl() );
        userResponseDTO.createdAt( user.getCreatedAt() );
        userResponseDTO.espritId( user.getEspritId() );
        userResponseDTO.cin( user.getCin() );
        userResponseDTO.lastLoginAt( user.getLastLoginAt() );
        userResponseDTO.online( user.isOnline() );
        userResponseDTO.approved( user.isApproved() );
        userResponseDTO.specialite( user.getSpecialite() );
        userResponseDTO.parcours( user.getParcours() );

        return userResponseDTO.build();
    }
}
