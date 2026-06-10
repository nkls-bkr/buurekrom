package dev.bruenker.buurekrom.paths.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MetaController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "app.stage=prod")
class MetaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void meta_shouldReturnConfiguredStage() throws Exception {
        mockMvc.perform(get("/api/public/meta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stage").value("prod"));
    }
}
