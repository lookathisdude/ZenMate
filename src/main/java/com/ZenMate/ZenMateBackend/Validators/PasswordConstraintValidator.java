package com.ZenMate.ZenMateBackend.Validators;

import com.ZenMate.ZenMateBackend.annotations.ValidatePassword;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PasswordConstraintValidator implements ConstraintValidator<ValidatePassword, String> {

    private static final String PASSWORD_PATTERN =
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";


    @Override
    public void initialize(ValidatePassword constraintAnnotation) {
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext constraintValidatorContext) {
        if(password == null) {
            return false;
        }

        Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
        if(!pattern.matcher(password).matches()) {
            constraintValidatorContext.disableDefaultConstraintViolation();
            constraintValidatorContext.buildConstraintViolationWithTemplate(
                            "Password must contain: " +
                                    "- Minimum 8 characters\n" +
                                    "- At least 1 uppercase letter\n" +
                                    "- At least 1 lowercase letter\n" +
                                    "- At least 1 number\n" +
                                    "- At least 1 special character (@#$%^&+=!)")
                    .addConstraintViolation();
            return false;
        }
        return true;
    }
}
