import { createFileRoute } from "@tanstack/react-router";
import { EmailBrandingSettings } from "@/components/settings/EmailBrandingSettings";

export const Route = createFileRoute("/_authenticated/settings/email-branding")({
  component: EmailBrandingSettingsRoute,
});

function EmailBrandingSettingsRoute() {
  return <EmailBrandingSettings />;
}
