import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import "./CaseAnalysis.css";

function CaseAnalysis() {
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

  const initialAnalysis =
    location.state?.analysis ||
    savedCase?.analysis;

  const caseDetails =
    location.state?.caseDetails ||
    savedCase?.caseDetails;

  const initialClarificationHistory =
    savedCase?.clarificationHistory || [];

  const [analysis, setAnalysis] =
    useState(initialAnalysis);

  const [clarificationAnswers, setClarificationAnswers] = useState({});
  const [reanalysing, setReanalysing] = useState(false);
  const [clarificationError, setClarificationError] = useState("");
  const [
    clarificationHistory,
    setClarificationHistory,
  ] = useState(
    initialClarificationHistory
  );
  const [reviewUpdated, setReviewUpdated] = useState(false);
  const [openingSummary, setOpeningSummary] = useState(false);

  const [changedSections, setChangedSections] = useState([]);

  const reviewTopRef = useRef(null);

  const facts = analysis?.facts || [];
  const assumptions = analysis?.assumptions || [];
  const consistencyIssues = analysis?.consistencyIssues || [];
  const missingInformation = analysis?.missingInformation || [];
  const followUpQuestions = analysis?.followUpQuestions || [];

  const readinessChecks =
    analysis?.readinessChecks || [];

  const evidencePrompts =
    analysis?.evidencePrompts || [];

  const getChangedSections = (previousAnalysis, nextAnalysis) => {
    const sections = [
      ["facts", "Facts"],
      ["assumptions", "Assumptions"],
      ["consistencyIssues", "Consistency"],
      ["missingInformation", "Information gaps"],
      ["followUpQuestions", "Follow-up questions"],
      ["readinessChecks", "Readiness"],
      ["evidencePrompts", "Evidence prompts"],
    ];

    return sections
      .filter(([key]) => {
        const before =
          previousAnalysis?.[key] || [];

        const after =
          nextAnalysis?.[key] || [];

        return (
          JSON.stringify(before) !==
          JSON.stringify(after)
        );
      })
      .map(([, label]) => label);
  };

  const renderList = (items, emptyMessage) => {
    if (!items || items.length === 0) {
      return (
        <div className="analysis-empty">
          <span>✓</span>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <ul className="analysis-list">
        {items.map((item, index) => (
          <li key={index}>
            <span className="list-dot" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  const handleReanalyse = async () => {
    const answeredClarifications = followUpQuestions
      .map((question, index) => ({
        question,
        answer: (clarificationAnswers[index] || "").trim(),
      }))
      .filter((item) => item.answer);

    const allClarifications = [
      ...clarificationHistory,
      ...answeredClarifications,
    ];

    if (answeredClarifications.length === 0) {
      setClarificationError(
        "Answer at least one clarification question before updating the review."
      );
      return;
    }

    try {
      setReanalysing(true);
      setClarificationError("");
      setReviewUpdated(false);

      const response = await fetch(
        import.meta.env.VITE_CLAIMREADY_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dispute: caseDetails.dispute,
            date: caseDetails.date,

            disputeType: caseDetails.disputeType,

            respondentName:
              caseDetails.respondentName,
            respondentContactKnown:
              caseDetails.respondentContactKnown,

            desiredOutcome:
              caseDetails.desiredOutcome,

            amount:
              caseDetails.amount,

            outcome:
              caseDetails.outcome,

            workRequested:
              caseDetails.workRequested,
            estimatedWorkValue:
              caseDetails.estimatedWorkValue,
            returnRequested:
              caseDetails.returnRequested,

            evidenceTypes:
              caseDetails.evidenceTypes || [],

            resolutionAttempted:
              caseDetails.resolutionAttempted,
            resolutionDetails:
              caseDetails.resolutionDetails,

            clarifications:
              allClarifications,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update case review."
        );
      }

      const changes = getChangedSections(
        analysis,
        data.analysis
      );

      sessionStorage.setItem(
        "claimreadyCurrentCase",
        JSON.stringify({
          analysis: data.analysis,
          caseDetails,
          clarificationHistory:
            allClarifications,
        })
      );

      setAnalysis(data.analysis);
      setChangedSections(changes);

      setClarificationHistory(
        allClarifications
      );

      setClarificationAnswers({});

      setReviewUpdated(true);

      setTimeout(() => {
        reviewTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    } catch (error) {
      console.error("Re-analysis error:", error);

      setClarificationError(
        "We could not update your case review. Please try again."
      );
    } finally {
      setReanalysing(false);
    }
  };

  const handleContinueToSummary = () => {
    setOpeningSummary(true);

    window.setTimeout(() => {
      navigate("/case-summary", {
        state: {
          analysis,
          caseDetails,
        },
      });
    }, 650);
  };

  if (!analysis) {
    return (
      <div className="analysis-page">
        <AppNavbar />

        <main className="analysis-no-data">
          <h1>No case information found.</h1>

          <p>
            Please describe your situation first so ClaimReady can review it.
          </p>

          <button onClick={() => navigate("/case-intake")}>
            Go to Case Intake
          </button>
        </main>
      </div>
    );
  }

  const issueCount =
    assumptions.length +
    consistencyIssues.length +
    missingInformation.length +
    followUpQuestions.length;

  const answeredThisRound = Object.values(clarificationAnswers).filter(
    (answer) => answer.trim()
  ).length;

  const previousAnswersCount = clarificationHistory.length;

  return (
    <div className="analysis-page">
      {openingSummary && (
        <div className="summary-transition-overlay">
          <div className="summary-transition-content">
            <div className="summary-transition-spinner-large" />

            <strong>Preparing your summary</strong>

            <p>
              Organising your reviewed information into a clear,
              neutral account.
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="analysis-header">
        <div
          className="analysis-brand"
          onClick={() => navigate("/")}
        >
          <div className="analysis-logo">C</div>

          <div>
            <div className="analysis-brand-name">ClaimReady</div>
            <div className="analysis-brand-subtitle">
              Small Claims Preparation Assistant
            </div>
          </div>
        </div>

        <button
          className="analysis-exit-button"
          onClick={() => navigate("/")}
        >
          Exit
        </button>
      </header>

      {/* PROGRESS */}
      <div className="analysis-progress-wrapper">
        <div className="analysis-progress">
          <div className="progress-step completed">
            <div className="progress-circle">✓</div>

            <div>
              <strong>Your situation</strong>
              <span>Information provided</span>
            </div>
          </div>

          <div className="progress-line completed-line" />

          <div className="progress-step active">
            <div className="progress-circle">2</div>

            <div>
              <strong>Case review</strong>
              <span>Check facts and assumptions</span>
            </div>
          </div>

          <div className="progress-line" />

          <div className="progress-step">
            <div className="progress-circle">3</div>

            <div>
              <strong>Preparation</strong>
              <span>Review your summary</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="analysis-main">
        <section className="analysis-content">
          {/* HEADING */}
          <div
            className="analysis-heading"
            ref={reviewTopRef}
          >
            <span className="analysis-section-label">
              CASE REVIEW
            </span>

            <h1>Here’s what we understand so far.</h1>

            <p>
              ClaimReady has separated the information you provided into
              stated facts, assumptions and areas that may need clarification.
            </p>
            {reviewUpdated && (
              <div className="review-change-banner">
                <div className="review-change-icon">
                  ✓
                </div>

                <div className="review-change-content">
                  <strong>
                    Your case review has been updated.
                  </strong>

                  {changedSections.length > 0 ? (
                    <>
                      <p>
                        Your clarification changed the
                        following parts of the review:
                      </p>

                      <div className="review-change-tags">
                        {changedSections.map(
                          (section) => (
                            <span key={section}>
                              {section}
                            </span>
                          )
                        )}
                      </div>
                    </>
                  ) : (
                    <p>
                      Your answer was added, but it did
                      not materially change the review.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SUMMARY STRIP */}
          {/* SUMMARY STRIP */}
          <div
            className={`analysis-summary-strip ${reviewUpdated
              ? "review-updated-flash"
              : ""
              }`}
          >
            {/* FACTS */}
            <div className="summary-stat">
              <span className="summary-stat-number">
                {facts.length}
              </span>

              <span className="summary-stat-label">
                Facts identified
              </span>
            </div>

            {/* ASSUMPTIONS */}
            <div className="summary-stat">
              <span className="summary-stat-number warning-number">
                {assumptions.length}
              </span>

              <span className="summary-stat-label">
                Assumptions flagged
              </span>
            </div>

            {/* CONSISTENCY ISSUES - NEW */}
            <div className="summary-stat">
              <span className="summary-stat-number consistency-number">
                {consistencyIssues.length}
              </span>

              <span className="summary-stat-label">
                Consistency issues
              </span>
            </div>

            {/* MISSING INFORMATION */}
            <div className="summary-stat">
              <span className="summary-stat-number question-number">
                {missingInformation.length}
              </span>

              <span className="summary-stat-label">
                Information gaps
              </span>
            </div>

            {/* FOLLOW-UP QUESTIONS */}
            <div className="summary-stat">
              <span className="summary-stat-number">
                {followUpQuestions.length}
              </span>

              <span className="summary-stat-label">
                Follow-up questions
              </span>
            </div>
          </div>

          {/* ANALYSIS CARDS */}
          <div className="analysis-grid">
            {/* FACTS */}
            <section className="analysis-card">
              <div className="analysis-card-header">
                <div className="analysis-card-title">
                  <div className="analysis-icon fact-icon">
                    ✓
                  </div>

                  <div>
                    <span className="analysis-card-label">
                      PROVIDED INFORMATION
                    </span>

                    <h2>Facts identified</h2>
                  </div>
                </div>

                <span className="card-count">
                  {facts.length}
                </span>
              </div>

              <p className="analysis-card-description">
                Information directly based on what you told us.
              </p>

              {renderList(
                facts,
                "No clear factual statements were identified."
              )}
            </section>

            {/* ASSUMPTIONS */}
            <section className="analysis-card assumption-card">
              <div className="analysis-card-header">
                <div className="analysis-card-title">
                  <div className="analysis-icon assumption-icon">
                    !
                  </div>

                  <div>
                    <span className="analysis-card-label">
                      ASSUMPTION CHECK
                    </span>

                    <h2>Assumptions identified</h2>
                  </div>
                </div>

                <span className="card-count warning-count">
                  {assumptions.length}
                </span>
              </div>

              <p className="analysis-card-description">
                Statements that may go beyond what is currently established.
              </p>

              {renderList(
                assumptions,
                "No unsupported assumptions were identified."
              )}
            </section>

            {/* CONSISTENCY CHECK */}
            <section className="analysis-card consistency-card">
              <div className="analysis-card-header">
                <div className="analysis-card-title">
                  <div className="analysis-icon consistency-icon">
                    ↔
                  </div>

                  <div>
                    <span className="analysis-card-label">
                      CONSISTENCY CHECK
                    </span>

                    <h2>Information that conflicts</h2>
                  </div>
                </div>

                <span className="card-count consistency-count">
                  {consistencyIssues.length}
                </span>
              </div>

              <p className="analysis-card-description">
                Differences between your form entries and written description
                that may need clarification.
              </p>

              {renderList(
                consistencyIssues,
                "No meaningful inconsistencies were identified."
              )}
            </section>

            {/* MISSING */}
            <section className="analysis-card">
              <div className="analysis-card-header">
                <div className="analysis-card-title">
                  <div className="analysis-icon question-icon">
                    ?
                  </div>

                  <div>
                    <span className="analysis-card-label">
                      INFORMATION GAPS
                    </span>

                    <h2>Information still needed</h2>
                  </div>
                </div>

                <span className="card-count question-count">
                  {missingInformation.length}
                </span>
              </div>

              <p className="analysis-card-description">
                Details that could make your account clearer or more complete.
              </p>

              {renderList(
                missingInformation,
                "No major information gaps were identified."
              )}
            </section>

            {/* INTERACTIVE CLARIFICATION */}
            <section className="clarification-panel">
              <div className="clarification-panel-header">
                <div>
                  <span className="clarification-panel-label">
                    ✦ INTERACTIVE CLARIFICATION
                  </span>

                  <h2>Help ClaimReady understand your case more clearly.</h2>

                  <p>
                    Answer only what you know. Your answers will be added to the case
                    review, and new questions may appear if more clarification would help.
                  </p>
                </div>

                <div className="clarification-question-count">
                  {followUpQuestions.length}
                  <span>
                    question{followUpQuestions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {reviewUpdated && (
                <div className="review-updated-status">
                  <span className="review-updated-icon">✓</span>

                  <div>
                    <strong>Case review updated</strong>

                    <p>
                      Your clarification answers have been added. The facts,
                      information gaps and follow-up questions above have been refreshed.
                    </p>
                  </div>
                </div>
              )}

              {previousAnswersCount > 0 && (
                <div className="clarification-history-status">
                  <span className="history-check">✓</span>

                  <div>
                    <strong>
                      {previousAnswersCount} previous answer
                      {previousAnswersCount !== 1 ? "s" : ""} saved
                    </strong>

                    <p>
                      ClaimReady will continue using these answers when updating your
                      review.
                    </p>
                  </div>
                </div>
              )}

              {followUpQuestions.length > 0 ? (
                <>
                  <div className="clarification-helper-row">
                    <span>
                      You do not need to answer every question.
                    </span>

                    <span>
                      {answeredThisRound} of {followUpQuestions.length} answered
                    </span>
                  </div>

                  <div className="clarification-questions">
                    {followUpQuestions.map((question, index) => (
                      <div
                        className="clarification-question"
                        key={index}
                      >
                        <div className="clarification-question-heading">
                          <span className="clarification-number">
                            {index + 1}
                          </span>

                          <label htmlFor={`clarification-${index}`}>
                            {question}
                          </label>
                        </div>

                        <textarea
                          id={`clarification-${index}`}
                          rows="3"
                          placeholder="Type what you know here..."
                          value={clarificationAnswers[index] || ""}
                          onChange={(e) =>
                            setClarificationAnswers({
                              ...clarificationAnswers,
                              [index]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {clarificationError && (
                    <div className="clarification-error">
                      {clarificationError}
                    </div>
                  )}

                  <div className="clarification-panel-footer">
                    <div className="clarification-explanation">
                      <strong>What happens when you update?</strong>

                      <p>
                        ClaimReady will review your original information together with
                        your answers. Resolved questions may disappear and new relevant
                        questions may be generated.
                      </p>
                    </div>

                    <button
                      className="reanalyse-button"
                      onClick={handleReanalyse}
                      disabled={reanalysing || answeredThisRound === 0}
                    >
                      {reanalysing ? (
                        <>
                          <span className="reanalyse-spinner" />
                          Updating review...
                        </>
                      ) : (
                        <>
                          Update Case Review
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="clarification-complete">
                  <div className="clarification-complete-icon">
                    ✓
                  </div>

                  <div>
                    <strong>No further clarification needed right now.</strong>

                    <p>
                      You can continue to your preparation summary.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* PREPARATION CHECKS */}
          <div className="analysis-grid">
            {/* READINESS */}
            <section className="analysis-card">
              <div className="analysis-card-header">
                <div className="analysis-card-title">
                  <div className="analysis-icon fact-icon">
                    ✓
                  </div>

                  <div>
                    <span className="analysis-card-label">
                      PREPARATION CHECK
                    </span>

                    <h2>Readiness checklist</h2>
                  </div>
                </div>

                <span className="card-count">
                  {readinessChecks.length}
                </span>
              </div>

              <p className="analysis-card-description">
                A neutral check of the information you have
                prepared so far. This is not an assessment
                of whether your claim is legally valid.
              </p>

              {renderList(
                readinessChecks,
                "No additional preparation checks were generated."
              )}
            </section>


            {/* EVIDENCE */}
            <section className="analysis-card">
              <div className="analysis-card-header">
                <div className="analysis-card-title">
                  <div className="analysis-icon followup-icon">
                    ◫
                  </div>

                  <div>
                    <span className="analysis-card-label">
                      EVIDENCE CHECK
                    </span>

                    <h2>Records to consider</h2>
                  </div>
                </div>

                <span className="card-count">
                  {evidencePrompts.length}
                </span>
              </div>

              <p className="analysis-card-description">
                Records mentioned by your situation that you
                may want to check whether you already have.
              </p>

              {renderList(
                evidencePrompts,
                "No additional evidence prompts were identified."
              )}
            </section>
          </div>

          {/* ASSUMPTION CHECK FEATURE */}
          <section className="assumption-check-panel">
            <div className="assumption-check-left">
              <div className="assumption-badge">
                RESPONSIBLE AI CHECK
              </div>

              <h2>
                AI should not simply agree with your version of events.
              </h2>

              <p>
                ClaimReady looks for language that expresses conclusions,
                certainty or intent that may not yet be supported by the
                information provided.
              </p>

              {assumptions.length > 0 ? (
                <div className="assumption-alert">
                  <span className="assumption-alert-icon">
                    !
                  </span>

                  <div>
                    <strong>
                      {assumptions.length} assumption
                      {assumptions.length !== 1 ? "s" : ""} flagged
                    </strong>

                    <p>
                      Review these statements carefully before relying on
                      them as established facts.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="assumption-clear">
                  <span>✓</span>

                  <p>
                    No unsupported assumptions have been detected so far.
                  </p>
                </div>
              )}
            </div>

            <div className="assumption-check-right">
              <div className="comparison-box">
                <span className="comparison-label">
                  EXAMPLE
                </span>

                <div className="comparison-row">
                  <span className="comparison-status unsupported">
                    !
                  </span>

                  <div>
                    <strong>Conclusion</strong>
                    <p>“The seller intentionally scammed me.”</p>
                  </div>
                </div>

                <div className="comparison-arrow">
                  ↓
                </div>

                <div className="comparison-row">
                  <span className="comparison-status supported">
                    ✓
                  </span>

                  <div>
                    <strong>Neutral factual wording</strong>
                    <p>
                      “I paid for the item, but it was not delivered by
                      the expected date.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SAFETY NOTICE */}
          <div className="analysis-safety">
            <div className="analysis-safety-icon">
              i
            </div>

            <div>
              <strong>This review is not an assessment of your case.</strong>

              <p>
                ClaimReady does not determine whether your claim is legally
                valid, predict whether you will succeed, or recommend legal
                arguments. It helps organise and clarify the information you
                provide.
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="analysis-actions">
            <button
              className="analysis-back-button"
              onClick={() => navigate("/case-intake")}
            >
              ← Edit my information
            </button>

            <div className="analysis-actions-right">
              {issueCount > 0 && (
                <span className="analysis-review-note">
                  {issueCount} item
                  {issueCount !== 1 ? "s" : ""} may need your attention
                </span>
              )}

              <button
                className="analysis-continue-button"
                onClick={handleContinueToSummary}
                disabled={openingSummary}
              >
                {openingSummary ? (
                  <>
                    <span className="summary-transition-spinner" />
                    Preparing summary...
                  </>
                ) : (
                  <>
                    Continue to Summary
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="analysis-sidebar">
          <div className="analysis-sidebar-card">
            <span className="sidebar-label">
              HOW TO READ THIS
            </span>

            <h3>
              Not every statement should be treated equally.
            </h3>

            <div className="legend-item">
              <div className="legend-icon fact-icon">
                ✓
              </div>

              <div>
                <strong>Fact provided</strong>
                <p>
                  Based directly on information you entered.
                </p>
              </div>
            </div>

            <div className="legend-item">
              <div className="legend-icon assumption-icon">
                !
              </div>

              <div>
                <strong>Assumption</strong>
                <p>
                  A conclusion that may need further support.
                </p>
              </div>
            </div>

            <div className="legend-item">
              <div className="legend-icon question-icon">
                ?
              </div>

              <div>
                <strong>Missing information</strong>
                <p>
                  Something that may help clarify your account.
                </p>
              </div>
            </div>
          </div>

          <div className="analysis-next-card">
            <span className="sidebar-label">
              NEXT STEP
            </span>

            <h3>Prepare a clear summary.</h3>

            <p>
              Next, ClaimReady will help turn your reviewed information into
              a structured preparation summary.
            </p>

            <div className="next-items">
              <span>✓ Key facts</span>
              <span>✓ Important dates</span>
              <span>✓ Information gaps</span>
              <span>✓ Questions to clarify</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CaseAnalysis;