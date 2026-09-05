import os
import requests


OUTPUT_DIR = "data/pdfs"


PDFS = [
    {
        "name": "court-users-generative-ai-guide.pdf",
        "url": (
            "https://www.judiciary.gov.sg/docs/default-source/"
            "news-and-resources-docs/"
            "guide-on-the-use-of-generative-ai-tools-by-court-users.pdf"
            "?sfvrsn=3900c814_1"
        ),
    },
    {
        "name": "sct-ai-generated-summaries-guide.pdf",
        "url": (
            "https://www.judiciary.gov.sg/docs/default-source/"
            "civil-docs/"
            "guide-to-sct-ai-generated-summaries.pdf"
            "?sfvrsn=bc53fa8d_1"
        ),
    },
]


def download_pdf(pdf):
    url = pdf["url"]
    filename = pdf["name"]

    print(f"\nDownloading: {filename}")

    response = requests.get(
        url,
        timeout=30,
        headers={
            "User-Agent":
                "ClaimReady-Hackathon-RAG-Collector/1.0"
        },
    )

    response.raise_for_status()

    # Basic check that we really received a PDF
    if not response.content.startswith(b"%PDF"):
        raise RuntimeError(
            f"{filename} did not return a valid PDF."
        )

    output_path = os.path.join(
        OUTPUT_DIR,
        filename,
    )

    with open(output_path, "wb") as file:
        file.write(response.content)

    size_kb = len(response.content) / 1024

    print(
        f"✅ Saved: {output_path} "
        f"({size_kb:.1f} KB)"
    )


def main():
    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True,
    )

    print("ClaimReady official PDF collector")
    print(f"PDFs to download: {len(PDFS)}")

    for pdf in PDFS:
        download_pdf(pdf)

    print("\n✅ ALL PDF DOWNLOADS COMPLETED")


if __name__ == "__main__":
    main()