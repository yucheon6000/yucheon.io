#!/usr/bin/env python3
"""
Web-based CV / Resume Generator
Reads structured data from resume/resume.yaml (and resume/resume_kr.yaml)
and renders:
  1. resume/index.html (English CV)
  2. resume/index_kr.html (Korean CV)
  3. assets/cv/cv.pdf & resume/cv.pdf (Compiled A4 PDF via headless Chrome)
Note: All generation happens strictly inside resume/ and assets/cv/; the root folder is preserved for the main web.
"""

from pathlib import Path
import re
import shutil
import subprocess
import yaml
from jinja2 import Environment, FileSystemLoader

RESUME_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = RESUME_DIR.parent
YAML_PATH = RESUME_DIR / "resume.yaml"
YAML_KR_PATH = RESUME_DIR / "resume_kr.yaml"

TEMPLATE_HTML = RESUME_DIR / "template.html"
OUTPUT_HTML = RESUME_DIR / "index.html"
OUTPUT_HTML_KR = RESUME_DIR / "index_kr.html"
OUTPUT_PDF = RESUME_DIR / "cv.pdf"
ASSETS_CV_PDF = PROJECT_ROOT / "assets" / "cv" / "cv.pdf"


def clean_url(url: str) -> str:
    """Strips protocol and trailing slashes for clean presentation."""
    if not isinstance(url, str):
        return url
    u = url.replace("https://", "").replace("http://", "")
    return u.rstrip("/")


def latex_to_html(text: str) -> str:
    """Converts LaTeX-formatted text to clean HTML equivalents."""
    if not isinstance(text, str):
        return text

    s = text

    # Handle LaTeX formatting macros
    for _ in range(3):
        s = re.sub(r"\\textbf\{([^}]+)\}", r"<strong>\1</strong>", s)
        s = re.sub(r"\\emph\{([^}]+)\}", r"<em>\1</em>", s)
        s = re.sub(r"\\underline\{([^}]+)\}", r"<u>\1</u>", s)

    # LaTeX escaped characters
    s = s.replace(r"\%", "%")
    s = s.replace(r"\#", "#")
    s = s.replace(r"\$", "$")
    s = s.replace(r"\&", "&")

    # Dashes and spacing
    s = s.replace("---", "—")
    s = s.replace("--", "–")
    s = s.replace("~", "&nbsp;")

    # Smart quotes -> direct Unicode curly quotes
    s = re.sub(r"``([^'\"]+)''", r"“\1”", s)
    s = re.sub(r'"([^"]+)"', r"“\1”", s)

    # Convert standalone & to &amp; (preserving HTML entities)
    s = re.sub(
        r"&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[a-fA-F0-9]+);)", "&amp;", s)

    return s


def render_html_bundle(yaml_path: Path, output_html: Path):
    if not yaml_path.exists():
        return

    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    # Auto-detect long competition names for 3-line layout if not explicitly set
    for award in data.get("awards", []):
        if "is_long" not in award:
            combined_len = len(
                f"{award.get('rank', '')} | {award.get('competition', '')}")
            comp_len = len(award.get("competition", ""))
            award["is_long"] = (combined_len > 80 or comp_len > 65)

    # Ensure publications have separate venue and authors
    for pub in data.get("publications", []):
        if "authors" not in pub or "venue" not in pub:
            cit = pub.get("citation", "")
            m = re.search(r"^(.*?)\s*\\emph\{(.*?)\}\.?(.*)$", cit)
            if m:
                pub.setdefault("authors", m.group(1).strip().rstrip("."))
                venue = m.group(2).strip()
                extra = m.group(3).strip()
                pub.setdefault("venue", f"{venue} {extra}".strip())
            else:
                pub.setdefault("authors", cit)
                pub.setdefault("venue", "")

    html_env = Environment(
        loader=FileSystemLoader(str(RESUME_DIR)),
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    html_env.filters["latex_to_html"] = latex_to_html
    html_env.filters["clean_url"] = clean_url

    html_template = html_env.get_template("template.html")
    rendered_html = html_template.render(**data)

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(rendered_html)

    awards_count = len(data.get("awards", []))
    projects_count = len(data.get("projects", []))
    pubs_count = len(data.get("publications", []))

    print(
        f"✓ Generated Web CV: {output_html} ({awards_count} awards, {projects_count} projects, {pubs_count} publications)")


def compile_pdf():
    """Compiles resume/index.html to A4 PDF using Chrome headless."""
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not Path(chrome_path).exists() or not OUTPUT_HTML.exists():
        return

    try:
        ASSETS_CV_PDF.parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            chrome_path,
            "--headless",
            "--disable-gpu",
            f"--print-to-pdf={OUTPUT_PDF}",
            "--print-to-pdf-no-header",
            f"file://{OUTPUT_HTML.resolve()}",
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL,
                       stderr=subprocess.DEVNULL)
        # Also sync to assets/cv/cv.pdf for the main website link
        shutil.copyfile(OUTPUT_PDF, ASSETS_CV_PDF)
        print(f"✓ Compiled A4 PDF: {OUTPUT_PDF} & {ASSETS_CV_PDF}")
    except Exception as e:
        print(f"  Note: Automatic PDF compilation skipped ({e})")


def build():
    if not YAML_PATH.exists():
        raise FileNotFoundError(f"YAML file not found: {YAML_PATH}")

    # 1. Render English CV
    render_html_bundle(YAML_PATH, OUTPUT_HTML)

    # 2. Render Korean CV (if exists)
    if YAML_KR_PATH.exists():
        render_html_bundle(YAML_KR_PATH, OUTPUT_HTML_KR)

    # 3. Compile A4 PDF
    compile_pdf()


if __name__ == "__main__":
    build()
