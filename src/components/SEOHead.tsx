import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  type?: string;
  image?: string;
  url?: string;
  jsonLd?: Record<string, any>;
}

export function SEOHead({ title, description, type = "website", image, url, jsonLd }: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Akwantuo`;

    // Update meta tags
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("twitter:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", type);
    if (image) setMeta("og:image", image);
    if (url) setMeta("og:url", url);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);

    // JSON-LD
    if (jsonLd) {
      let script = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({ "@context": "https://schema.org", ...jsonLd });
    }

    return () => {
      // Clean up JSON-LD on unmount
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
    };
  }, [title, description, type, image, url, jsonLd]);

  return null;
}
