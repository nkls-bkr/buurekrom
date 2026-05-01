package dev.bruenker.buurekrom.paths.config;

import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static java.util.Objects.requireNonNull;

final class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @Nonnull final HttpServletRequest request,
            @Nonnull final HttpServletResponse response,
            @Nonnull final FilterChain filterChain
    ) throws ServletException, IOException {
        requireNonNull(request, "request");
        requireNonNull(response, "response");
        requireNonNull(filterChain, "filterChain");

        final CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
        if (csrfToken != null) {
            csrfToken.getToken();
        }
        filterChain.doFilter(request, response);
    }
}
