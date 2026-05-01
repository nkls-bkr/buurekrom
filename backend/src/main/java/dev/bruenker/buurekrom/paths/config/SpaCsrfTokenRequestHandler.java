package dev.bruenker.buurekrom.paths.config;

import jakarta.annotation.Nonnull;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

import java.util.function.Supplier;

import static java.util.Objects.requireNonNull;

final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {

    @Nonnull
    private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

    @Override
    public void handle(
            @Nonnull final HttpServletRequest request,
            @Nonnull final HttpServletResponse response,
            @Nonnull final Supplier<CsrfToken> csrfToken
    ) {
        requireNonNull(request, "request");
        requireNonNull(response, "response");
        requireNonNull(csrfToken, "csrfToken");

        delegate.handle(request, response, csrfToken);
    }

    @Override
    public String resolveCsrfTokenValue(
            @Nonnull final HttpServletRequest request,
            @Nonnull final CsrfToken csrfToken
    ) {
        requireNonNull(request, "request");
        requireNonNull(csrfToken, "csrfToken");

        final String headerValue = request.getHeader(csrfToken.getHeaderName());
        return StringUtils.hasText(headerValue)
                ? super.resolveCsrfTokenValue(request, csrfToken)
                : delegate.resolveCsrfTokenValue(request, csrfToken);
    }
}
