import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import "./CaseIntake.css";

function CaseIntake() {
  const navigate = useNavigate();

  const savedCase = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("claimreadyCurrentCase")
      )?.caseDetails;
    } catch {
      return null;
    }
  })();

  const [dispute, setDispute] = useState(
    savedCase?.dispute || ""
  );

  const [date, setDate] = useState(
    savedCase?.date || ""
  );

  const [disputeType, setDisputeType] = useState(
    savedCase?.disputeType || ""
  );

  const [respondentName, setRespondentName] = useState(
    savedCase?.respondentName || ""
  );

  const [respondentContactKnown, setRespondentContactKnown] =
    useState(
      savedCase?.respondentContactKnown || ""
    );

  const [desiredOutcome, setDesiredOutcome] = useState(
    savedCase?.desiredOutcome || ""
  );

  const [amount, setAmount] = useState(
    savedCase?.amount || ""
  );

  const [workRequested, setWorkRequested] = useState(
    savedCase?.workRequested || ""
  );

  const [estimatedWorkValue, setEstimatedWorkValue] =
    useState(
      savedCase?.estimatedWorkValue || ""
    );

  const [returnRequested, setReturnRequested] = useState(
    savedCase?.returnRequested || ""
  );

  const [evidenceTypes, setEvidenceTypes] = useState(
    savedCase?.evidenceTypes || []
  );

  const [resolutionAttempted, setResolutionAttempted] =
    useState(
      savedCase?.resolutionAttempted || ""
    );

  const [resolutionDetails, setResolutionDetails] =
    useState(
      savedCase?.resolutionDetails || ""
    );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEvidenceChange = (value) => {
    setEvidenceTypes((current) => {
      if (value === "none") {
        return current.includes("none")
          ? []
          : ["none"];
      }

      const withoutNone =
        current.filter((item) => item !== "none");

      if (withoutNone.includes(value)) {
        return withoutNone.filter(
          (item) => item !== value
        );
      }

      return [...withoutNone, value];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let outcome = "";

    if (desiredOutcome === "money") {
      outcome = amount
        ? `Payment or refund of S$${amount}`
        : "Payment or refund";
    }

    if (desiredOutcome === "work") {
      outcome = workRequested
        ? `Repair, replacement or work requested: ${workRequested}`
        : "Repair, replacement or work to be done";
    }

    if (desiredOutcome === "return") {
      outcome = returnRequested
        ? `Return requested: ${returnRequested}`
        : "Return of an item or property";
    }

    if (desiredOutcome === "unsure") {
      outcome =
        "User is not yet sure what outcome they are seeking.";
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        import.meta.env.VITE_CLAIMREADY_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dispute,
            date,

            disputeType,

            respondentName,
            respondentContactKnown,

            desiredOutcome,

            amount:
              desiredOutcome === "money"
                ? amount
                : "",

            outcome,

            workRequested,
            estimatedWorkValue,
            returnRequested,

            evidenceTypes,

            resolutionAttempted,
            resolutionDetails,
          }),
        });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyse case");
      }

      const savedCase = {
        analysis: data.analysis,

        caseDetails: {
          dispute,
          date,

          disputeType,

          respondentName,
          respondentContactKnown,

          desiredOutcome,

          amount:
            desiredOutcome === "money"
              ? amount
              : "",

          outcome,

          workRequested,
          estimatedWorkValue,
          returnRequested,

          evidenceTypes,

          resolutionAttempted,
          resolutionDetails,
        },

        clarificationHistory: [],
      };

      sessionStorage.setItem(
        "claimreadyCurrentCase",
        JSON.stringify(savedCase)
      );

      navigate("/case-analysis", {
        state: {
          analysis: data.analysis,
          caseDetails: {
            dispute,
            date,

            disputeType,

            respondentName,
            respondentContactKnown,

            desiredOutcome,

            amount:
              desiredOutcome === "money"
                ? amount
                : "",

            outcome,

            workRequested,
            estimatedWorkValue,
            returnRequested,

            evidenceTypes,

            resolutionAttempted,
            resolutionDetails,
          },
        },
      });
    } catch (err) {
      console.error("Error analysing case:", err);
      setError(
        "We could not analyse your information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intake-page">
      {/* HEADER */}
      <AppNavbar />

      {/* PROGRESS */}
      <div className="intake-progress-wrapper">
        <div className="intake-progress">
          <div className="progress-step active">
            <div className="progress-circle">1</div>

            <div>
              <strong>Your situation</strong>
              <span>Tell us what happened</span>
            </div>
          </div>

          <div className="progress-line" />

          <div className="progress-step">
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
      <main className="intake-main">
        <section className="intake-form-card">
          <div className="intake-heading">
            <span className="intake-section-label">
              YOUR SITUATION
            </span>

            <h1>Tell us what happened.</h1>

            <p>
              Explain the situation naturally, just as you would describe it
              to another person. You do not need legal terminology.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* DISPUTE */}
            <div className="intake-field">
              <div className="field-heading">
                <label htmlFor="dispute">
                  Describe your dispute
                  <span className="required">*</span>
                </label>

                <span className="character-count">
                  {dispute.length} / 2000
                </span>
              </div>

              <textarea
                id="dispute"
                placeholder="For example: I bought a laptop online for S$1,200 on 3 August. The seller said it would arrive by 10 August, but I still have not received it..."
                rows="9"
                maxLength="2000"
                value={dispute}
                onChange={(e) => setDispute(e.target.value)}
                required
              />

              <div className="field-tip">
                <span>✦</span>

                <p>
                  Include important dates, what was agreed, what happened
                  afterwards and any communication with the other party.
                </p>
              </div>
            </div>

            {/* BASIC DETAILS */}
            <div className="intake-form-row">
              <div className="intake-field">
                <label htmlFor="disputeType">
                  What is the dispute mainly about?
                </label>

                <select
                  id="disputeType"
                  value={disputeType}
                  onChange={(e) =>
                    setDisputeType(e.target.value)
                  }
                >
                  <option value="">
                    Select an option
                  </option>

                  <option value="goods-services">
                    Goods or services
                  </option>

                  <option value="tenancy">
                    Residential tenancy / rental
                  </option>

                  <option value="property-damage">
                    Damage to property
                  </option>

                  <option value="other">
                    Something else
                  </option>

                  <option value="unsure">
                    I'm not sure
                  </option>
                </select>

                <span className="field-helper">
                  Choose the closest match. You do not
                  need to know the legal category.
                </span>
              </div>


              <div className="intake-field">
                <label htmlFor="date">
                  When did the main problem happen?
                </label>

                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                />

                <span className="field-helper">
                  If several things happened, use the
                  date of the main event for now.
                </span>
              </div>
            </div>

            {/* OTHER PARTY */}
            <div className="intake-form-row">
              <div className="intake-field">
                <label htmlFor="respondentName">
                  Who is the dispute with?
                </label>

                <input
                  id="respondentName"
                  type="text"
                  placeholder="Person or business name"
                  value={respondentName}
                  onChange={(e) =>
                    setRespondentName(e.target.value)
                  }
                />

                <span className="field-helper">
                  A simple name is fine if you do not
                  know the full official name yet.
                </span>
              </div>


              <div className="intake-field">
                <label htmlFor="respondentContactKnown">
                  Do you know how to contact them?
                </label>

                <select
                  id="respondentContactKnown"
                  value={respondentContactKnown}
                  onChange={(e) =>
                    setRespondentContactKnown(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select an option
                  </option>

                  <option value="yes">
                    Yes
                  </option>

                  <option value="partly">
                    Partly
                  </option>

                  <option value="no">
                    No
                  </option>
                </select>

                <span className="field-helper">
                  For example, whether you know an
                  address, email or other contact detail.
                  Do not enter it here.
                </span>
              </div>
            </div>

            {/* DESIRED OUTCOME */}
            <div className="intake-field">
              <label htmlFor="desiredOutcome">
                What outcome are you hoping for?
              </label>

              <select
                id="desiredOutcome"
                value={desiredOutcome}
                onChange={(e) => {
                  setDesiredOutcome(e.target.value);

                  setAmount("");
                  setWorkRequested("");
                  setEstimatedWorkValue("");
                  setReturnRequested("");
                }}
              >
                <option value="">
                  Select an option
                </option>

                <option value="money">
                  Money or a refund
                </option>

                <option value="work">
                  Repair, replacement or work to be done
                </option>

                <option value="return">
                  Something to be returned
                </option>

                <option value="unsure">
                  I'm not sure yet
                </option>
              </select>

              <span className="field-helper">
                Choose the practical result you want.
                You do not need to know the legal name
                of the remedy.
              </span>
            </div>


            {/* MONEY OUTCOME */}
            {desiredOutcome === "money" && (
              <div className="intake-field">
                <label htmlFor="amount">
                  How much are you seeking?
                </label>

                <div className="amount-input-wrapper">
                  <span>S$</span>

                  <input
                    id="amount"
                    type="number"
                    min="0"
                    placeholder="1200"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                  />
                </div>

                <span className="field-helper">
                  Enter the amount you would like the
                  other party to pay or refund.
                </span>
              </div>
            )}


            {/* WORK OUTCOME */}
            {desiredOutcome === "work" && (
              <>
                <div className="intake-field">
                  <label htmlFor="workRequested">
                    What would you like the other party
                    to do?
                  </label>

                  <input
                    id="workRequested"
                    type="text"
                    placeholder="For example: Repair the defective flooring"
                    value={workRequested}
                    onChange={(e) =>
                      setWorkRequested(e.target.value)
                    }
                  />
                </div>

                <div className="intake-field">
                  <label htmlFor="estimatedWorkValue">
                    Estimated value of the work
                    <span className="optional-label">
                      {" "}optional
                    </span>
                  </label>

                  <div className="amount-input-wrapper">
                    <span>S$</span>

                    <input
                      id="estimatedWorkValue"
                      type="number"
                      min="0"
                      placeholder="1200"
                      value={estimatedWorkValue}
                      onChange={(e) =>
                        setEstimatedWorkValue(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <span className="field-helper">
                    Leave this blank if you do not know.
                  </span>
                </div>
              </>
            )}


            {/* RETURN OUTCOME */}
            {desiredOutcome === "return" && (
              <div className="intake-field">
                <label htmlFor="returnRequested">
                  What would you like returned?
                </label>

                <input
                  id="returnRequested"
                  type="text"
                  placeholder="For example: My security deposit"
                  value={returnRequested}
                  onChange={(e) =>
                    setReturnRequested(e.target.value)
                  }
                />
              </div>
            )}

            {/* EVIDENCE */}
            <div className="intake-field">
              <label>
                What evidence or records do you already have?
              </label>

              <span className="field-helper evidence-helper">
                Select all that apply. You do not need
                to upload anything yet.
              </span>

              <div className="evidence-options">
                {[
                  ["receipt", "Receipt or invoice"],
                  ["agreement", "Contract or agreement"],
                  ["messages", "Emails or messages"],
                  ["photos", "Photos"],
                  ["recordings", "Video or audio recordings"],
                  ["payment", "Proof of payment"],
                  ["tenancy", "Tenancy documents"],
                  ["other", "Other records"],
                  ["none", "I don't have anything yet"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="evidence-option"
                  >
                    <input
                      type="checkbox"
                      checked={evidenceTypes.includes(value)}
                      onChange={() =>
                        handleEvidenceChange(value)
                      }
                    />

                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* RESOLUTION ATTEMPTS */}
            <div className="intake-field">
              <label htmlFor="resolutionAttempted">
                Have you tried to resolve the issue
                with the other party?
              </label>

              <select
                id="resolutionAttempted"
                value={resolutionAttempted}
                onChange={(e) =>
                  setResolutionAttempted(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select an option
                </option>

                <option value="yes">
                  Yes
                </option>

                <option value="no">
                  No
                </option>

                <option value="not-yet">
                  Not yet
                </option>
              </select>
            </div>


            {resolutionAttempted === "yes" && (
              <div className="intake-field">
                <label htmlFor="resolutionDetails">
                  What happened when you tried?
                </label>

                <textarea
                  id="resolutionDetails"
                  rows="4"
                  maxLength="800"
                  placeholder="For example: I contacted the seller twice and asked for a refund, but they refused..."
                  value={resolutionDetails}
                  onChange={(e) =>
                    setResolutionDetails(
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {/* RESPONSIBLE AI NOTICE */}
            <div className="intake-ai-notice">
              <div className="ai-notice-icon">i</div>

              <div>
                <strong>
                  You don't need to make your story sound like a legal argument.
                </strong>

                <p>
                  ClaimReady will help separate factual information from
                  assumptions and identify areas that may need clarification.
                  It will not assess whether you are likely to win.
                </p>
              </div>
            </div>

            {error && (
              <div className="intake-error">
                {error}
              </div>
            )}

            {/* BUTTONS */}
            <div className="intake-actions">
              <button
                type="button"
                className="intake-back-button"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="intake-continue-button"
                disabled={loading || !dispute.trim()}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner" />
                    Analysing your information...
                  </>
                ) : (
                  <>
                    Continue to Case Review
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* SIDEBAR */}
        <aside className="intake-sidebar">
          <div className="sidebar-card">
            <span className="sidebar-label">
              WHAT HAPPENS NEXT
            </span>

            <h3>We’ll help organise what you’ve told us.</h3>

            <div className="sidebar-step">
              <div className="sidebar-step-icon success">✓</div>

              <div>
                <strong>Identify facts</strong>
                <p>
                  Statements directly based on the information you provide.
                </p>
              </div>
            </div>

            <div className="sidebar-step">
              <div className="sidebar-step-icon warning">!</div>

              <div>
                <strong>Spot assumptions</strong>
                <p>
                  Statements that may go beyond what is currently established.
                </p>
              </div>
            </div>

            <div className="sidebar-step">
              <div className="sidebar-step-icon question">?</div>

              <div>
                <strong>Find missing information</strong>
                <p>
                  Details that may help make your account clearer.
                </p>
              </div>
            </div>

            <div className="sidebar-step">
              <div className="sidebar-step-icon neutral">✦</div>

              <div>
                <strong>Ask neutral follow-ups</strong>
                <p>
                  Questions designed to clarify rather than reinforce your
                  assumptions.
                </p>
              </div>
            </div>
          </div>

          <div className="sidebar-privacy">
            <span>🔒</span>

            <div>
              <strong>Prepare carefully</strong>
              <p>
                Only provide information that is relevant to understanding your
                dispute.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CaseIntake;