package dev.bruenker.buurekrom.paths.config;

import dev.bruenker.buurekrom.paths.support.BuurekromTestcontainersTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@TestPropertySource(properties = {
        "spring.web.resources.static-locations=classpath:/mock-ui-folder/"
})
class SpaControllerIntegrationTest extends BuurekromTestcontainersTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void redirect() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(content().string("This is a mock UI folder"))
                .andExpect(status().isOk());
    }

    @Test
    void forwardsExtensionlessPathToRoot() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/"));
    }

    @Test
    void forwardsNestedExtensionlessPathToRoot() throws Exception {
        mockMvc.perform(get("/fields/123/edit"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/"));
    }

    @Test
    void doesNotForwardPathWithFileExtension() throws Exception {
        mockMvc.perform(get("/missing.js"))
                .andExpect(status().isNotFound());
    }

    @Test
    void servesNestedStaticAsset() throws Exception {
        mockMvc.perform(get("/assets/test.js"))
                .andExpect(status().isOk())
                .andExpect(content().string("console.log(\"This is a mock JS file\");\n"));
    }
}