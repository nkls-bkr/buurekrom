package dev.bruenker.buurekrom.paths.config;

import jakarta.annotation.Nonnull;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping({
            "/",
            "/{path:^(?!api$|actuator$|assets$)[^.]+}",
            "/{path:^(?!api$|actuator$|assets$)[^.]+}/**"
    })
    @Nonnull
    public String forward() {
        return "forward:/index.html";
    }
}
