import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  const version = (import.meta as any)?.env?.VITE_APP_VERSION ?? "";

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">
        <div className="site-footer__copy">
          ©{year} Abdulganiyu. All rights reserved.
          {version ? ` v${version}` : ""}
        </div>

        <div className="site-footer__legal">
          <span className="site-footer__badge" aria-hidden>
            <path d="M12 2l7 3v6c0 5-3.8 9.4-7 11-3.2-1.6-7-6-7-11V5l7-3z" />
          </span>
          <span>
            Read our <Link to="/terms">Terms Policy</Link> –{" "}
            <Link to="/privacy">Privacy Policy</Link> –{" "}
            <Link to="/faqs">FAQs</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
