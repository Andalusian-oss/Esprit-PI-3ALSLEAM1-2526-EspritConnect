package com.esprit.authservice.mapper;

import com.esprit.authservice.dto.request.RegisterRequestDTO;
import com.esprit.authservice.dto.response.UserResponseDTO;
import com.esprit.authservice.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "password", ignore = true)
    User toEntity(RegisterRequestDTO dto);

    UserResponseDTO toResponseDTO(User user);
}
