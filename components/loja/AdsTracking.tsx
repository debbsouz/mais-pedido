import Script from "next/script";

import type { StorefrontTracking } from "@/lib/storefront/types";

interface AdsTrackingProps {
  tracking: StorefrontTracking;
}

/**
 * Injeta o Pixel do Meta e/ou a tag do Google Ads na loja pública,
 * só quando a organização cadastrou o ID em Configurações. Sem
 * ID cadastrado, não injeta nada — nenhum rastreador de exemplo.
 */
export function AdsTracking({ tracking }: AdsTrackingProps) {
  return (
    <>
      {tracking.metaPixelId && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
          >
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${tracking.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>

          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${tracking.metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {tracking.googleAdsId && (
        <>
          <Script
            id="google-ads-lib"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${tracking.googleAdsId}`}
          />

          <Script
            id="google-ads-config"
            strategy="afterInteractive"
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${tracking.googleAdsId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
