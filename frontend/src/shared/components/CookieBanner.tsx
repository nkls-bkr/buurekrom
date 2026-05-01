import CookieConsent from "react-cookie-consent";

export function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Verstanden"
      cookieName="buurekrom-cookie-consent"
      expires={365}
      disableStyles
      containerClasses="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 border-t bg-card/95 p-4 text-body-sm text-card-foreground shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between"
      contentClasses="flex-1"
      buttonClasses="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-label-md font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
    >
      Buurekrom verwendet ausschließlich technisch notwendige Cookies, um die
      Anmeldung zu ermöglichen. Es findet kein Tracking statt.
    </CookieConsent>
  );
}
