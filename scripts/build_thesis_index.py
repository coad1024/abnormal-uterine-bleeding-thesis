"""Build a lightweight searchable index of the thesis manuscript.

This script scans text-bearing files in the ../manuscript directory, extracts
paragraph-sized passages, and produces a JSON index used by the dashboard's
"Ask the Thesis" feature for client-side lexical retrieval.

Output: ../dashboard/thesis_index.json

Index JSON structure:
{
  "meta": {"total_passages": int, "built_at": iso8601, "source_files": [...]},
  "documents": [
     {
       "id": "file_basename::paragraph_index",
       "file": "Thesis.md",
       "section": "(optional heading if detected)",
       "text": "Original paragraph text",
       "tokens": ["normalized", "tokens", ...],
       "tf": {"token": frequency_float,...},
       "norm": float  # L2 norm of TF vector for cosine scoring
     }, ...
  ],
  "idf": {"token": idf_float, ...}
}

Scoring (in frontend): cosine(query_tf_idf, passage_tf_idf)

Assumptions & Simplifications:
 - Only .md and .txt are processed natively.
 - .docx files are parsed if python-docx is installed; otherwise skipped with a warning.
 - .pdf files are ignored by default (can be added with pdfminer.six if needed later).
 - Basic tokenization: lowercase, split on non-alphabetic, remove short tokens and stopwords.

Usage (Windows PowerShell):
  cd "c:/Users/coad1/OneDrive/Desktop/Thesis Figures and descriptions/scripts"
  python build_thesis_index.py
"""

from __future__ import annotations
import json
import math
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Tuple

ROOT = Path(__file__).resolve().parent.parent
MANUSCRIPT_DIR = ROOT / "manuscript"
OUTPUT_PATH = ROOT / "dashboard" / "thesis_index.json"

# Minimal English stopword list (can be extended)
STOPWORDS = {
    "the","a","an","and","or","of","to","in","for","on","with","is","are","was","were","be","by","as","that","this","it","at","from","we","our","their","there","which","these","those","has","had","have","but","not","can","may","also","than","such","its","into","using","used","between","more","most"
}

TOKEN_RE = re.compile(r"[A-Za-z]{2,}")  # 2+ letters

def debug(msg: str):
    print(f"[build_thesis_index] {msg}")

def read_markdown(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")

def read_docx(path: Path) -> str:
    try:
        import docx  # python-docx
    except ImportError:
        debug(f"python-docx not installed; skipping DOCX file {path.name}")
        return ""
    try:
        doc = docx.Document(str(path))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        debug(f"Failed to parse DOCX {path.name}: {e}")
        return ""

def tokenize(text: str) -> List[str]:
    tokens = [t.lower() for t in TOKEN_RE.findall(text)]
    return [t for t in tokens if t not in STOPWORDS and len(t) > 2]

def split_into_paragraphs(text: str) -> List[str]:
    # Normalize line endings, split on blank lines
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    # Filter out very short lines
    return [p for p in paragraphs if len(p.split()) >= 5]

def detect_section(lines_before: List[str]) -> str | None:
    # Heuristic: last markdown heading encountered
    for line in reversed(lines_before):
        if line.startswith('#'):
            return line.lstrip('#').strip()
    return None

def build_documents() -> Tuple[List[Dict], Dict[str, int]]:
    documents = []
    doc_freq: Dict[str, int] = {}
    source_files: List[str] = []

    if not MANUSCRIPT_DIR.exists():
        debug(f"Manuscript directory not found: {MANUSCRIPT_DIR}")
        return [], {}

    for path in sorted(MANUSCRIPT_DIR.iterate_dir() if hasattr(MANUSCRIPT_DIR, 'iterate_dir') else MANUSCRIPT_DIR.iterdir()):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        if ext not in {".md",".txt",".docx"}:
            continue
        debug(f"Processing {path.name}")
        source_files.append(path.name)
        if ext == ".md" or ext == ".txt":
            raw = read_markdown(path)
        elif ext == ".docx":
            raw = read_docx(path)
        else:
            raw = ""
        if not raw.strip():
            continue
        lines = raw.splitlines()
        paragraphs = split_into_paragraphs(raw)
        for idx, para in enumerate(paragraphs):
            para_tokens = tokenize(para)
            if not para_tokens:
                continue
            tf_counts: Dict[str, int] = {}
            for t in para_tokens:
                tf_counts[t] = tf_counts.get(t, 0) + 1
            # Raw term frequency normalization (log-scaling could be added later)
            total = sum(tf_counts.values())
            tf = {t: c / total for t, c in tf_counts.items()}
            for t in tf:
                doc_freq[t] = doc_freq.get(t, 0) + 1
            section = detect_section(lines[:idx+1])
            norm = math.sqrt(sum(v*v for v in tf.values())) or 1.0
            documents.append({
                "id": f"{path.stem}::{idx}",
                "file": path.name,
                "section": section,
                "text": para,
                "tokens": para_tokens,
                "tf": tf,
                "norm": norm,
            })
    return documents, doc_freq

def compute_idf(doc_freq: Dict[str, int], total_docs: int) -> Dict[str, float]:
    idf = {}
    for token, df in doc_freq.items():
        # Add 1 to denominator for stability
        idf[token] = math.log((total_docs + 1) / (df + 1)) + 1.0
    return idf

def main():
    documents, doc_freq = build_documents()
    total_docs = len(documents)
    if not documents:
        debug("No documents extracted; writing empty index")
    idf = compute_idf(doc_freq, total_docs) if documents else {}

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "meta": {
            "total_passages": total_docs,
            "built_at": datetime.now(timezone.utc).isoformat(),
            "source_files": sorted({d["file"] for d in documents}),
            "stopwords": len(STOPWORDS),
        },
        "documents": documents,
        "idf": idf,
    }
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    debug(f"Index written to {OUTPUT_PATH} (passages: {total_docs})")

if __name__ == "__main__":
    main()
