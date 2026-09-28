package dev.bruenker.buurekrom.paths.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.bruenker.buurekrom.paths.config.JacksonConfig;
import dev.bruenker.buurekrom.paths.config.SecurityConfig;
import dev.bruenker.buurekrom.paths.service.AuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {AuthController.class, MetaController.class},
        properties = "app.beta-password=test-beta-password")
@Import({SecurityConfig.class, JacksonConfig.class, AuthService.class})
class BetaAuthTest {

    @Autowired
    private MockMvc mvc;

    @ParameterizedTest
    @ValueSource(strings = {"/api/auth/session", "/api/fields", "/api/routes", "/api/locations",
            "/api/shared/routes", "/api/meta", "/api/public/routes/token"})
    void rejectsAnonymousAccess(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isUnauthorized());
    }

    @Test
    void creatingShareLinksStillRequiresBetaAccess() throws Exception {
        final Cookie csrf = csrfCookie();
        mvc.perform(post("/api/routes/1/share").cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void passwordOnlyLoginPersistsSessionAndLogoutRevokesAccess() throws Exception {
        final Cookie csrf = csrfCookie();
        final MockHttpSession beforeLogin = new MockHttpSession();
        final String oldId = beforeLogin.getId();
        final var result = mvc.perform(post("/api/auth/login")
                        .session(beforeLogin).cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"test-beta-password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").doesNotExist())
                .andReturn();
        final var session = (MockHttpSession) result.getRequest().getSession(false);
        assertThat(session).isNotNull();
        assertThat(session.getId()).isNotEqualTo(oldId);
        mvc.perform(get("/api/auth/session").session(session))
                .andExpect(status().isOk()).andExpect(jsonPath("$.authenticated").value(true));
        mvc.perform(get("/api/meta").session(session)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").session(session)
                        .cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue()))
                .andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
        mvc.perform(get("/api/auth/session")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordDoesNotCreateSession() throws Exception {
        final Cookie csrf = csrfCookie();
        final var result = mvc.perform(post("/api/auth/login")
                        .cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized()).andReturn();
        assertThat(result.getRequest().getSession(false)).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"password\":\"\"}", "{\"password\":\"   \"}"})
    void rejectsMissingOrBlankPassword(String body) throws Exception {
        final Cookie csrf = csrfCookie();
        mvc.perform(post("/api/auth/login").cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void requiresCsrfForLoginAndLogout() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"test-beta-password\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout")).andExpect(status().isForbidden());
    }

    @Test
    void blankConfiguredPasswordFailsClosed() {
        assertThatThrownBy(() -> new SecurityConfig(new ObjectMapper()).authenticationManager("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private Cookie csrfCookie() throws Exception {
        final Cookie cookie = mvc.perform(get("/api/auth/session"))
                .andExpect(status().isUnauthorized()).andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertThat(cookie).isNotNull();
        return cookie;
    }
}
