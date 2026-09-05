import os
import re
import requests

from bs4 import BeautifulSoup
from markdownify import markdownify as md
from urllib.parse import urljoin


OUTPUT_DIR = "data"


PAGES = [
    {
        "title": "How to file and serve a small claim",
        "url": "https://www.judiciary.gov.sg/civil/how-to-file-serve-small-claim",
        "filename": "how-to-file-serve-small-claim.md",
        "start_marker": (
            "Find out how to file a small claim online, "
            "including the fees and documents to prepare."
        ),
        "required": [
            "Before you file",
            "Key facts",
            "Filing fees for a SCT claim or counterclaim",
            "What you will need",
            "Documents to upload for a small claim",
            "How to file and serve a claim",
            "Serve the claim on the respondent",
            "File a DOS",
            "After you file",
            "Related questions",
        ],
    },

    {
        "title": "Cases eligible for a small claim",
        "url": "https://www.judiciary.gov.sg/civil/cases-eligible-small-claim/1000",
        "filename": "cases-eligible-small-claim.md",
        "start_marker": (
            "Find out if the Small Claims Tribunals can hear your claim"
        ),
        "required": [
            "Check if you can file",
            "Take a pre-filing assessment",
            "Types of claims the SCT can hear",
            "Claim limit",
            "Time limit",
            "Other conditions",
        ],
    },

    {
        "title": "Understand the outcomes of a small claim",
        "url": "https://www.judiciary.gov.sg/civil/understand-outcomes-small-claim",
        "filename": "understand-outcomes-small-claim.md",
        "start_marker": (
            "The Small Claims Tribunals (SCT) can make "
            "the following types of orders:"
        ),
        "required": [
            "Money order",
            "Work order",
            "Order for vacant possession",
            "Consent order",
            "Default order",
            "Discontinuance order",
            "Transfer order",
            "After an order is made",
            "Resources",
        ],
    },

    {
        "title": "Before going to court for a small claim",
        "url": "https://www.judiciary.gov.sg/civil/before-going-to-court-small-claim",
        "filename": "before-going-to-court-small-claim.md",
        "start_marker": (
            "Both parties involved in a Small Claims Tribunals "
            "(SCT) claim must first attend a consultation"
        ),
        "required": [
            "Attendance is compulsory",
            "Who can represent you",
            "Checklist before going to the SCT",
            "Prepare the explanation for your case",
            "Supporting documents",
            "Declaration of Service",
            "Going to court with a family member, friend or volunteer",
            "Resources",
        ],
    },

    {
        "title": "At your small claims consultation",
        "url": "https://www.judiciary.gov.sg/civil/at-small-claims-consultation",
        "filename": "at-small-claims-consultation.md",
        "start_marker": (
            "A consultation at the Small Claims Tribunals "
            "(SCT) is a court proceeding"
        ),
        "required": [
            "Before the consultation",
            "On the day of the consultation",
            "Possible outcomes of the consultation",
            "If a settlement is reached",
            "If a settlement is not reached",
            "Resources",
        ],
    },

    {
        "title": "At your small claims hearing",
        "url": "https://www.judiciary.gov.sg/civil/at-small-claims-hearing",
        "filename": "at-small-claims-hearing.md",
        "start_marker": (
            "A Small Claims Tribunals (SCT) hearing "
            "takes place before a tribunal magistrate"
        ),
        "required": [
            "Before the hearing",
            "On the day of the hearing",
            "During the hearing",
            "At the end of the hearing",
            "Resources",
        ],
    },
]


def clean_markdown(text):
    text = text.replace("\r\n", "\n")

    # Remove repeated spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove spaces before punctuation
    text = re.sub(
        r"\s+([.,;:!?])",
        r"\1",
        text,
    )

    # Prevent giant gaps
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


def validate_content(text, required_items):
    missing = []

    for item in required_items:
        if item.lower() not in text.lower():
            missing.append(item)

    if missing:
        print("\n❌ Validation failed.")

        print("Missing expected content:")

        for item in missing:
            print(f"   - {item}")

        return False

    print(
        f"✅ Validation passed "
        f"({len(required_items)}/{len(required_items)})"
    )

    return True


def remove_navigation(article):
    # Everything from these markers onward is
    # website navigation/footer, not article content.
    end_markers = [
        "Go to **Step-by-step guide**",
        "Go to Step-by-step guide",
        "### Step-by-step guide",
        "Share this page:",
        "### Singapore Courts",
    ]

    positions = []

    for marker in end_markers:
        position = article.find(marker)

        if position != -1:
            positions.append(position)

    if positions:
        article = article[:min(positions)]

    return article


def scrape_page(page):
    title = page["title"]
    url = page["url"]

    print("\n" + "=" * 60)
    print(f"Downloading: {title}")
    print(url)

    response = requests.get(
        url,
        timeout=30,
        headers={
            "User-Agent":
                "ClaimReady-Hackathon-RAG-Collector/1.0"
        },
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    # Remove website noise
    for tag in soup([
        "script",
        "style",
        "nav",
        "footer",
        "header",
        "noscript",
        "svg",
        "img",
    ]):
        tag.decompose()

    # Turn relative links like /civil/... into
    # complete judiciary.gov.sg links.
    for link in soup.find_all("a", href=True):
        link["href"] = urljoin(
            url,
            link["href"],
        )

    content = (
        soup.find("main")
        or soup.find("body")
        or soup
    )

    markdown = md(
        str(content),
        heading_style="ATX",
        bullets="-",
    )

    markdown = clean_markdown(markdown)

    start_position = markdown.find(
        page["start_marker"]
    )

    if start_position == -1:
        raise RuntimeError(
            f"Could not find article start for: {title}"
        )

    article = markdown[start_position:]

    article = remove_navigation(article)

    # Remove leftover Markdown image syntax
    article = re.sub(
        r"!\[[^\]]*\]\([^)]+\)",
        "",
        article,
    )

    article = clean_markdown(article)

    if not validate_content(
        article,
        page["required"],
    ):
        raise RuntimeError(
            f"Content validation failed for: {title}"
        )

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True,
    )

    output_file = os.path.join(
        OUTPUT_DIR,
        page["filename"],
    )

    final_document = f"""# {title}

Source: {url}

Official publisher: Singapore Courts

Retrieved for: ClaimReady Legal-Tech Hackathon 2026

{article}
"""

    with open(
        output_file,
        "w",
        encoding="utf-8",
    ) as file:
        file.write(final_document)

    print(f"✅ Saved: {output_file}")


def main():
    print("ClaimReady official source collector")
    print(f"Pages to scrape: {len(PAGES)}")

    for page in PAGES:
        scrape_page(page)

    print("\n" + "=" * 60)
    print("✅ ALL SOURCES COMPLETED")
    print(f"Saved {len(PAGES)} files inside /data")


if __name__ == "__main__":
    main()