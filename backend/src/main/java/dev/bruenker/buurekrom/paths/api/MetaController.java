package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.api.response.MetaResponse;
import jakarta.annotation.Nonnull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.util.Objects.requireNonNull;

@RestController
@RequestMapping("/api/public/meta")
public class MetaController {

    @Nonnull
    private final String stage;

    public MetaController(@Value("${app.stage:local}") @Nonnull final String stage) {
        this.stage = requireNonNull(stage, "stage");
    }

    @GetMapping
    @Nonnull
    public MetaResponse meta() {
        return new MetaResponse(stage);
    }
}
