package dev.bruenker.buurekrom.paths.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.bruenker.buurekrom.paths.shared.ErrorResponse;
import jakarta.annotation.Nonnull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

import static java.util.Objects.requireNonNull;

@Configuration
public class SecurityConfig {

    @Nonnull
    private final ObjectMapper objectMapper;

    public SecurityConfig(@Nonnull final ObjectMapper objectMapper) {
        this.objectMapper = requireNonNull(objectMapper, "objectMapper");
    }

    @Bean
    @Nonnull
    public SecurityFilterChain securityFilterChain(@Nonnull final HttpSecurity http) {
        requireNonNull(http, "http");

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                )
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(e -> e.authenticationEntryPoint(unauthorizedEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/shared/routes/{shareToken}").permitAll()
                        .requestMatchers("/api/**").hasAuthority("BETA")
                        .anyRequest().permitAll()
                )
                .logout(l -> l
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((_, response, _) -> response.setStatus(HttpStatus.NO_CONTENT.value()))
                        .invalidateHttpSession(true)
                        .deleteCookies("BPSESSION")
                );

        return http.build();
    }

    @Bean
    @Nonnull
    public AuthenticationManager authenticationManager(@Value("${app.beta-password}") final String password) {
        if (password.isBlank()) {
            throw new IllegalArgumentException("BETA_PASSWORD must not be blank");
        }
        final byte[] expected = digest(password);
        return authentication -> {
            if (!(authentication.getCredentials() instanceof String supplied)
                    || !MessageDigest.isEqual(expected, digest(supplied))) {
                throw new BadCredentialsException("Invalid beta password");
            }
            return UsernamePasswordAuthenticationToken.authenticated(
                    "beta", null, List.of(new SimpleGrantedAuthority("BETA")));
        };
    }

    private static byte[] digest(final String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Nonnull
    private AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (_, response, _) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(
                    response.getWriter(),
                    ErrorResponse.of(
                            HttpStatus.UNAUTHORIZED.value(),
                            HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                            "Authentication required"
                    )
            );
        };
    }
}
