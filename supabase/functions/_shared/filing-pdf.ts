// PDF generator for the Filing Summarizer brief.
//
// Renders a FilingBrief into a clean, multi-section PDF using pdf-lib's standard
// Helvetica fonts (no font embedding needed). Standard fonts use WinAnsi
// encoding, which cannot represent every glyph that shows up in SEC filings
// (smart quotes, em-dashes, CJK, etc.). `safe()` maps the common ones to ASCII
// and strips anything else so pdf-lib never throws an encoding error.
//
// Tested independently to produce a valid `%PDF` document.

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "https://esm.sh/pdf-lib@1.17.1";
import type { FilingBrief } from "./filing-brief-prompt.ts";
import type { FilingMeta } from "./sec-edgar.ts";

const PAGE_W = 612; // US Letter, points
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = rgb(0.09, 0.1, 0.12);
const MUTED = rgb(0.38, 0.42, 0.48);
const FAINT = rgb(0.6, 0.63, 0.68);
const ACCENT = rgb(0.13, 0.4, 0.85);
const RULE = rgb(0.85, 0.87, 0.9);

// Map glyphs WinAnsi can't (reliably) encode to ASCII, then drop any remaining
// character outside printable-ASCII + Latin-1 so font.encode never throws.
function safe(input: string): string {
  if (!input) return "";
  let s = String(input);
  s = s
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—―]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•·●▪⁃∙]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/™/g, "(TM)")
    .replace(/®/g, "(R)")
    .replace(/©/g, "(C)")
    .replace(/€/g, "EUR ")
    .replace(/−/g, "-");
  // Keep printable ASCII, the Latin-1 supplement (WinAnsi-encodable), and \n.
  s = s.replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");
  return s;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const clean = safe(text).replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const words = clean.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateBriefPdf(brief: FilingBrief, meta: FilingMeta): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(safe(`${meta.company} (${meta.ticker}) — ${meta.form} brief`));
  doc.setAuthor("hudsonturansky.com — Filing Summarizer");
  doc.setCreator("hudsonturansky.com");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  // Add a page if the next block (height) won't fit above the bottom margin.
  const ensure = (height: number) => {
    if (y - height < MARGIN) newPage();
  };

  const text = (
    s: string,
    opts: { font?: PDFFont; size?: number; color?: typeof INK; x?: number } = {},
  ) => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    page.drawText(safe(s), { x: opts.x ?? MARGIN, y, size, font: f, color: opts.color ?? INK });
  };

  const paragraph = (
    s: string,
    opts: { font?: PDFFont; size?: number; color?: typeof INK; lineGap?: number; x?: number; width?: number } = {},
  ) => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    const lh = size + (opts.lineGap ?? 4);
    const x = opts.x ?? MARGIN;
    const width = opts.width ?? CONTENT_W - (x - MARGIN);
    for (const line of wrapText(s, f, size, width)) {
      ensure(lh);
      page.drawText(line, { x, y, size, font: f, color: opts.color ?? INK });
      y -= lh;
    }
  };

  const gap = (h: number) => {
    y -= h;
  };

  const sectionHeading = (label: string) => {
    ensure(26);
    gap(8);
    text(label.toUpperCase(), { font: bold, size: 10, color: ACCENT });
    y -= 14;
    ensure(1);
    page.drawLine({
      start: { x: MARGIN, y: y + 4 },
      end: { x: PAGE_W - MARGIN, y: y + 4 },
      thickness: 0.75,
      color: RULE,
    });
    y -= 6;
  };

  const bullets = (items: string[]) => {
    for (const item of items) {
      const lines = wrapText(item, font, 10, CONTENT_W - 14);
      if (!lines.length) continue;
      const blockH = lines.length * 14;
      ensure(blockH);
      page.drawText("-", { x: MARGIN, y, size: 10, font: bold, color: ACCENT });
      lines.forEach((line, i) => {
        page.drawText(line, { x: MARGIN + 14, y, size: 10, font, color: INK });
        y -= 14;
        if (i < lines.length - 1) ensure(14);
      });
      y -= 3;
    }
  };

  // ---- Header -------------------------------------------------------------
  text("FILING SUMMARY", { font: bold, size: 9, color: FAINT });
  y -= 22;
  paragraph(`${meta.company} (${meta.ticker})`, { font: bold, size: 20, lineGap: 4 });
  gap(2);
  const filedBits = [meta.form, meta.filingDate ? `filed ${meta.filingDate}` : ""]
    .filter(Boolean)
    .join(" · ");
  text(filedBits, { font, size: 10, color: MUTED });
  y -= 18;

  if (brief.period) {
    paragraph(brief.period, { font, size: 10, color: MUTED, lineGap: 3 });
  }

  // ---- Snapshot + headline ------------------------------------------------
  if (brief.company_snapshot) {
    gap(6);
    paragraph(brief.company_snapshot, { font, size: 10, color: INK, lineGap: 4 });
  }
  if (brief.headline) {
    gap(8);
    paragraph(brief.headline, { font: bold, size: 13, color: INK, lineGap: 4 });
  }

  // ---- Key numbers --------------------------------------------------------
  if (brief.key_numbers.length) {
    sectionHeading("Key numbers");
    for (const n of brief.key_numbers) {
      const headParts = [n.label, n.value].filter(Boolean).join(": ");
      const changePart = n.change && n.change.toLowerCase() !== "n/a" ? `  (${n.change})` : "";
      const head = `${headParts}${changePart}`;
      const headLines = wrapText(head, bold, 10, CONTENT_W);
      ensure(headLines.length * 14 + 2);
      for (const line of headLines) {
        page.drawText(line, { x: MARGIN, y, size: 10, font: bold, color: INK });
        y -= 14;
      }
      if (n.note) {
        paragraph(n.note, { font, size: 9.5, color: MUTED, lineGap: 3, x: MARGIN + 12, width: CONTENT_W - 12 });
      }
      y -= 4;
    }
  }

  // ---- What changed / risks / watch-outs ---------------------------------
  if (brief.what_changed.length) {
    sectionHeading("What changed this period");
    bullets(brief.what_changed);
  }
  if (brief.risks.length) {
    sectionHeading("Key risks");
    bullets(brief.risks);
  }
  if (brief.watch_outs.length) {
    sectionHeading("Watch-outs");
    bullets(brief.watch_outs);
  }

  // ---- Glossary -----------------------------------------------------------
  if (brief.glossary.length) {
    sectionHeading("Plain-English glossary");
    for (const g of brief.glossary) {
      if (!g.term || !g.plain) continue;
      paragraph(`${g.term} — ${g.plain}`, { font, size: 9.5, color: INK, lineGap: 3 });
      y -= 2;
    }
  }

  // ---- Footer / disclaimer (on whatever page we end on) -------------------
  gap(10);
  ensure(40);
  page.drawLine({
    start: { x: MARGIN, y: y + 4 },
    end: { x: PAGE_W - MARGIN, y: y + 4 },
    thickness: 0.75,
    color: RULE,
  });
  y -= 8;
  paragraph(
    "Generated by the Filing Summarizer at hudsonturansky.com. Educational summary only — not investment advice. Always verify against the original filing.",
    { font, size: 8, color: FAINT, lineGap: 3 },
  );
  if (meta.sourceUrl) {
    paragraph(`Source: ${meta.sourceUrl}`, { font, size: 8, color: FAINT, lineGap: 3 });
  }

  return await doc.save();
}
