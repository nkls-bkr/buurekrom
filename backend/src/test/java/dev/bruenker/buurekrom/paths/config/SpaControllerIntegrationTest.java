package dev.bruenker.buurekrom.paths.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SpaController.class)
@AutoConfigureMockMvc(addFilters = false)
class SpaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldForwardToIndexHtml_whenCallingRoot() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("index.html"));
    }

    @Test
    void shouldForwardToRoot_whenCallingUnknownUrl() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/"));
    }

    @Test
    void shouldForwardToRoot_whenCallingNestedPath() throws Exception {
        mockMvc.perform(get("/settings/profile"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/"));
    }

    @Test
    void shouldForwardToRoot_whenPathIsDeeplyNested() throws Exception {
        mockMvc.perform(get("/admin/users/42/edit"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/"));
    }

    @Test
    void shouldNotIntercept_whenStaticFilesAreRequested() throws Exception {
        mockMvc.perform(get("/assets/app.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("console.log();")));
    }

    @Test
    void shouldNotIntercept_whenFileIsCssFile() throws Exception {
        mockMvc.perform(get("/assets/style.css"))
                .andExpect(status().isOk())
                .andExpect(content().string("h1{color: #000000;}"));
    }

    @Test
    void shouldNotIntercept_whenFileIsImage() throws Exception {
        mockMvc.perform(get("/assets/buurekrom.png"))
                .andExpect(status().isOk());
    }
}