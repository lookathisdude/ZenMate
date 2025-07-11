package com.ZenMate.ZenMateBackend.resolver;

import com.ZenMate.ZenMateBackend.service.ConfirmationEmailService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class ConfirmZenUserResolver {

    private final ConfirmationEmailService confirmationEmailService;

    public ConfirmZenUserResolver(ConfirmationEmailService confirmationEmailService) {
        this.confirmationEmailService = confirmationEmailService;
    }

    @MutationMapping
    public boolean confirmUser(@Argument String token) {
        return confirmationEmailService.confirmUser(token);
    }
}
