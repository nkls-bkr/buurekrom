package dev.bruenker.buurekrom.paths.service;

import dev.bruenker.buurekrom.paths.exception.InvalidCredentialsException;
import jakarta.annotation.Nonnull;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import static java.util.Objects.requireNonNull;

@Service
public class AuthService {

    @Nonnull
    private final AuthenticationManager authenticationManager;

    @Nonnull
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthService(@Nonnull final AuthenticationManager authenticationManager) {
        this.authenticationManager = requireNonNull(authenticationManager, "authenticationManager");
    }

    @Nonnull
    public String authenticate(
            @Nonnull final String username,
            @Nonnull final String rawPassword,
            @Nonnull final HttpServletRequest request,
            @Nonnull final HttpServletResponse response
    ) {
        requireNonNull(username, "username");
        requireNonNull(rawPassword, "rawPassword");
        requireNonNull(request, "request");
        requireNonNull(response, "response");

        final Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, rawPassword)
            );
        } catch (final AuthenticationException ex) {
            throw new InvalidCredentialsException();
        }

        final SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        return authentication.getName();
    }
}
