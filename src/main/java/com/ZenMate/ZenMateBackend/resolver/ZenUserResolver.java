package com.ZenMate.ZenMateBackend.resolver;

import com.ZenMate.ZenMateBackend.DTO.*;
import com.ZenMate.ZenMateBackend.Exceptions.GraphQLException;
import com.ZenMate.ZenMateBackend.entity.ZenUserEntity;
import com.ZenMate.ZenMateBackend.Exceptions.UserNotFoundException;
import com.ZenMate.ZenMateBackend.service.ZenUserService;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.UUID;

@Validated
@Controller
public class ZenUserResolver {

    private final ZenUserService userService;
    private final PasswordEncoder passwordEncoder;

    public ZenUserResolver(ZenUserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // Queries
    @QueryMapping
    public List<ZenUserEntity> getAllUsers() {
        return userService.getAllUsers();
    }

    @QueryMapping
    public ZenUserEntity getUserById(@Argument UUID id) {
        return userService.getUserById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @QueryMapping
    public ZenUserEntity getUserByUsername(@Argument String username) {
        return userService.getUserByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Username: " + username));
    }

    @QueryMapping
    public ZenUserEntity getUserByEmail(@Argument  String email) {
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Email: " + email));
    }

    // Mutations
   @MutationMapping
   public ZenUserEntity signUp(@Argument("input") @Valid ZenUserInput input) {
        try{
            return userService.createUser(input, passwordEncoder);
        } catch (Exception e) {
            throw new GraphQLException("Failed to create user: " + e.getMessage());
        }
   }


    @MutationMapping
    public ZenUserEntity updateUser(@Argument UUID id, @Argument("input") UpdateUserInput input) {
        ZenUserEntity updatedUser = new ZenUserEntity();
        updatedUser.setUsername(input.getUsername());
        updatedUser.setEmail(input.getEmail());
        updatedUser.setTimeZone(input.getTimeZone());
        return userService.updateUser(id, updatedUser)
                .orElseThrow(() -> new UserNotFoundException(id));
    }


    @MutationMapping
    public ZenUserEntity deleteUser(@Argument UUID id) {
        return userService.deleteUser(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }
}