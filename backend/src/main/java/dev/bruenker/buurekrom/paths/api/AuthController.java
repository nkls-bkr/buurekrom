package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.api.request.LoginRequest;
import dev.bruenker.buurekrom.paths.api.response.LoginResponse;
import dev.bruenker.buurekrom.paths.service.AuthService;
import jakarta.annotation.Nonnull;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.util.Objects.requireNonNull;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Nonnull
    private final AuthService authService;

    public AuthController(@Nonnull final AuthService authService) {
        this.authService = requireNonNull(authService, "authService");
    }

    @PostMapping("/login")
    @Nonnull
    public LoginResponse login(
            @Valid @RequestBody @Nonnull final LoginRequest request,
            @Nonnull final HttpServletRequest httpRequest,
            @Nonnull final HttpServletResponse httpResponse
    ) {
        requireNonNull(request, "request");
        requireNonNull(httpRequest, "httpRequest");
        requireNonNull(httpResponse, "httpResponse");

        final String username = authService.authenticate(
                request.username(),
                request.password(),
                httpRequest,
                httpResponse
        );

        return new LoginResponse(username);
    }

    @GetMapping("/me")
    @Nonnull
    public LoginResponse me(@AuthenticationPrincipal @Nonnull final UserDetails principal) {
        requireNonNull(principal, "principal");

        return new LoginResponse(principal.getUsername());
    }
}
