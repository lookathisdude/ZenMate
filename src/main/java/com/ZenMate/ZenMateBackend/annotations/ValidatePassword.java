package com.ZenMate.ZenMateBackend.annotations;

import com.ZenMate.ZenMateBackend.Validators.PasswordConstraintValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordConstraintValidator.class)
@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidatePassword {
    String message() default "Invalid password";
    Class<?> [] groups() default {};
    Class<? extends Payload> [] payload() default {};
}
