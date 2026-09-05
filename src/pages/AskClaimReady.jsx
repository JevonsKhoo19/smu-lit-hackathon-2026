import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./AskClaimReady.css";
import AppNavbar from "../components/AppNavbar";


const SOURCE_NAMES = {
    "how-to-file-serve-small-claim.md":
        "How to file and serve a small claim",

    "cases-eligible-small-claim.md":
        "Cases eligible for a small claim",

    "understand-outcomes-small-claim.md":
        "Understand the outcomes of a small claim",

    "before-going-to-court-small-claim.md":
        "Before going to court for a small claim",

    "at-small-claims-consultation.md":
        "At your small claims consultation",

    "at-small-claims-hearing.md":
        "At your small claims hearing",

    "court-users-generative-ai-guide.pdf":
        "Guide on the Use of Generative AI Tools by Court Users",

    "sct-ai-generated-summaries-guide.pdf":
        "Guide to SCT AI-generated Summaries",
};


const STARTER_PROMPTS = [
    "Can the SCT hear my type of dispute?",
    "What documents should I prepare?",
    "What happens after I file a small claim?",
    "How should I verify AI-generated information?",
];

const TUTORIAL_STORAGE_KEY =
    "claimreadyAskTutorialCompleted";

const createInitialMessages = () => [
    {
        id: `claimready-intro-${Date.now()}`,
        role: "assistant",
        isIntro: true,

        text:
            "Hi, I’m ClaimReady. I can help you understand the Singapore Small Claims process using official Singapore Courts guidance.",

        quickReplies: [
            "Can the SCT hear my type of dispute?",
            "What happens after I file a small claim?",
            "How should I verify AI-generated information?",
        ],
    },
];


function renderInlineText(text, sources = []) {
    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
        const citationMatch =
            part.match(/^\[(\d+)\]$/);

        if (!citationMatch) {
            return part;
        }

        const sourceIndex =
            Number(citationMatch[1]) - 1;

        const source =
            sources[sourceIndex];

        if (!source?.url) {
            return part;
        }

        return (
            <a
                key={`${part}-${index}`}
                className="inline-citation"
                href={source.url}
                target="_blank"
                rel="noreferrer"
                title={
                    SOURCE_NAMES[source.name] ||
                    source.name
                }
            >
                {part}
            </a>
        );
    });
}


function renderMessageText(
    text = "",
    sources = []
) {
    return text
        .split("\n")
        .filter((line) => line.trim())
        .map((line, index) => {
            const trimmed =
                line.trim();

            if (/^[-•]\s+/.test(trimmed)) {
                return (
                    <p
                        key={index}
                        className="claimready-message-line bullet-line"
                    >
                        {renderInlineText(
                            trimmed.replace(
                                /^[-•]\s+/,
                                ""
                            ),
                            sources
                        )}
                    </p>
                );
            }

            if (
                /^\d+\.\s+/.test(trimmed)
            ) {
                return (
                    <p
                        key={index}
                        className="claimready-message-line numbered-line"
                    >
                        {renderInlineText(
                            trimmed,
                            sources
                        )}
                    </p>
                );
            }

            return (
                <p
                    key={index}
                    className="claimready-message-line"
                >
                    {renderInlineText(
                        trimmed,
                        sources
                    )}
                </p>
            );
        });
}

function TypewriterAnswer({
    text,
    sources,
    onDone,
    onProgress,
}) {
    const [displayedText, setDisplayedText] =
        useState("");

    useEffect(() => {
        if (!text) {
            setDisplayedText("");
            onDone?.();
            return;
        }

        setDisplayedText("");

        let index = 0;

        /*
          Reveal a few characters at once rather
          than one character at a time.
    
          This keeps long legal answers smooth
          without making the user wait forever.
        */
        const charactersPerTick = 4;

        const interval =
            setInterval(() => {
                index = Math.min(
                    index + charactersPerTick,
                    text.length
                );

                setDisplayedText(
                    text.slice(0, index)
                );

                if (index % 40 === 0) {
                    onProgress?.();
                }

                if (index >= text.length) {
                    clearInterval(interval);

                    onProgress?.();
                    onDone?.();
                }
            }, 12);

        return () =>
            clearInterval(interval);
    }, [
        text,
        onDone,
        onProgress,
    ]);

    return (
        <div
            className="typewriter-answer"
            aria-live="polite"
        >
            {renderMessageText(
                displayedText,
                sources
            )}

            {displayedText.length <
                text.length && (
                    <span
                        className="typewriter-cursor"
                        aria-hidden="true"
                    >
                        |
                    </span>
                )}
        </div>
    );
}


