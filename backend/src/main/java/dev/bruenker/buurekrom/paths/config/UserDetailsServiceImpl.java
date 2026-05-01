package dev.bruenker.buurekrom.paths.config;

import dev.bruenker.buurekrom.paths.exception.UserNotFoundException;
import dev.bruenker.buurekrom.paths.model.User;
import dev.bruenker.buurekrom.paths.service.UserService;
import jakarta.annotation.Nonnull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.util.Objects.requireNonNull;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Nonnull
    private final UserService userService;

    public UserDetailsServiceImpl(@Nonnull final UserService userService) {
        this.userService = requireNonNull(userService, "userService");
    }

    @Override
    @Nonnull
    public UserDetails loadUserByUsername(@Nonnull final String username) {
        requireNonNull(username, "username");

        final User user;
        try {
            user = userService.findByUsername(username);
        } catch (final UserNotFoundException ex) {
            throw new UsernameNotFoundException(username, ex);
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(List.of())
                .build();
    }
}
