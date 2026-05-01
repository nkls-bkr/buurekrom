package dev.bruenker.buurekrom.paths.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.bruenker.buurekrom.paths.shared.ErrorResponse;
import jakarta.annotation.Nonnull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

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
                        .requestMatchers("/api/**").authenticated()
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
    public AuthenticationManager authenticationManager(
            @Nonnull final UserDetailsService userDetailsService,
            @Nonnull final PasswordEncoder passwordEncoder
    ) {
        requireNonNull(userDetailsService, "userDetailsService");
        requireNonNull(passwordEncoder, "passwordEncoder");

        final DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
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
