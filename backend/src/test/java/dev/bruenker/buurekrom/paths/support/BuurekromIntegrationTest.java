package dev.bruenker.buurekrom.paths.support;

import dev.bruenker.buurekrom.paths.model.User;
import dev.bruenker.buurekrom.paths.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;

public abstract class BuurekromIntegrationTest extends BuurekromTestcontainersTest {

    protected static final String TEST_USERNAME = "tonystark";
    protected static final String TEST_PASSWORD = "password";

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void ensureTestUserExists() {
        userRepository.findByUsername(TEST_USERNAME)
                .orElseGet(() -> userRepository.save(new User(null, TEST_USERNAME, TEST_PASSWORD, LocalDateTime.now())));
    }
}
