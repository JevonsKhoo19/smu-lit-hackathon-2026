import { useLocation, useNavigate } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import "./CaseSummary.css";

function CaseSummary() {
    const navigate = useNavigate();
    const location = useLocation();

    const savedCase = (() => {
        try {
            return JSON.parse(
                sessionStorage.getItem(
                    "claimreadyCurrentCase"
                )
            );
        } catch {
            return null;
        }
    })();

    const analysis =
        location.state?.analysis ||
        savedCase?.analysis;

    const caseDetails =
        location.state?.caseDetails ||
        savedCase?.caseDetails;

    if (!analysis || !caseDetails) {
        return (
            <div className="summary-page">
                <main className="summary-no-data">
                    <h1>No case preparation found.</h1>

                    <p>
                        Please start by describing your situation.
                    </p>

                    <button onClick={() => navigate("/case-intake")}>
                        Start Case Preparation
                    </button>
                </main>
            </div>
        );
    }

    const preparedAccount =
        analysis.preparedAccount || "";
    const facts = analysis.facts || [];
    const assumptions = analysis.assumptions || [];
    const consistencyIssues =
        analysis.consistencyIssues || [];
    const missingInformation =
        analysis.missingInformation || [];
    const followUpQuestions =
        analysis.followUpQuestions || [];
    const readinessChecks =
        analysis.readinessChecks || [];
    const evidencePrompts =
        analysis.evidencePrompts || [];


    const DISPUTE_TYPE_LABELS = {
        "goods-services": "Goods or services",
        tenancy: "Residential tenancy / rental",
        "property-damage": "Damage to property",
        other: "Something else",
        unsure: "Not sure",
    };

    const CONTACT_LABELS = {
        yes: "Yes",
        partly: "Partly",
        no: "No",
    };

    return (
        <div className="summary-page">
            {/* HEADER */}
            <AppNavbar />

            {/* PROGRESS */}
            <div className="summary-progress-wrapper">
                <div className="summary-progress">
                    <div className="progress-step completed">
                        <div className="progress-circle">✓</div>

                        <div>
                            <strong>Your situation</strong>
                            <span>Information provided</span>
                        </div>
                    </div>

                    <div className="progress-line completed-line" />

                    <div className="progress-step completed">
                        <div className="progress-circle">✓</div>

                        <div>
                            <strong>Case review</strong>
                            <span>Information reviewed</span>
                        </div>
                    </div>

                    <div className="progress-line completed-line" />

                    <div className="progress-step active">
                        <div className="progress-circle">3</div>

                        <div>
                            <strong>Preparation</strong>
                            <span>Your summary</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <main className="summary-main">
                <section className="summary-content">
                    {/* HEADING */}
                    <div className="summary-heading">
                        <span className="summary-section-label">
                            CASE PREPARATION
                        </span>

                        <h1>Your preparation summary.</h1>

                        <p>
                            Review the information below before relying on it.
                            You can return to earlier steps if anything needs
                            correction or clarification.
                        </p>
                    </div>

                    {/* STATUS */}
                    <div className="summary-status-card">
                        <div className="summary-status-icon">✓</div>

                        <div>
                            <strong>
                                Your information has been organised.
                            </strong>

                            <p>
                                This is a preparation aid, not an assessment of
                                whether your claim will succeed.
                            </p>
                        </div>
                    </div>

                    {/* OVERVIEW */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    YOUR SITUATION
                                </span>

                                <h2>Case overview</h2>
                            </div>

                            <button
                                className="summary-edit-link"
                                onClick={() => navigate("/case-intake")}
                            >
                                Edit
                            </button>
                        </div>

                        <div className="summary-overview-grid">
                            <div>
                                <span>Dispute type</span>

                                <strong>
                                    {DISPUTE_TYPE_LABELS[
                                        caseDetails.disputeType
                                    ] || "Not provided"}
                                </strong>
                            </div>

                            <div>
                                <span>Relevant date</span>

                                <strong>
                                    {caseDetails.date || "Not provided"}
                                </strong>
                            </div>

                            <div>
                                <span>Other party</span>

                                <strong>
                                    {caseDetails.respondentName ||
                                        "Not provided"}
                                </strong>
                            </div>

                            <div>
                                <span>Contact details known</span>

                                <strong>
                                    {CONTACT_LABELS[
                                        caseDetails.respondentContactKnown
                                    ] || "Not provided"}
                                </strong>
                            </div>

                            <div className="summary-overview-wide">
                                <span>Outcome sought</span>

                                <strong>
                                    {caseDetails.outcome ||
                                        "Not provided"}
                                </strong>
                            </div>

                            {caseDetails.desiredOutcome ===
                                "money" &&
                                caseDetails.amount && (
                                    <div>
                                        <span>Amount sought</span>

                                        <strong>
                                            S${caseDetails.amount}
                                        </strong>
                                    </div>
                                )}

                            {caseDetails.desiredOutcome ===
                                "work" &&
                                caseDetails.estimatedWorkValue && (
                                    <div>
                                        <span>
                                            Estimated value of work
                                        </span>

                                        <strong>
                                            S${caseDetails.estimatedWorkValue}
                                        </strong>
                                    </div>
                                )}
                        </div>

                        <div className="summary-story">
                            <span>Your description</span>

                            <p>{caseDetails.dispute}</p>
                        </div>
                    </section>

                    {/* PREPARED ACCOUNT */}
                    {preparedAccount && (
                        <section className="summary-card">
                            <div className="summary-card-heading">
                                <div>
                                    <span className="summary-card-label">
                                        PREPARED ACCOUNT
                                    </span>

                                    <h2>Neutral case summary</h2>
                                </div>

                                <button
                                    className="summary-edit-link"
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            preparedAccount
                                        )
                                    }
                                >
                                    Copy
                                </button>
                            </div>

                            <div className="summary-story">
                                <span>
                                    Prepared from the information you provided
                                </span>

                                <p>{preparedAccount}</p>
                            </div>
                        </section>
                    )}

                    {/* FACTS */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    INFORMATION REVIEW
                                </span>

                                <h2>Key facts identified</h2>
                            </div>

                            <span className="summary-count">
                                {facts.length}
                            </span>
                        </div>

                        {facts.length > 0 ? (
                            <ul className="summary-list">
                                {facts.map((fact, index) => (
                                    <li key={index}>
                                        <span className="summary-list-icon success">
                                            ✓
                                        </span>

                                        <span>{fact}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="summary-empty">
                                No clear facts have been identified yet.
                            </p>
                        )}
                    </section>

                    {/* ASSUMPTIONS */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    RESPONSIBLE AI CHECK
                                </span>

                                <h2>Assumptions to review</h2>
                            </div>

                            <span className="summary-count warning">
                                {assumptions.length}
                            </span>
                        </div>

                        {assumptions.length > 0 ? (
                            <ul className="summary-list">
                                {assumptions.map((assumption, index) => (
                                    <li key={index}>
                                        <span className="summary-list-icon warning">
                                            !
                                        </span>

                                        <span>{assumption}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="summary-empty">
                                No unsupported assumptions were identified.
                            </p>
                        )}
                    </section>

                    {/* CONSISTENCY ISSUES */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    CONSISTENCY CHECK
                                </span>

                                <h2>Information to double-check</h2>
                            </div>

                            <span className="summary-count">
                                {consistencyIssues.length}
                            </span>
                        </div>

                        {consistencyIssues.length > 0 ? (
                            <ul className="summary-list">
                                {consistencyIssues.map((issue, index) => (
                                    <li key={index}>
                                        <span className="summary-list-icon consistency">
                                            ↔
                                        </span>

                                        <span>{issue}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="summary-empty">
                                No meaningful inconsistencies were identified.
                            </p>
                        )}
                    </section>

                    {/* MISSING */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    BEFORE YOU CONTINUE
                                </span>

                                <h2>Information that may still be needed</h2>
                            </div>

                            <span className="summary-count">
                                {missingInformation.length}
                            </span>
                        </div>

                        {missingInformation.length > 0 ? (
                            <ul className="summary-list">
                                {missingInformation.map((item, index) => (
                                    <li key={index}>
                                        <span className="summary-list-icon question">
                                            ?
                                        </span>

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="summary-empty">
                                No major information gaps were identified.
                            </p>
                        )}
                    </section>

                    {/* FOLLOW UPS */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    QUESTIONS TO CONSIDER
                                </span>

                                <h2>Points to clarify</h2>
                            </div>

                            <span className="summary-count">
                                {followUpQuestions.length}
                            </span>
                        </div>

                        {followUpQuestions.length > 0 ? (
                            <ul className="summary-list">
                                {followUpQuestions.map((question, index) => (
                                    <li key={index}>
                                        <span className="summary-list-icon neutral">
                                            ✦
                                        </span>

                                        <span>{question}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="summary-empty">
                                No additional clarification questions were generated.
                            </p>
                        )}
                    </section>

                    {/* READINESS */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    PREPARATION CHECK
                                </span>

                                <h2>Readiness checklist</h2>
                            </div>

                            <span className="summary-count">
                                {readinessChecks.length}
                            </span>
                        </div>

                        {readinessChecks.length > 0 ? (
                            <ul className="summary-list">
                                {readinessChecks.map(
                                    (item, index) => (
                                        <li key={index}>
                                            <span className="summary-list-icon success">
                                                ✓
                                            </span>

                                            <span>{item}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p className="summary-empty">
                                No additional readiness checks were
                                generated.
                            </p>
                        )}
                    </section>


                    {/* EVIDENCE */}
                    <section className="summary-card">
                        <div className="summary-card-heading">
                            <div>
                                <span className="summary-card-label">
                                    EVIDENCE CHECK
                                </span>

                                <h2>Records to consider</h2>
                            </div>

                            <span className="summary-count">
                                {evidencePrompts.length}
                            </span>
                        </div>

                        {evidencePrompts.length > 0 ? (
                            <ul className="summary-list">
                                {evidencePrompts.map(
                                    (item, index) => (
                                        <li key={index}>
                                            <span className="summary-list-icon neutral">
                                                ◫
                                            </span>

                                            <span>{item}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p className="summary-empty">
                                No additional evidence prompts were
                                identified.
                            </p>
                        )}
                    </section>

                    {/* GUIDANCE PLACEHOLDER */}
                    <section className="summary-guidance-card">
                        <div className="guidance-icon">⌕</div>

                        <div className="guidance-content">
                            <span className="summary-card-label">
                                TRUSTED GUIDANCE
                            </span>

                            <h2>
                                Need help understanding the Small Claims process?
                            </h2>

                            <p>
                                Ask ClaimReady procedural questions and receive
                                answers grounded in authoritative sources.
                            </p>
                        </div>

                        <button
                            className="summary-primary-button"
                            onClick={() => navigate("/ask")}
                        >
                            Ask ClaimReady
                            <span>→</span>
                        </button>
                    </section>

                    {/* DISCLAIMER */}
                    <div className="summary-disclaimer">
                        <div className="summary-disclaimer-icon">
                            i
                        </div>

                        <div>
                            <strong>
                                Legal information, not legal advice
                            </strong>

                            <p>
                                ClaimReady helps organise information and provide
                                general procedural guidance. It does not predict
                                outcomes or recommend legal strategy.
                            </p>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="summary-actions">
                        <button
                            className="summary-back-button"
                            onClick={() =>
                                navigate("/case-analysis", {
                                    state: {
                                        analysis,
                                        caseDetails,
                                    },
                                })
                            }
                        >
                            ← Back to Case Review
                        </button>

                        <div className="summary-actions-right">
                            <button
                                className="summary-secondary-button"
                                onClick={() => window.print()}
                            >
                                Print Summary
                            </button>

                            <button
                                className="summary-primary-button"
                                onClick={() => navigate("/ask")}
                            >
                                Ask ClaimReady
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* SIDEBAR */}
                <aside className="summary-sidebar">
                    <div className="summary-sidebar-card">
                        <span className="sidebar-label">
                            PREPARATION CHECK
                        </span>

                        <h3>What you've completed</h3>

                        <div className="preparation-item completed">
                            <span>✓</span>
                            <div>
                                <strong>Situation described</strong>
                                <p>Your initial account has been recorded.</p>
                            </div>
                        </div>

                        <div className="preparation-item completed">
                            <span>✓</span>
                            <div>
                                <strong>Information reviewed</strong>
                                <p>Facts and assumptions have been separated.</p>
                            </div>
                        </div>

                        <div className="preparation-item">
                            <span>3</span>
                            <div>
                                <strong>Review remaining gaps</strong>
                                <p>
                                    Check any missing information before proceeding.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="summary-sidebar-card">
                        <span className="sidebar-label">
                            OFFICIAL GUIDANCE
                        </span>

                        <h3>Need help with the SCT process?</h3>

                        <p className="summary-sidebar-text">
                            Ask procedural questions and receive answers grounded
                            in official Singapore Courts sources.
                        </p>

                        <button
                            className="summary-ask-button"
                            onClick={() => navigate("/ask")}
                        >
                            Ask ClaimReady
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default CaseSummary;