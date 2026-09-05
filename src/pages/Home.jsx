import { useNavigate } from "react-router-dom";
import "./Home.css";
import AppNavbar from "../components/AppNavbar";
import ScrollReveal from "../components/ScrollReveal";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <AppNavbar />

      {/* HERO */}
      <main>
        <section className="home-hero">
          <div className="home-hero-content">
            <div className="home-badge">
              RESPONSIBLE SMALL CLAIMS PREPARATION
            </div>

            <h1>
              Get your Small Claims information in order
              <span> before you file.</span>
            </h1>

            <p className="home-hero-description">
              Describe what happened in your own words. ClaimReady helps separate
              facts from assumptions, spot missing or conflicting information, and
              answer procedural questions using official Singapore Courts sources.
            </p>

            <div className="home-hero-buttons">
              <button
                className="home-primary-button"
                onClick={() => navigate("/case-intake")}
              >
                Start Case Preparation
                <span>→</span>
              </button>

              <button
                className="home-secondary-button"
                onClick={() => navigate("/ask")}
              >
                Ask ClaimReady
              </button>
            </div>

            <div className="home-trust-row">
              <div>✓ Guided step-by-step</div>
              <div>✓ Official-source grounding</div>
              <div>✓ Designed to challenge assumptions</div>
            </div>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="home-preview-wrapper">
            <div className="home-preview-card">
              <div className="preview-header">
                <div>
                  <span className="preview-label">CASE REVIEW</span>
                  <h3>Your information, organised.</h3>
                </div>

                <span className="preview-status">In progress</span>
              </div>

              <div className="preview-item">
                <div className="preview-icon preview-success">✓</div>

                <div>
                  <strong>Facts identified</strong>
                  <p>Payment of S$1,200 was made.</p>
                </div>
              </div>

              <div className="preview-item">
                <div className="preview-icon preview-warning">!</div>

                <div>
                  <strong>Assumption detected</strong>
                  <p>
                    “The seller intentionally scammed me” may not yet be
                    supported by the information provided.
                  </p>
                </div>
              </div>

              <div className="preview-item">
                <div className="preview-icon preview-question">?</div>

                <div>
                  <strong>Information still needed</strong>
                  <p>Was a specific delivery date agreed?</p>
                </div>
              </div>

              <div className="preview-divider" />

              <div className="preview-footer">
                <span>Assumption Check</span>
                <strong>1 item needs review</strong>
              </div>
            </div>

            <div className="home-floating-card">
              <span className="floating-icon">✓</span>

              <div>
                <strong>Responsible by design</strong>
                <p>No outcome predictions or invented legal advice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* THREE CORE FEATURES */}
        <ScrollReveal
          as="section"
          className="home-section"
        >
          <div className="home-section-heading">
            <span>HOW CLAIMREADY HELPS</span>

            <h2>A clearer way to prepare before filing.</h2>

            <p>
              Organise your account, identify uncertainty and check procedural
              information without relying on an AI system to simply agree with you.
            </p>
          </div>

          <div className="home-feature-grid">
            <ScrollReveal
              className="home-feature-card"
              delay={0}
            >
              <div className="feature-number">01</div>

              <div className="feature-icon">✦</div>

              <h3>Organise your situation</h3>

              <p>
                Explain what happened naturally. ClaimReady turns your account
                into clear facts, dates and missing information.
              </p>

              <button onClick={() => navigate("/case-intake")}>
                Prepare my case →
              </button>
            </ScrollReveal>

            <ScrollReveal
              className="home-feature-card"
              delay={90}
            >
              <div className="feature-number">02</div>

              <div className="feature-icon">⚖</div>

              <h3>Check your assumptions</h3>

              <p>
                Separate what you know from what you believe, and identify
                statements that may need more evidence or clarification.
              </p>

              <button onClick={() => navigate("/case-intake")}>
                Start assumption check →
              </button>
            </ScrollReveal>

            <ScrollReveal
              className="home-feature-card"
              delay={180}
            >
              <div className="feature-number">03</div>

              <div className="feature-icon">⌕</div>

              <h3>Ask trusted questions</h3>

              <p>
                Ask questions about the Small Claims process and receive answers
                grounded in official Singapore Courts sources.
              </p>

              <button onClick={() => navigate("/ask")}>
                Ask ClaimReady →
              </button>
            </ScrollReveal>
          </div>
        </ScrollReveal>

        {/* RESPONSIBLE AI SECTION */}
        <ScrollReveal
          as="section"
          className="home-responsible-section"
          variant="fade-up"
        >
          <div className="responsible-left">
            <span className="responsible-label">RESPONSIBLE AI</span>

            <h2>
              AI should help you think clearly,
              <br />
              not simply agree with you.
            </h2>

            <p>
              ClaimReady is designed to identify uncertainty and unsupported
              assumptions instead of presenting every AI-generated statement
              as fact.
            </p>
          </div>

          <div className="responsible-points">
            <div className="responsible-point">
              <span>01</span>

              <div>
                <strong>Facts before conclusions</strong>
                <p>
                  We distinguish what you stated from conclusions that may
                  require further support.
                </p>
              </div>
            </div>

            <div className="responsible-point">
              <span>02</span>

              <div>
                <strong>Trusted information</strong>
                <p>
                  Procedural guidance is grounded in official sources rather than
                  relying only on an AI model's memory.
                </p>
              </div>
            </div>

            <div className="responsible-point">
              <span>03</span>

              <div>
                <strong>Clear boundaries</strong>
                <p>
                  ClaimReady does not predict case outcomes or tell users what
                  legal strategy to pursue.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* DISCLAIMER */}
        <ScrollReveal
          as="section"
          className="home-disclaimer"
        >
          <div className="disclaimer-icon">i</div>

          <div>
            <strong>Legal information, not legal advice</strong>

            <p>
              ClaimReady is designed to support case preparation and provide
              general procedural information. It does not replace advice from a
              qualified legal professional.
            </p>
          </div>
        </ScrollReveal>
      </main>

      <footer className="home-footer">
        <div>
          <strong>ClaimReady</strong>
          <span>Built for responsible use of Generative AI.</span>
        </div>

        <span>SMU LIT Legal-Tech Hackathon 2026</span>
      </footer>
    </div>
  );
}

export default Home;