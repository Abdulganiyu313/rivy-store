import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";

type HeroProps = {
  headline?: string;
  subheading?: string;
  primaryHref?: string;
  secondaryHref?: string;
  remoteImageUrl?: string;
  alt?: string;
  eager?: boolean;
  useLocalWebP?: boolean;
  imageDir?: string;
  imageName?: string;
  align?: "left" | "center";
};

const LOCAL_WEBP = "/hero.webp";
const LOCAL_JPG = "/hero.jpg";

export default function Hero({
  headline = "Clean, smart solar for your Home and Business.",
  subheading = "Reliable, finance-friendly energy solutions for Africa.",
  primaryHref = "#catalog",
  secondaryHref = "/catalog#contact",
  remoteImageUrl,
  alt = "Wind farm with turbines at sunset",
  eager = true,
  align = "left",
}: HeroProps) {
  const [loaded, setLoaded] = useState(false);
  const isRemote = Boolean(remoteImageUrl);

  return (
    <section className={styles.hero} role="banner" aria-label="Site hero">
      {/* Media (full-bleed) */}
      <div className={styles.media} data-loaded={loaded ? "true" : "false"}>
        <picture>
          {!isRemote && <source srcSet={LOCAL_WEBP} type="image/webp" />}
          <img
            className={styles.bgImage}
            src={isRemote ? (remoteImageUrl as string) : LOCAL_JPG}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
          />
        </picture>
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      {/* Content container (max-width, centered) */}
      <div className={styles.inner}>
        <div className={styles.content} data-align={align}>
          <h1 className={styles.headline}>{headline}</h1>
          <p className={styles.subheading}>{subheading}</p>

          <div className={styles.ctas}>
            {/* Anchor to in-page #catalog for smooth scroll */}
            <a
              href={primaryHref}
              className={styles.primaryCta}
              aria-label="Shop Solar Solutions"
            >
              Shop Solar Solutions
            </a>

            {/* Use React Router for internal navigation */}
            <Link
              to={secondaryHref}
              className={styles.secondaryCta}
              aria-label="Talk to an expert"
            >
              Talk to an expert
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