function getUniqueSources(sources = []) {
    return [
        ...new Map(
            sources
                .filter((source) => source.url)
                .map((source) => [
                    source.url,
                    source,
                ])
        ).values(),
    ];
}


function AskClaimReady() {
    const navigate = useNavigate();

    const messagesRef = useRef(null);
    const copyTimerRef = useRef(null);

    const [question, setQuestion] =
        useState("");

    const [messages, setMessages] =
        useState(() => createInitialMessages());

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [copiedMessageId, setCopiedMessageId] =
        useState(null);

    const [expandedSources, setExpandedSources] =
        useState({});

    const [showGuide, setShowGuide] =
        useState(false);

    const [
        finishedTyping,
        setFinishedTyping,
    ] = useState({});

    const isAnswerTyping =
        messages.some(
            (message) =>
                message.role === "assistant" &&
                message.animate &&
                !finishedTyping[message.id]
        );


    const scrollToLatest = () => {
        if (!messagesRef.current) {
            return;
        }

        messagesRef.current.scrollTo({
            top: messagesRef.current.scrollHeight,
            behavior: "smooth",
        });
    };


    /*
      Smoothly scroll down whenever a new message
      or the thinking indicator appears.
    */
    useEffect(() => {
        scrollToLatest();
    }, [messages, loading]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const tutorialCompleted =
            localStorage.getItem(
                TUTORIAL_STORAGE_KEY
            );

        if (tutorialCompleted === "true") {
            return;
        }

        const timer = setTimeout(() => {
            setShowGuide(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const sendQuestion = async (text) => {
        const trimmedQuestion =
            text.trim();

        if (
            !trimmedQuestion ||
            loading ||
            isAnswerTyping
        ) {
            return;
        }

        const userMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            text: trimmedQuestion,
        };

        setMessages((current) => [
            ...current,
            userMessage,
        ]);

        setQuestion("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                import.meta.env
                    .VITE_CLAIMREADY_GUIDANCE_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        question: trimmedQuestion,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to retrieve official guidance."
                );
            }

            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                text: data.answer,
                sources: data.sources || [],
                animate: true,
            };

            setMessages((current) => [
                ...current,
                assistantMessage,
            ]);
        } catch (error) {
            console.error(
                "Ask ClaimReady error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong while checking the official guidance."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = (event) => {
        event.preventDefault();

        sendQuestion(question);
    };


    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            sendQuestion(question);
        }
    };


    const handleCopy = async (message) => {
        try {
            await navigator.clipboard.writeText(
                message.text
            );

            setCopiedMessageId(
                message.id
            );

            if (copyTimerRef.current) {
                clearTimeout(
                    copyTimerRef.current
                );
            }

            copyTimerRef.current =
                setTimeout(() => {
                    setCopiedMessageId(null);
                }, 1600);
        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );

            setError(
                "Unable to copy the response."
            );
        }
    };


    const toggleSources = (messageId) => {
        setExpandedSources(
            (current) => ({
                ...current,

                [messageId]:
                    !current[messageId],
            })
        );
    };

    const handleCloseGuide = () => {
        localStorage.setItem(
            TUTORIAL_STORAGE_KEY,
            "true"
        );

        setShowGuide(false);
    };

    const handleNewChat = () => {
        setMessages(
            createInitialMessages()
        );

        setQuestion("");
        setError("");
        setCopiedMessageId(null);
        setExpandedSources({});
        setFinishedTyping({});
    };


    return (
        <div className="ask-page">
            <AppNavbar />


            <main className="ask-main">
                <section className="ask-intro">
                    <div>
                        <span className="ask-label">
                            TRUSTED GUIDANCE
                        </span>

                        <h1>
                            Ask ClaimReady.
                        </h1>

                        <p>
                            Understand the Singapore
                            Small Claims process with
                            answers grounded in official
                            Singapore Courts sources.
                        </p>
                    </div>

                    <div className="ask-intro-trust">
                        <span className="trust-dot" />

                        Grounded in official sources
                    </div>
                </section>


                <div className="ask-chat-layout">
                    <aside className="ask-sidebar">
                        <div className="ask-side-card">
                            <span className="side-card-label">
                                SUGGESTED QUESTIONS
                            </span>

                            <h2>
                                Not sure what to ask?
                            </h2>

                            <p>
                                Start with one of these
                                common questions.
                            </p>

                            <div className="starter-prompt-list">
                                {STARTER_PROMPTS.map(
                                    (prompt) => (
                                        <button
                                            type="button"
                                            key={prompt}
                                            className="starter-prompt"
                                            disabled={
                                                loading ||
                                                isAnswerTyping
                                            }
                                            onClick={() =>
                                                sendQuestion(
                                                    prompt
                                                )
                                            }
                                        >
                                            {prompt}

                                            <span>→</span>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>


                        <div className="ask-side-card safety-card">
                            <span className="side-card-label">
                                RESPONSIBLE USE
                            </span>

                            <h2>
                                What ClaimReady does
                            </h2>

                            <div className="safety-item">
                                <span>✓</span>

                                <p>
                                    Explains procedural
                                    information from official
                                    sources.
                                </p>
                            </div>

                            <div className="safety-item">
                                <span>✓</span>

                                <p>
                                    Shows the sources used
                                    for answers.
                                </p>
                            </div>

                            <div className="safety-item">
                                <span>×</span>

                                <p>
                                    Does not predict whether
                                    you will win your case.
                                </p>
                            </div>

                            <div className="safety-item">
                                <span>×</span>

                                <p>
                                    Does not provide
                                    personalised legal
                                    strategy.
                                </p>
                            </div>
                        </div>
                    </aside>


                    <section className="chat-window">
                        <div className="chat-window-header">
                            <div>
                                <div className="chat-title-row">
                                    <div className="chat-ai-icon">
                                        ✦
                                    </div>

                                    <div>
                                        <h2>
                                            Ask ClaimReady
                                        </h2>

                                        <p>
                                            Official-source
                                            procedural guidance
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="new-chat-button"
                                onClick={
                                    handleNewChat
                                }
                                disabled={
                                    loading ||
                                    isAnswerTyping
                                }
                            >
                                ↻
                                <span>New chat</span>
                            </button>
                        </div>


                        <div className="chat-safety-strip">
                            <span>
                                Official sources
                            </span>

                            <span>
                                No outcome predictions
                            </span>

                            <span>
                                General guidance only
                            </span>
                        </div>


                        <div
                            className="chat-messages"
                            ref={messagesRef}
                        >
                            {messages.map(
                                (message) => {
                                    const sources =
                                        getUniqueSources(
                                            message.sources
                                        );

                                    const sourcesOpen =
                                        expandedSources[
                                        message.id
                                        ];
                                    const isTypingAnswer =
                                        message.role === "assistant" &&
                                        message.animate &&
                                        !finishedTyping[
                                        message.id
                                        ];

                                    return (
                                        <div
                                            key={message.id}
                                            className={`chat-message-row ${message.role}`}
                                        >
                                            {message.role ===
                                                "assistant" && (
                                                    <div className="message-avatar">
                                                        ✦
                                                    </div>
                                                )}

                                            <div className="chat-message-content">
                                                <span className="chat-message-label">
                                                    {message.role ===
                                                        "user"
                                                        ? "You"
                                                        : "ClaimReady"}
                                                </span>

                                                <div className="chat-message-bubble">
                                                    {isTypingAnswer ? (
                                                        <TypewriterAnswer
                                                            text={message.text}
                                                            sources={sources}
                                                            onProgress={
                                                                scrollToLatest
                                                            }
                                                            onDone={() => {
                                                                setFinishedTyping(
                                                                    (current) => ({
                                                                        ...current,
                                                                        [message.id]: true,
                                                                    })
                                                                );

                                                                scrollToLatest();
                                                            }}
                                                        />
                                                    ) : (
                                                        renderMessageText(
                                                            message.text,
                                                            sources
                                                        )
                                                    )}
                                                </div>


                                                {message.quickReplies
                                                    ?.length > 0 && (
                                                        <div className="chat-quick-replies">
                                                            {message.quickReplies.map(
                                                                (
                                                                    reply
                                                                ) => (
                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            reply
                                                                        }
                                                                        disabled={
                                                                            loading ||
                                                                            isAnswerTyping
                                                                        }
                                                                        onClick={() =>
                                                                            sendQuestion(
                                                                                reply
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            reply
                                                                        }
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    )}


                                                {message.role ===
                                                    "assistant" &&
                                                    !message.isIntro &&
                                                    !isTypingAnswer && (
                                                        <div className="message-actions">
                                                            <button
                                                                type="button"
                                                                className={
                                                                    copiedMessageId ===
                                                                        message.id
                                                                        ? "message-action copied"
                                                                        : "message-action"
                                                                }
                                                                onClick={() =>
                                                                    handleCopy(
                                                                        message
                                                                    )
                                                                }
                                                            >
                                                                {copiedMessageId ===
                                                                    message.id
                                                                    ? "✓ Copied"
                                                                    : "⧉ Copy"}
                                                            </button>


                                                            {sources.length >
                                                                0 && (
                                                                    <button
                                                                        type="button"
                                                                        className="message-action source-toggle"
                                                                        onClick={() =>
                                                                            toggleSources(
                                                                                message.id
                                                                            )
                                                                        }
                                                                    >
                                                                        ◉{" "}
                                                                        {
                                                                            sources.length
                                                                        }{" "}
                                                                        official{" "}
                                                                        {sources.length ===
                                                                            1
                                                                            ? "source"
                                                                            : "sources"}

                                                                        <span>
                                                                            {sourcesOpen
                                                                                ? "⌃"
                                                                                : "⌄"}
                                                                        </span>
                                                                    </button>
                                                                )}
                                                        </div>
                                                    )}


                                                {!isTypingAnswer &&
                                                    sourcesOpen &&
                                                    sources.length > 0 && (
                                                        <div className="compact-sources">
                                                            {sources.map(
                                                                (
                                                                    source,
                                                                    index
                                                                ) => (
                                                                    <a
                                                                        key={
                                                                            source.url
                                                                        }
                                                                        href={
                                                                            source.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="compact-source-card"
                                                                    >
                                                                        <span className="source-number">
                                                                            [
                                                                            {index +
                                                                                1}
                                                                            ]
                                                                        </span>

                                                                        <div>
                                                                            <strong>
                                                                                {SOURCE_NAMES[
                                                                                    source
                                                                                        .name
                                                                                ] ||
                                                                                    source.name}
                                                                            </strong>

                                                                            <small>
                                                                                Singapore
                                                                                Courts
                                                                            </small>
                                                                        </div>

                                                                        <span className="source-arrow">
                                                                            ↗
                                                                        </span>
                                                                    </a>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}


                            {loading && (
                                <div className="chat-message-row assistant thinking-row">
                                    <div className="message-avatar">
                                        ✦
                                    </div>

                                    <div className="chat-message-content">
                                        <span className="chat-message-label">
                                            ClaimReady
                                        </span>

                                        <div className="chat-message-bubble thinking-bubble">
                                            <div className="typing-dots">
                                                <span />
                                                <span />
                                                <span />
                                            </div>

                                            <span>
                                                Checking official
                                                Singapore Courts
                                                guidance
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        {error && (
                            <div className="chat-error">
                                {error}
                            </div>
                        )}


                        <form
                            className="chat-input-area"
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="chat-input-wrapper">
                                <textarea
                                    value={question}
                                    onChange={(event) =>
                                        setQuestion(
                                            event.target
                                                .value
                                        )
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    placeholder="Ask about filing, eligibility, hearings, documents or responsible AI use..."
                                    rows="1"
                                    disabled={
                                        loading ||
                                        isAnswerTyping
                                    }
                                />

                                {question && (
                                    <button
                                        type="button"
                                        className="clear-input-button"
                                        onClick={() =>
                                            setQuestion("")
                                        }
                                        disabled={
                                            loading ||
                                            isAnswerTyping
                                        }
                                        aria-label="Clear question"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="send-button"
                                disabled={
                                    !question.trim() ||
                                    loading ||
                                    isAnswerTyping
                                }
                            >
                                {loading
                                    ? "Checking..."
                                    : "Ask"}
                            </button>
                        </form>


                        <div className="chat-input-helper">
                            <span>
                                Enter to send ·
                                Shift + Enter for a
                                new line
                            </span>

                            <span>
                                General information,
                                not legal advice
                            </span>
                        </div>
                    </section>
                </div>
            </main>


            {showGuide && (
                <div
                    className="ask-guide-overlay"
                    onClick={handleCloseGuide}
                >
                    <div
                        className="ask-guide-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="guide-modal-header">
                            <div>
                                <span className="ask-label">
                                    QUICK GUIDE
                                </span>

                                <h2>
                                    Using Ask ClaimReady
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseGuide}
                            >
                                ×
                            </button>
                        </div>

                        <div className="guide-steps">
                            <div className="guide-step">
                                <span>1</span>

                                <div>
                                    <strong>
                                        Ask a procedural
                                        question
                                    </strong>

                                    <p>
                                        Ask about SCT
                                        eligibility, filing,
                                        documents, court
                                        preparation or
                                        responsible AI use.
                                    </p>
                                </div>
                            </div>

                            <div className="guide-step">
                                <span>2</span>

                                <div>
                                    <strong>
                                        Review the answer
                                    </strong>

                                    <p>
                                        ClaimReady checks its
                                        official knowledge
                                        base before responding.
                                    </p>
                                </div>
                            </div>

                            <div className="guide-step">
                                <span>3</span>

                                <div>
                                    <strong>
                                        Check the sources
                                    </strong>

                                    <p>
                                        Expand the source
                                        section underneath an
                                        answer to open the
                                        official Singapore
                                        Courts material.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="guide-done-button"
                            onClick={handleCloseGuide}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AskClaimReady;