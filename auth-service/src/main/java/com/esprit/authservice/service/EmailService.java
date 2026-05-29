package com.esprit.authservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    @Value("${app.base-url:http://localhost:8081}")
    private String baseUrl;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Async
    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = baseUrl + "/api/auth/verify?token=" + token;

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 520px; margin: 40px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden;
                                 box-shadow: 0 2px 8px rgba(0,0,0,.12); }
                    .header { background: #1a73e8; padding: 28px 32px; }
                    .header h1 { color: #fff; margin: 0; font-size: 22px; }
                    .body { padding: 32px; color: #333; line-height: 1.6; }
                    .btn { display: inline-block; margin-top: 24px; padding: 14px 32px;
                           background: #1a73e8; color: #fff; text-decoration: none;
                           border-radius: 6px; font-weight: bold; font-size: 15px; }
                    .footer { padding: 20px 32px; font-size: 12px; color: #888;
                              border-top: 1px solid #eee; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header"><h1>EspritConnect</h1></div>
                    <div class="body">
                      <p>Welcome to <strong>EspritConnect</strong>!</p>
                      <p>To activate your account, please verify your email address by clicking the button below.</p>
                      <a href="%s" class="btn">Verify my email</a>
                      <p style="margin-top:24px;font-size:13px;color:#666;">
                        This link expires in <strong>24 hours</strong>.<br/>
                        If you did not create an account, you can safely ignore this email.
                      </p>
                    </div>
                    <div class="footer">
                      © 2026 EspritConnect — Université Privée de l'Informatique
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(verifyUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("EspritConnect — Verify your email address");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email to " + to, e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/auth/reset-password?token=" + token;

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 520px; margin: 40px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden;
                                 box-shadow: 0 2px 8px rgba(0,0,0,.12); }
                    .header { background: #e74c3c; padding: 28px 32px; }
                    .header h1 { color: #fff; margin: 0; font-size: 22px; }
                    .body { padding: 32px; color: #333; line-height: 1.6; }
                    .btn { display: inline-block; margin-top: 24px; padding: 14px 32px;
                           background: #e74c3c; color: #fff; text-decoration: none;
                           border-radius: 6px; font-weight: bold; font-size: 15px; }
                    .footer { padding: 20px 32px; font-size: 12px; color: #888;
                              border-top: 1px solid #eee; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header"><h1>EspritConnect</h1></div>
                    <div class="body">
                      <p>You requested a <strong>password reset</strong> for your EspritConnect account.</p>
                      <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
                      <a href="%s" class="btn">Reset my password</a>
                      <p style="margin-top:24px;font-size:13px;color:#666;">
                        If you did not request a password reset, you can safely ignore this email.<br/>
                        Your password will not be changed.
                      </p>
                    </div>
                    <div class="footer">
                      © 2026 EspritConnect — Université Privée de l'Informatique
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(resetUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("EspritConnect — Reset your password");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email to " + to, e);
        }
    }
}
