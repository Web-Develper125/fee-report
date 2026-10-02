# Last context: school fee print reports (read this first)

This file explains everything that was done in the previous chat, how it was done, the rules the user (Ahmad) enforces, and every calculation formula used. A new agent should read it fully before touching anything.

Date of the work: 2026-10-01 to 2026-10-02. Platform: Windows 11, shell tools = Git Bash / PowerShell. The user speaks through voice-to-text, so words are often mis-heard (see the glossary at the end).

---

## 1. What the project is

The user builds a school software ("Ai Schooling System", React frontend + Node backend). The part of the work in this chat is the **print reports** of the fee modules.

Workflow the user always follows, report by report:
1. Build a **standalone HTML preview** with dummy data (same shape as the app's API data), with a "Print" button.
2. The user reviews it and asks for many small changes until he says it is final.
3. Only then the final design is **migrated into the React page's print function** (the page code keeps its own data and calculation logic, only the design changes).

Locations:
- HTML previews: `A:\Testing During Any Project\Fee Reports\`
  - `Family Advanced Ledger Report\Family Advance Ledger Report.html` (simple, FINAL)
  - `Family Advanced Ledger Report\Family Advanced Ledger Detail Report.html` (detailed, FINAL)
  - `Fee Payment\Fee Payment Detailed Ledger Report.html` (student, detailed, landscape, FINAL)
  - `Fee Payment\Fee Payment Family Detailed Ledger Report.html` (family, detailed, landscape, FINAL)
  - `Fee Payment\Fee Payment Simple Ledger Report.html` (student, simple, portrait, FINAL)
  - `Fee Payment\Fee Payment Family Simple Ledger Report.html` (family, simple, portrait, FINAL)
- Real app: `A:\Ai Schooling System\Software Code\Frontend\src\`
  - `Pages\Family Credit System.jsx` (Family Advance page, migrated)
  - `Report Pages\Family Credit Report.jsx` (migrated, restyled)
  - `Styles\Page Styles\Family Credit System.css`
  - `Pages\Fee Payment.jsx` (Fee Payment page, only partly migrated, see section 8)
- Memory notes of the previous agent (may also be loaded automatically): `C:\Users\Ahmad Genius\.claude\projects\A--Testing-During-Any-Project\memory\` (`report-design-rules.md`, `fee-reports-status.md`).

The user declared the Family Advance reports and all the Fee Payment reports **done**. The next report is **a completely different report** (not decided yet): wait for the user to name it.

---

## 2. Rules the user enforces (follow them exactly)

Design:
- **Black, white and grey only** (reports are printed on black and white printers). Light grey fills (#f0f0f0, #e6e6e6) and grey borders (#999, #d4d4d4) are fine. No colours, no animations ("the animated card was a joke").
- **Plain bordered tables**: 1px borders (#999), grey `#f0f0f0` header with bold uppercase text, no zebra stripes.
- **A4**, **7mm page margin** (`@page { size: A4 portrait|landscape; margin: 7mm; }`), body padding 5px, font Poppins, base font 9px.
- **Time in 12-hour format with AM/PM**, never 24-hour. Dates like `01 Oct 2026`, September prints as `Sept`.
- Zero / empty values are shown as a **light grey dash** (`<span class="zero-dash">-</span>`).
- Do not make the design "compact" to make a report fit. When the user says "reduce the content" he means **fewer rows / less dummy data**. (He reverted compact padding when it was tried.)
- Text must **never run out of a cell**. After any column or width change check every cell.
- Fixed column widths (a `<colgroup>` with % widths and `table-layout: fixed`) were chosen over automatic widths. If a long name or amount appears it wraps inside its own cell.

Process:
- **Never overwrite an old report when the design changes: create a new file.** (Exception: the user explicitly names the file to change.) The user renames files himself, so always list the folder and re-read the file from disk before editing; he also edits files by hand and an undo / rewind can revert things.
- **"Remove" = comment the code out** (inside JS template literals use `${'' /* ... */}`; in plain JS use `//` or `/* */`), do not delete it. For temporary preview helpers that were only for choosing (an options preview section) deleting was accepted.
- **Change only what was asked, one piece at a time, only in the file named.** Do not restyle other sections.
- After every change: **tell the user each change** (add / edit / remove) in plain words.
- For a migration into the React page: first tell the user what you understood and wait for "continue"; keep the page's data and logic; keep the print popup pattern (`window.open`, `document.write`, auto `print()` after 500 ms); after coding, **list every calculation formula used** and promise that no formula or value changed (design only).
- Reply short and plain; he reads in Pakistani English / voice-to-text. Use "he/they" for people, never guess pronouns.

---

## 3. Final design of every report (what each one looks like)

Common page structure (all Fee Payment reports):
1. Header: logo (56px) + school name (h1) + report title (h2), a single black line under it.
2. Top band: left details box (+ the Overdue / Not Yet Due line under it, same width as the box), right stats box.
3. Ledger table(s).
4. One-line legend under the table(s).
5. `bottom-spacer` + `report-bottom` block pinned to the end of the last printed page: Date Wise Breakdown, signature lines (detailed reports only), "Generated on: dd/mm/yyyy | Powered by Ai Schooling System.com".

Titles (h2 and `<title>`):
- Student Detailed: **Student Ledger Report (Detailed)**
- Student Simple: **Student Ledger Report (Simple)**
- Family Detailed: **Family Ledger Report (Detailed)**
- Family Simple: **Family Ledger Report (Simple)**
- (Family Advance reports: "Family Advance Balance Sheet" and "Family Advance Balance Sheet (Detailed)")

### 3.1 Student Detailed (landscape)
- Details box (4 columns x 2 rows): Student Name, Father Name, Reg #, Status, Class / Section, Campus, Phone, **Family Advance (Sibling: n)** highlighted (grey box, black border). Stats box (4 rows): Receivable =, Discount =, Received =, **Dues =** (grey, bigger). Under the details box: Overdue (n fees) = x | Not Yet Due (n fees) = y (a "Paid" part exists but is commented out).
- Table columns (12): Sr #, Fee Title, Due Date, Paying Date, Mode / Source (User), Actual Fee, After Discount, Further Disc, Fine, Total, Paid, Fee Dues. (Status, Disc %, and the Due Yes/No column are commented out.) Column widths: `[3, 11, 7, 11, 16.5, 4.5, 5.5, 13, 12.5, 5, 5, 5.5]` %.
- Grand Total row (label spans 5 columns).
- Mode / Source cell:
  - quick payment only (paid in one go): plain one line `Family Advance / Bank (DEMO)`, no arrow.
  - one or more partial payments: one block per payment, `▶ 100 = Family Advance / Bank` and a small second line `01 Oct 2026 2:16 PM | DEMO` (arrow also for a single partial).
- Further Disc cell: `▶ dis = 600, 12 Sept 2026` + small line `4:10 PM | DEMO` (arrow on every history, also a single one). Fine cell with a fine discount history: `Initial Fine: 300`, the `▶ dis = 60, 20 Sept 2026` / `2:20 PM | DEMO` entries, `Current Fine: 200 ✓`.
- Signature lines (Prepared By / Checked By / Parent Signature) are ACTIVE here and in the family detailed report.

### 3.2 Family Detailed (landscape)
- Top band left: family box (3 columns): Family Code, Account Name (father), Phone, CNIC, Siblings, **Family Advance** highlighted; under it the Overdue / Not Yet Due line (whole family). Right: 6 stat rows: Receivable =, Discount =, Received =, Remaining =, Family Advance = (shown as - amount), **Net Dues =** (or **Advance Left =** when the advance is bigger than Remaining).
- "Siblings (n)" table: Sr #, Reg #, Student Name, Class / Section, Campus, Status, Receivable, Received, Dues + Family Total row.
- One ledger per sibling (title bar: `Name (Reg)` left, `Class / Section` right) using the same detailed table as the student report, ending with a "Student Total" row.
- Legend, then "Date Wise Breakdown (All Siblings)" as ONE column (`const GROUPS = 1` in the code; 2 or 3 would put the dates side by side), signature lines, footer.
- Running header (family name in the margin) and "Page X of Y" are SWITCHED OFF (`SHOW_PAGE_HEADER_AND_NUMBERS = false`). The student reports still have them.
- The dummy data was trimmed by the user's request so that it prints on **2 pages**.

### 3.3 Student Simple (portrait)
- Same details box and stats; Overdue / Not Yet Due line.
- 11 columns: Sr #, Fee Title, Due Date, Paying Date, Actual Fee, After Discount, Further Disc, Fine, Total, Paid, Fee Dues. Widths: `[5, 16, 10, 16.5, 6.5, 8, 7.5, 8, 7, 7, 8.5]`.
- No Mode / Source and no history columns: Further Disc shows only the total amount, Fine shows only the current fine.
- Signature lines are commented out (removed on the user's request).

### 3.4 Family Simple (portrait)
- Same as Family Detailed but with the simple 11-column table per sibling, 4-column breakdown table (single column of dates), no signature lines, and the running header + page numbers still on.

### 3.5 Rules shared by all four Fee Payment reports (decided during the chat)
- Fine cell: `300 ✓` when the fine applies (fee overdue, included in Total); `300 ✗` when not applicable (fee not overdue); zero fine = light grey dash. No underline on fines. The original (struck-through) fine is NOT shown any more.
- **Due date is underlined only when the fee is overdue** (`item.due`).
- Sorting of the rows: group 1 Overdue (dues > 0 and `due`), group 2 Not Yet Due (dues > 0 and not `due`), group 3 Paid (dues <= 0). Groups 1 and 2 are sorted by due date (then month order, generation date, title); **group 3 by paying date, newest first**. No group heading bars are shown (the code for bands/subtotals exists but is switched off with `showGroupRows = false` in the simple student report).
- Legend line under the tables: `Underlined due date = overdue (...) | 300 ✓ = fine applied (fee overdue, included in Total) | 300 ✗ = fine not applicable (fee not overdue) | - = nothing / zero`.
- Fee Payment: "Date Wise Breakdown" table (Date / Discount / Paid), 40% wide.
- Column header label is "After Discount" everywhere (the old "Fee After Discount" is kept as a comment in the detailed report).
- Paying Date cell may wrap (date and time stay whole: `.dt span { white-space: nowrap; }`), it must never run out of the cell.

---

## 4. Data shape of the page (what the reports read)

One fee row (built by `getFeePaymentData`-like code in `Fee Payment.jsx`, same keys in the dummy data):
`title, fee_month, fee_year, fee_generation_date, due (bool), due_date, actual_fee, discount (%), fee_after_discount, fine, total, dues, status (Unpaid|Paid|Clear), paid_amount, partial_payment_history[{amount, date, payment_mode_id, payment_mode_source_id, payment_recieved_by}], paying_date, payment_method, further_discount_history[{date, amount, reason, discount_by, approved_by}], late_fee_fine_discount_history[same shape], payment_mode_id, payment_mode_source_id, payment_recieved_by, student (in family mode)`.

Student object: `student_name, student_father_name, general_registration_code, student_class_name, student_section_name, student_campus_name, student_father_phone, student_status, family_credit, student_father_id_card_number` (CNIC). Family mode: `studentDataFromOfFeeMutipul` (siblings, up to 20 per page), `totalDataMutipul` (all rows, each with `student`), `fatherIdCard` = family code, `totalStudent` (family list; empty in single mode, so the sibling count is unknown there).

Lookup helpers in the page: `getModeName(id)`, `getSourceName(id)` (payment channel names), `formatDateTime`, `formatTime`.

---

## 5. Calculation formulas (the ones used in all Fee Payment reports)

These formulas existed in the app and were only re-used by the reports. **No formula was changed.** (The only reporting-side decisions are the ones marked "report".)

Per fee row (already computed by the page):
- `due` (overdue) = `isFeeOverdue({dueDate, compareDate: today, feeStatus, payingDate, clearFeeDate})`:
  - compare dates as `en-CA` strings (yyyy-mm-dd);
  - status Paid: overdue if paying date > due date; status Clear: overdue if clear-fee date > due date; otherwise (unpaid): overdue if today > due date.
- `total` = `due ? fee_after_discount + fine : fee_after_discount`
- `dues` = `total - paid_amount`

Report totals over a list of rows (one student, or all siblings together for the family):
- **Net Receivable** (sum of the Total column) = Σ `total`
- **Received** (sum of Paid) = Σ `paid_amount`
- **Dues** (sum of Fee Dues) = Σ `dues`  (= Σ total − Σ paid)
- **Discount** = Σ over rows of [ `max(0, actual_fee − fee_after_discount)` + Σ amounts of `late_fee_fine_discount_history` ]. (The `max(0, ...)` part is the monthly discount plus further discounts, as far as the data shows; the second part is the fine discounts.)
- **Receivable** (first stat box) = Net Receivable + Discount
- **Actual Fee total** = Σ `actual_fee`
- **After Discount, per row** = `fee_after_discount + Σ further_discount_history amounts`; **total** = Σ of those
- **Further Disc total** = Σ further discount amounts
- **Fine total (Grand Total row)** = Σ `fine` only for rows where `due` is true (the fines that are really inside Total) — report decision. The detailed report also shows `dis X` (Σ fine discounts) under it when X > 0.
- Check: Σ(After Discount column) − Σ(Further Disc) relates to Σ(Total) only for non-overdue rows (Total itself uses `fee_after_discount`, not the displayed After Discount).
- **Overdue line** = Σ `dues` of rows with `dues > 0 and due`, with their count; **Not Yet Due** = Σ `dues` of rows with `dues > 0 and not due`. **Overdue + Not Yet Due = Dues** (this was checked in every report, e.g. 18,800 + 37,000 = 55,800).

Family only:
- `familyAdvance` = `family_credit` (the same value on every sibling).
- **Remaining** = family Dues (Σ over all siblings).
- `duesAfterAdvance = Remaining − familyAdvance`; **Net Dues** = `duesAfterAdvance`; if it is negative the label becomes **Advance Left** and the absolute value is shown (`advanceCoversDues = duesAfterAdvance < 0`).
- Siblings table per student: Receivable = student's Total + student's Discount, Received = student's Paid sum, Dues = student's Dues sum; "Family Total" = totals of the whole family.

Date Wise Breakdown (per student, or all siblings together):
- For every partial payment: add `amount` to "received" on the payment date.
- Quick / full payment: `quick = paid_amount − Σ partial amounts`, added to "received" on `paying_date` (if it is not zero).
- Further discounts and fine discounts: add their amounts to "discount" on their date.
- Group by the date (`en-CA` key), sort ascending.
- `undatedReceived = max(0, totalReceived − datedReceived)`, `undatedDiscount = max(0, totalDiscount − datedDiscount)`; if > 0 a "Date not recorded" row is shown so the totals always match Received and Discount.

Mode / Source (detailed reports): `segments` = every partial payment, plus a "quick" segment of amount `paid_amount − Σ partial` when it is > 0. No segments: plain `mode / source (user)`. One segment that is the quick one: plain one-line text. Otherwise the arrow blocks.

Worked example (Student Simple dummy data): Receivable 80,700, Discount 1,100, Received 22,000, Dues 57,600 (= Overdue 19,600 + Not Yet Due 38,000).
Worked example (Family Simple): Receivable 114,900, Discount 1,600, Received 31,400, Remaining 81,900, Family Advance 78,000, Net Dues 3,900.

### Family Advance reports (earlier work, same page style)
- Family Credit System page: a credit/debit ledger (Date + time, Title with the student in brackets, Type, Mode / Source / User, Debit, Credit, Balance). The simple report shows 4 stat cards, the student wise debit summary and a date breakdown; the detailed report shows every transaction with notes / Txn ID lines and the student wise debit summary. Opening balance rows were removed on request. Pin script puts the summary at the bottom of the last page.

---

## 6. How the pages are built (technical notes)

Each HTML preview is one file: CSS in `<style>`, dummy data + the same helper functions as the app inside a `<script>`, and a function that builds the page HTML as a template literal and inserts it into `document.body`. The React print function builds the same HTML string and writes it into a popup window.

Important mechanisms:
- **Bottom pinning** (`fitBottomBlocks`, run on `beforeprint`): measures the page height with a hidden `.page-measure` element (portrait 281mm, landscape 196mm), simulates the print page breaks by walking the table rows (a row that does not fit moves to the next page and the table header repeats), then sets the height of `.bottom-spacer` so the `.report-bottom` block sits at the end of the last page. `.report-bottom` needs `display: flow-root` so margins count. Safety margin: 24px portrait, **80px landscape** (landscape needed more; an extra blank page appears if it is too small). During measuring the body gets class `measuring` which fixes the page width (`calc(196mm - 10px)` portrait, `calc(283mm - 10px)` landscape).
- Running header / page numbers: injected `@page { @top-left {...} @bottom-right { content: "Page " counter(page) " of " counter(pages) } }` plus `@page :first { @top-left { content: "" } }`.
- Table rules: `tr { page-break-inside: avoid }`, `thead { display: table-header-group }` (header repeats).
- Template literal tricks: inside the big template, "commented out" code is written `${'' /* ... */}`; HTML comments `<!-- -->` also appear in the output.
- Fixed widths are written as `<colgroup><col style="width:..%">...</colgroup>` and `.ledger-table { table-layout: fixed; }`.

Verification tools (Windows):
- Edge headless: `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=out.pdf "file:///A:/.../report.html"` then count pages with `grep -a -o "/Count [0-9]*" out.pdf | head -1`; `pdftotext -f N -l N -layout out.pdf -` to see what is on page N. Screenshot: `--window-size=1123,1500 --force-device-scale-factor=1.5 --virtual-time-budget=5000 --screenshot=out.png`. DOM dump: `--dump-dom` (add `--virtual-time-budget=4000` so the script has run).
- No python on the machine: use **node** scripts. esbuild for JSX syntax checks: `A:\Ai Schooling System\Software Code\Frontend\node_modules\.bin\esbuild "src/Pages/Fee Payment.jsx" --loader:.jsx=jsx --log-level=error --outfile=/dev/null`.
- **Cell fit check** (use after every width change): inject a script that, for every `td/th`, takes a `Range` over the cell contents, compares the right edge of the text with the right edge of the cell, and reports cells where the gap is below ~3.5px (negative = runs out of the cell). Run it at the real print width: landscape 1070px window, portrait 745px window.
- Page-count check for each report: Student Detailed 2 pages, Family Detailed 2, Student Simple 1, Family Simple 2 (with the current dummy data).

Editing gotchas:
- The text of tool calls can mangle backslashes and `${}`; write node edit scripts with the Write tool and use placeholders (`@{` for `${`, `@@` for a backtick) that the script converts, or split strings with `String.fromCharCode`.
- Always replace exact unique strings and fail loudly if the string is not found (`split(a).length === 2`).
- Files may use CRLF: detect and keep the line endings.

---

## 7. Things that were tried and rejected (do not repeat)

- Animated / fancy "family card" design (rejected as a joke).
- Compact spacing to force a report onto fewer pages (user: "reduce the content, not change the design into compact").
- Larger fonts in the table (caused wrapping; the user asked to revert all font increases; header 9px, body 9px, key columns 10-13px as set).
- Automatic column widths (columns became too wide); fixed widths with small increases were chosen.
- Numbered blocks with dashed separators in the Mode / Source cell (too much space); the final choice is the small arrow `▶` with a two-line block.
- The struck-through original fine and the underline on fines (removed, replaced by ✓ / ✗).
- Side by side (3 groups) Date Wise Breakdown (removed, one column).
- Running header / page numbers on the Family Detailed report (removed on request).

---

## 8. State of the real app and open work

`Fee Payment.jsx`:
- `handlePrintReport` (old design, the "Print Report" button in `renderAfterExportButton`) is **unchanged**.
- `handlePrintSimpleReport` + a "Print Simple Report" button were added (single student -> simple student report; Check Family on -> family simple report; uses `studentDataFromOfFee/totalData` or `studentDataFromOfFeeMutipul/totalDataMutipul`, `selectedFamilyCode()`, CNIC from `student_father_id_card_number`). It was written at an **early stage of the design**: it still has the struck-through fine, underlines, the old titles, old column widths, no Overdue / Not Yet Due line, no ✓/✗. The sibling count only shows when `totalStudent` is loaded (so never in single mode, the label then has no count).

Open tasks (none started, wait for the user):
1. Bring `handlePrintSimpleReport` up to the final simple designs (titles above, ✓/✗ fine marks, underline on overdue due dates only, paid sorted by paying date, fixed widths, Overdue / Not Yet Due line, wrapping Paying Date).
2. Migrate the two Detailed reports (student + family) into the page (probably replacing / re-using `handlePrintReport`).
3. The next, different report the user will name.

---

## 9. Glossary: the user's voice-to-text mistakes

- "VMware page", "Vimet", "Webmail page", "free payment", "three payment" = **Fee Payment** (page / report).
- "Family Advance" = the family credit balance (also "family free" etc.).
- "wave line", "center line", "wave fine amount" = **strikethrough** text.
- "render line", "due line", "underlined" = **underline**.
- "cross and tick" = ✗ and ✓. "arrow" = the `▶` sign.
- "fine" sometimes = "find" / "file" (e.g. "underline on the file" = fine).
- "Mode and source" = the Mode / Source column. "ping date" = paying date. "Feces" = fees. "Reduce the fee content" = fewer fee rows.
- "make this report the title correct" = rename the title text of the report.

---

## 10. How to start the new session

1. Read this file, then the two memory notes if they are loaded.
2. Before changing anything for the new report, **ask the user which report it is and where its data / page code is** (he usually shares the JSX page and some dummy data), and propose a new HTML preview file name.
3. Follow section 2 for every change, and tell the user what changed after each step.
