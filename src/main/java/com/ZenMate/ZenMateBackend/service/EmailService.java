package com.ZenMate.ZenMateBackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service responsible for sending emails using JavaMailSender.
 */
@Service
public class EmailService {

    // Email address used as sender
    @Value("${spring.mail.username}")
    private String fromEmail;

    // Frontend URL prefix for the confirmation link
    @Value("${app.frontend.confirmation-url}")
    private String confirmationUrl;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a confirmation email containing a link with the confirmation token.
     *
     * @param toEmail The recipient user's email address.
     * @param token   The confirmation token to be included in the confirmation URL.
     */
    public void sendConfirmationEmail(String toEmail, String token) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();

        mailMessage.setFrom(fromEmail);
        mailMessage.setTo(toEmail);
        mailMessage.setSubject("Complete Your ZenMate Registration");
        mailMessage.setText("Please click the following link to confirm your account:\n\n"
                + confirmationUrl + token);

        // Send the email via configured mail sender
        mailSender.send(mailMessage);
    }
}
