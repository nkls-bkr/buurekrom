package dev.bruenker.buurekrom.paths.service;

import dev.bruenker.buurekrom.paths.model.User;
import dev.bruenker.buurekrom.paths.exception.UserNotFoundException;
import dev.bruenker.buurekrom.paths.repository.UserRepository;
import dev.bruenker.buurekrom.paths.exception.UsernameAlreadyTakenException;
import jakarta.annotation.Nonnull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static java.util.Objects.requireNonNull;

@Service
public class UserService {

    @Nonnull
    private final UserRepository userRepository;

    @Nonnull
    private final PasswordEncoder passwordEncoder;

    public UserService(
            @Nonnull final UserRepository userRepository,
            @Nonnull final PasswordEncoder passwordEncoder
    ) {
        this.userRepository = requireNonNull(userRepository, "userRepository");
        this.passwordEncoder = requireNonNull(passwordEncoder, "passwordEncoder");
    }

    @Nonnull
    @Transactional(readOnly = true)
    public User findByUsername(@Nonnull final String username) {
        requireNonNull(username, "username");

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    @Nonnull
    @Transactional
    public User create(@Nonnull final String username, @Nonnull final String rawPassword) {
        requireNonNull(username, "username");
        requireNonNull(rawPassword, "rawPassword");

        if (userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyTakenException(username);
        }

        final String encodedPassword = requireNonNull(passwordEncoder.encode(rawPassword));

        final User user = new User(
                null,
                username,
                encodedPassword,
                null
        );

        return userRepository.save(user);
    }
}
