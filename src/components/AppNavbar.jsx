import { useLocation, useNavigate } from "react-router-dom";
import "./AppNavbar.css";

function AppNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isPreparation =
        location.pathname.startsWith("/case-");

    const isAsk =
        location.pathname === "/ask";

    return (
        <header className="app-navbar">
            <button
                type="button"
                className="app-navbar-brand"
                onClick={() => navigate("/")}
            >
                <img
                    src="/claimready-logo.png"
                    alt="ClaimReady"
                    className="app-navbar-logo"
                />

                <div className="app-navbar-brand-copy">
                    <strong>ClaimReady</strong>

                    <span>
                        Small Claims Preparation Assistant
                    </span>
                </div>
            </button>

            <nav className="app-navbar-actions">
                <button
                    type="button"
                    className={`app-navbar-link ${isPreparation ? "active" : ""
                        }`}
                    onClick={() =>
                        navigate("/case-intake")
                    }
                >
                    Prepare my case
                </button>

                <button
                    type="button"
                    className={`app-navbar-ask ${isAsk ? "active" : ""
                        }`}
                    onClick={() =>
                        navigate("/ask")
                    }
                >
                    Ask ClaimReady
                </button>
            </nav>
        </header>
    );
}

export default AppNavbar;