package com.ZenMate.ZenMateBackend.interfaces;

import com.ZenMate.ZenMateBackend.DTO.ZenUserInput;
import com.ZenMate.ZenMateBackend.entity.ZenUserEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ZenUserInterface {
    List<ZenUserEntity> getAllUsers();
    Optional<ZenUserEntity> getUserById(UUID id);

    Optional<ZenUserEntity> getUserByUsername(String username);

    Optional<ZenUserEntity> getUserByEmail(String email);

    ZenUserEntity createUser(ZenUserInput userInput, PasswordEncoder encoder);

    Optional <ZenUserEntity> updateUser(UUID id, ZenUserEntity updatedUser);

    Optional<ZenUserEntity> deleteUser(UUID id);
}
