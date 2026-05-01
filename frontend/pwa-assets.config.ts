import {
  combinePresetAndAppleSplashScreens,
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: combinePresetAndAppleSplashScreens(preset, {
    padding: 0.3,
    resizeOptions: {
      background: "#ffffff",
      fit: "contain",
    },
    darkResizeOptions: {
      background: "#17341d",
      fit: "contain",
    },
    linkMediaOptions: {
      log: true,
      addMediaScreen: true,
      basePath: "/",
      xhtml: false,
    },
  }),
  images: ["public/buurekrom_512x512.png"],
});
