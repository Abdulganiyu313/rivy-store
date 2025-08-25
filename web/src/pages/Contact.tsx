import { FormEvent, useState } from "react";
import styles from "./Contact.module.css";

type RequestState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<RequestState>("idle");

  // Robust background src with automatic fallbacks
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");
  const WEBP = `${BASE}contact-hero.webp`;
  const JPG = `${BASE}contact-hero.jpg`;
  const JPEG = `${BASE}contact-hero.jpeg`;

  const [bgSrc, setBgSrc] = useState<string>(WEBP);
  const [imgLoaded, setImgLoaded] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      // await fetch("/api/contact", { method: "POST", body: new FormData(e.currentTarget) });
      await new Promise((r) => setTimeout(r, 600));
      setStatus("success");
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.page} role="main" aria-labelledby="contact-heading">
      {/* Header with background image (no fallback color) */}
      <section className={styles.header}>
        <div
          className={styles.media}
          data-loaded={imgLoaded ? "true" : "false"}
          aria-hidden="true"
        >
          <img
            className={styles.bg}
            src={bgSrc}
            alt=""
            role="presentation"
            loading="eager"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              // WebP -> JPG -> JPEG -> give up
              if (bgSrc === WEBP) setBgSrc(JPG);
              else if (bgSrc === JPG) setBgSrc(JPEG);
              else setImgLoaded(false);
            }}
          />
          <div className={styles.overlay} />
        </div>

        <div className={styles.headerInner}>
          <h1 id="contact-heading" className={styles.title}>
            Talk to an energy expert
          </h1>
          <p className={styles.subtitle}>
            Get a free consultation to size, finance, and deploy the right solar
            solution for your home or business. Our engineers will review your
            load profile, budget, and timeline, and recommend a system that
            fits.
          </p>
          <ul className={styles.badges} aria-label="Highlights">
            <li>Personalized system design</li>
            <li>Financing guidance</li>
            <li>Fast, friendly support</li>
          </ul>
        </div>
      </section>

      {/* Content */}
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Ways to reach us">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Quick contacts</h2>
            <ul className={styles.contactList}>
              <li>
                <span aria-hidden="true" className={styles.dot} />
                <a href="mailto:hello@rivy.co" className={styles.link}>
                  hello@rivy.co
                </a>
              </li>
              <li>
                <span aria-hidden="true" className={styles.dot} />
                <a href="tel:+2348000000000" className={styles.link}>
                  +234 800 000 0000
                </a>
              </li>
              <li>
                <span aria-hidden="true" className={styles.dot} />
                <a
                  href="https://wa.me/2348000000000"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.link}
                >
                  WhatsApp chat
                </a>
              </li>
            </ul>
            <div className={styles.meta}>
              <div>
                <strong>Hours</strong>
                <div>Mon–Fri, 9:00–18:00 WAT</div>
              </div>
              <div>
                <strong>Office</strong>
                <div>174B Corporation drive, Dolphin Estate, Ikoyi, Lagos</div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>What to expect</h2>
            <ol className={styles.steps}>
              <li>Share your goals and approximate budget.</li>
              <li>We size a system and discuss financing options.</li>
              <li>Get a proposal with timeline and next steps.</li>
            </ol>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Why choose us</h2>
            <ul className={styles.bullets}>
              <li>Tier-1 hardware and bankable warranties</li>
              <li>Certified installers across West Africa</li>
              <li>Transparent pricing and flexible payments</li>
            </ul>
          </div>
        </aside>

        <section
          className={styles.formWrap}
          aria-label="Consultation request form"
        >
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Request a free consultation</h2>

            <form onSubmit={onSubmit} className={styles.form} noValidate>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="firstName" className={styles.label}>
                    First name
                    <span className={styles.req} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="lastName" className={styles.label}>
                    Last name
                    <span className={styles.req} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                    <span className={styles.req} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    inputMode="email"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone (optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    inputMode="tel"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="company" className={styles.label}>
                    Company / Homeowner
                  </label>
                  <input id="company" name="company" className={styles.input} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="location" className={styles.label}>
                    Location (City, Country)
                  </label>
                  <input
                    id="location"
                    name="location"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="interest" className={styles.label}>
                    I’m interested in
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    className={styles.select}
                  >
                    <option>Complete Solar System</option>
                    <option>Panels only</option>
                    <option>Inverters</option>
                    <option>Batteries / Storage</option>
                    <option>Financing consultation</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="budget" className={styles.label}>
                    Budget range (NGN)
                  </label>
                  <select id="budget" name="budget" className={styles.select}>
                    <option>Under ₦500,000</option>
                    <option>₦500,000 – ₦2,000,000</option>
                    <option>₦2,000,000 – ₦5,000,000</option>
                    <option>₦5,000,000 – ₦10,000,000</option>
                    <option>Over ₦10,000,000</option>
                  </select>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor="timeline" className={styles.label}>
                    Project timeline
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    className={styles.select}
                  >
                    <option>ASAP</option>
                    <option>1–3 months</option>
                    <option>3–6 months</option>
                    <option>6+ months</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="contactPref" className={styles.label}>
                    Preferred contact
                  </label>
                  <select
                    id="contactPref"
                    name="contactPref"
                    className={styles.select}
                  >
                    <option>Email</option>
                    <option>Phone</option>
                    <option>WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="message" className={styles.label}>
                  Tell us a bit more
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className={styles.textarea}
                />
              </div>

              <label className={styles.check}>
                <input type="checkbox" name="consent" required />
                <span>
                  I agree to be contacted about my request and related products.
                  <span className={styles.req} aria-hidden="true">
                    {" "}
                    *
                  </span>
                </span>
              </label>

              <div className={styles.actions}>
                <button
                  className={styles.btnPrimary}
                  disabled={status === "submitting"}
                  aria-busy={status === "submitting" || undefined}
                >
                  {status === "submitting"
                    ? "Sending..."
                    : "Request consultation"}
                </button>
                <a
                  href="mailto:hello@energystack.example"
                  className={styles.btnGhost}
                >
                  Email us instead
                </a>
              </div>

              <div aria-live="polite" className={styles.formNote}>
                {status === "success" && (
                  <p className={styles.success}>
                    Thanks! We’ll be in touch within{" "}
                    <strong>1 business day</strong>.
                  </p>
                )}
                {status === "error" && (
                  <p className={styles.error}>
                    Something went wrong. Please refresh and try again.
                  </p>
                )}
              </div>
            </form>
          </div>

          <div id="faqs" className={styles.faqCard}>
            <h2 className={styles.cardTitle}>FAQs</h2>
            <details>
              <summary>Do you offer financing?</summary>
              <p>
                Yes—tenors up to 36 months for qualified customers. We’ll review
                options during your call.
              </p>
            </details>
            <details>
              <summary>How do you size my system?</summary>
              <p>
                We analyse your load (appliances, hours), usage patterns, and
                roof/space constraints to recommend capacity.
              </p>
            </details>
            <details>
              <summary>Where do you operate?</summary>
              <p>
                We support customers across Nigeria and select West African
                countries through certified partners.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
