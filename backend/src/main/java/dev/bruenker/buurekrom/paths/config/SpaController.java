package dev.bruenker.buurekrom.paths.config;

import jakarta.annotation.Nonnull;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @Nonnull
    @RequestMapping(value = "/{path:[^.]*}")
    public String redirect() {
        return "forward:/";
    }
}
