package dev.bruenker.buurekrom.paths.config;

import jakarta.annotation.Nonnull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class ClockConfig {

    @Bean
    @Nonnull
    public Clock clock() {
        return Clock.systemUTC();
    }
}
