import {
  InstagramLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";

import type { StorefrontSocial } from "@/lib/storefront/types";

interface SocialLinksProps {
  social: StorefrontSocial;
}

export function SocialLinks({ social }: SocialLinksProps) {
  const hasAny = social.whatsapp || social.instagram;

  if (!hasAny) {
    return null;
  }

  return (
    <div className="storefront__social-row">
      {social.whatsapp && (
        <a
          href={social.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="storefront__social-link"
          aria-label="Falar no WhatsApp"
        >
          <WhatsappLogo size={15} />
        </a>
      )}

      {social.instagram && (
        <a
          href={social.instagram}
          target="_blank"
          rel="noreferrer"
          className="storefront__social-link"
          aria-label="Instagram"
        >
          <InstagramLogo size={15} />
        </a>
      )}
    </div>
  );
}
