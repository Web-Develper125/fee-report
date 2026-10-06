# Last context: school fee print reports (read this first)

This file explains everything that was done in the previous chats, how it was done, the rules the user (Ahmad) enforces, every calculation formula, and the exact final design of the four Fee Payment reports. A new agent should read it fully before touching anything.

Dates of the work: 2026-10-01 to 2026-10-06 (this file was fully rewritten on 2026-10-06; the older version said the Fee Payment reports were "final" in an earlier design, that is **outdated**). Platform: Windows 11, shell tools = Git Bash / PowerShell. The user speaks through voice-to-text, so words are often mis-heard (see the glossary at the end).

---

## 1. What the project is

The user builds a school software ("Ai Schooling System", React frontend + Node backend). The work in these chats is the **print reports** of the fee modules.

Workflow the user always follows, report by report:
1. Build a **standalone HTML preview** with dummy data (same shape as the app's API data), with a "Print" button.
2. The user reviews it and asks for many small changes until he says it is final.
3. Only then the final design is **migrated into the React page** (the page keeps its own data and calculation logic, only the design / report code changes). For the Fee Payment page this is done: all four reports are integrated and kept identical to the four HTML previews (see section 8).

### Locations (the folder was moved by the user: it is now `A:\Ai Schooling System\Fee Reports\`)

- HTML previews, folder `A:\Ai Schooling System\Fee Reports\`:
  - `Fee Payment\Fee Payment Simple Ledger Report.html` = **Student Ledger Report (Simple)**, portrait.
  - `Fee Payment\Fee Payment Family Simple Ledger Report.html` = **Family Ledger Report (Simple)**, portrait.
  - `Fee Payment\Fee Payment Detailed Ledger Report.html` = **Student Ledger Report (Detailed)**, landscape.
  - `Fee Payment\Fee Payment Family Detailed Ledger Report.html` = **Family Ledger Report (Detailed)**, landscape.
  - `Family Advanced Ledger Report\Family Advance Ledger Report.html` (simple, final) and `...\Family Advanced Ledger Detail Report.html` (detailed, final). Not changed in this stretch.
  - `Fee Report\Date Wise Fee Transaction Report\` is an **empty folder** the user created: most likely the **next report** (not started, wait for the user to describe it).
  - The folder is a git repository (branch `master`). Last commits: `cbcd2da Fix Minor Bugs`, `bf9cab3 ok`. **Nothing from the work of 2026-10-02..06 is committed** (the four HTML files show as modified). Never commit unless the user asks.
- Real app: `A:\Ai Schooling System\Software Code\`
  - `Frontend\src\Pages\Fee Payment.jsx` (the Fee Payment page). The report code is a module level block above `function FeePayment() {`: `FEE_LEDGER_CSS` (the css of the 4 reports) and `buildFeeLedgerReportHtml({...})`. The page has three print buttons: "Print Simple Report", "Print Detailed Report" and the old "Print Report" (old design, **unchanged**).
  - `Frontend\src\Pages\Family Credit System.jsx`, `Frontend\src\Report Pages\Family Credit Report.jsx`, `Frontend\src\Styles\Page Styles\Family Credit System.css` (Family Advance, migrated earlier).
  - `Server\src\family credit\familyCredit.controller.js`: `getStudentDues` projection got `student_father_phone: 1` (the father's phone was missing in the family reports). **The server must be restarted** for it to take effect.
- Memory notes of the agent: `C:\Users\Ahmad Genius\.claude\projects\A--Ai-Schooling-System-Fee-Reports\memory\` (and the older `...\A--Testing-During-Any-Project\memory\`).

---

## 2. Rules the user enforces (follow them exactly)

Design:
- **Black, white and grey only** (reports are printed on black and white printers). Light grey fills (#f0f0f0, #e6e6e6) and grey borders (#999, #d4d4d4) are fine. No colours, no animations.
- **Plain bordered tables**: 1px borders (#999), grey `#f0f0f0` header with bold uppercase text, no zebra stripes.
- **A4**, **7mm page margin** (`@page { size: A4 auto; margin: 7mm; }` now, see 3.0), body padding 5px, font Poppins, base font 9px.
- **Time in 12-hour format with AM/PM**, never 24-hour. Dates like `01 Oct 2026`, September prints as `Sept`.
- Zero / empty values are shown as a **light grey dash** (`<span class="zero-dash">-</span>`).
- Do not make the design "compact" to make a report fit. "Reduce the content" means **fewer rows / less dummy data**.
- Text must **never run out of a cell**. After any column or width change check every cell (fit check, section 6).
- Fixed column widths (`<colgroup>` with % widths and `table-layout: fixed`).
- Bold is used sparingly. The user removed bold from: waived (struck) fines, applied fines, fine amounts of every kind, the DISC / APL boxes, the Actual / Fee After Discount / Further totals of the total row, and the stat box amounts (only the "=" lines are bold, see 3.1).

Process:
- **Never overwrite an old report when the design changes: create a new file.** (Exception: the user explicitly names the file to change, which happened all the time in this stretch.) The user renames files himself and edits them by hand, so list the folder and re-read the file from disk before editing.
- **"Remove" = comment the code out** (inside JS template literals use `${'' /* ... */}`; in plain JS `//` or `/* */`; careful: a `*/` inside a block comment ends it, write `* /` in the copied text). Temporary preview helpers were deleted only with approval.
- **Change only what was asked, in the file named.** When he only asks for opinions ("suggest", "discuss", "which is better"), answer and **do not change anything** until he decides.
- After every change **tell the user each change** (add / edit / remove) in plain words, and say which files were changed.
- Migration to the React page: keep the page's data and logic; keep the print popup pattern (`window.open`, `document.write`, auto `print()` after 500 ms); list formulas; never change a formula silently. About editing `Fee Payment.jsx`: when the user says "don't change the file yourself, give me patches" give manual patches; when he says "do it on the file" edit it (backup first, then verify, section 6). The last request ("do these changes on fee payment.jsx") was edited directly.
- Reply short and plain (he reads Pakistani English / voice-to-text). Use "he/they" for people, never guess pronouns.
- When a requested layout is arithmetically wrong, **say so once**, then do exactly what he decides (this happened with the stat box, section 7).

---

## 3. Final design of the four Fee Payment reports (current state, 2026-10-06)

### 3.0 Common to all four
- Page structure: header (logo 56px, 44px in the family detailed report, school name h1, report title h2, one black line); top band (details box on the left with the Overdue / Not Yet Due line under it, stat box on the right); ledger table(s); `bottom-spacer` + `report-bottom` pinned to the end of the last printed page (Date Wise Breakdown, signature lines in the detailed reports only, "Generated on: dd/mm/yyyy | Powered by Ai Schooling System.com").
- Titles: Student Ledger Report (Simple) / (Detailed), Family Ledger Report (Simple) / (Detailed).
- **`@page { size: A4 auto; }`** in all four (the user changed it from portrait / landscape; the user chooses paper and orientation in the Print dialog). Note: `A4 auto` is not valid CSS; the browser ignores it. Headless Edge then uses US Letter, so test PDFs show 2 pages for reports that fit one A4 page. With `A4 portrait` the Student Simple report is 1 page. The Detailed reports were landscape before: tell the user if he complains that landscape is not forced.
- **No "Page X of Y" and no running student / family name at the top of the 2nd page** in any report (code commented out in the previews; `showRunningHeader = false` in the page).
- **No fine legend line** under the tables (commented out everywhere).
- Due date is underlined only when the fee is overdue (`item.due`).
- Rows are sorted: Overdue (not Clear, dues > 0, due), Not Yet Due (not Clear, dues > 0, not due), Paid (Clear or dues <= 0). Overdue and Not Yet Due by due date (then month order, generation date, title); **Paid by paying date, newest first**. No group heading bars.
- Table headings (renamed by the user, same in all four): **Sr #, Fee Title, Due Date, Paying Date, [Mode / Source (User) in the detailed ones], Actual Class Fee, Fee After Discount, Further Fee Disc, Fine, Total, Paid, Fee Dues**.
- Column widths: Simple `[4.5, 16.6, 9.5, 15.9, 6.7, 8.2, 7.2, 9.7, 6.9, 6.9, 7.9]`; Detailed `[3, 11, 7, 11, 16.5, 4.5, 5.5, 13, 12.5, 5, 5, 5.5]`.
- Date Wise Breakdown (Date / Discount / Paid), sibling reports "(All Siblings)".

### 3.1 The stat box (top right), the same idea in all four
It is a short calculation, read from top to bottom. Labels have no signs, the signs are in the amounts. First card label is **"Receivable"** (the user kept "Receivable", not "Payable": the app already says Receivable / Net Receivable).

Student reports:
| Line | Value | Style |
|---|---|---|
| Receivable | Σ Fee After Discount **+ Σ fine discounts** (overdue fees only) | normal |
| Disc (Further Fee + Fine) | `-` Σ further discounts + Σ fine discounts (overdue only) | normal |
| Fine Applied | `+` Σ fine of overdue fees | normal |
| Cleared Fee Waived | `-` Σ (total − paid) of Clear fees; **only shown when a fee was cleared** | normal |
| **= Net Receivable** | Σ (Clear ? paid : total) = the Total column | bold |
| Received | Σ paid | normal |
| **= Dues** | Σ (Clear ? 0 : dues) | bold, grey, bigger |

Family reports: the same lines, then **= Remaining** (bold) = family dues, **Family Advance** (`- amount`), and **= Net Dues** (bold, grey) or **= Advance Left** when the advance is bigger than Remaining.

The lines add up: Receivable − Disc + Fine Applied (− Cleared waived) = Net Receivable. Example (Student Simple, Rehan Ali data): 85,300 − 4,900 + 800 = 81,200; Received 81,200; Dues 0. The other three checked the same way (Student Detailed 78,100 − 2,100 + 2,700 = 78,700; Family Simple 109,600 − 1,600 + 5,300 = 113,300; Family Detailed 60,200 − 2,700 + 2,800 = 60,300). **History:** the arithmetic did not add up for a while (the user insisted on one layout after being warned); it was fixed by adding the fine discount to the Receivable card.

### 3.2 Fine column (rows)
- **Student Simple / Family Simple**: a fee that is **not overdue** shows only the grey dash. An overdue fee shows the **current fine at the right**; when part of the fine was waived the **original fine is struck through at the left** (`.fine-split`, flex, `<s>` + `<span>`). The strike is a **thin slanted line (0.7px) from the bottom left to the top right corner of the number** (a `linear-gradient(to bottom right, ...)` pseudo element, not a rotate). No ✓ / ✗ marks. All amounts normal weight. Zero fine without a discount = dash.
- **Student Detailed / Family Detailed**: not overdue = dash; overdue = the fine with its history as before (`Initial Fine: x`, the `▶ dis = amount, date` lines with time | user, `Current Fine: y`), no ✓ mark. Cell left aligned only when it has a history.

### 3.3 Total row (Grand Total in the student reports, "Student Total" per sibling in the family reports)
- Actual Class Fee, Fee After Discount, Further Fee Disc totals are **normal weight** (css rule is limited to `.ledger-table`, so the breakdown total keeps its bold). Total, Paid, Dues bold.
- The **Fine cell always shows two small boxes, DISC on the left and APL on the right**, each with a small grey label on top and the amount under it (9px, normal weight): `DISC 2,900 | APL 800`. When there is no fine discount DISC shows `0`. (Before: text `apl : x / dis : y`, only when a discount existed.)

### 3.4 Other details per report
- **Student reports**: details box (Student Name, Father Name, Reg #, Status, Class / Section, Campus, Phone, Family Advance (Sibling: n) highlighted); Overdue (n fees) = x | Not Yet Due (n fees) = y.
- **Family reports**: Family Code, Account Name (father), Phone, CNIC, Siblings, Family Advance highlighted; "Siblings (n)" table with columns Sr #, Reg #, Student Name, Class / Section, Campus, Status, **Net Receivable** (renamed from Receivable; = the student's Total sum), Received, Dues, and a "Family Total" row; then one ledger per sibling (title bar `Name (Reg)` left, `Class / Section` right) ending in a "Student Total" row; breakdown "(All Siblings)".
- **Detailed reports** have Mode / Source (User) cells (quick payment only = one plain line; partial payments = `▶ amount = mode / source` blocks with a small second line date time | user), Further Fee Disc history cells and signature lines (Prepared By / Checked By / Parent Signature). The Simple reports have none of these (signature lines commented out).
- The Student Simple preview currently holds the **real data of one student (Rehan Ali)** instead of the dummy data (the old dummy data is kept in a block comment). The other three previews still have their dummy data.

---

## 4. Data shape of the page (what the reports read)

One fee row (built by `getFeePaymentData`-like code in `Fee Payment.jsx`, same keys in the previews):
`title, fee_month, fee_year, fee_generation_date, due (bool), due_date, actual_fee, discount (%), fee_after_discount, fine, total, dues, status (Unpaid|Paid|Clear), paid_amount, partial_payment_history[{amount, date, payment_mode_id, payment_mode_source_id, payment_recieved_by}], paying_date, payment_method, further_discount_history[{date, amount, reason, discount_by, approved_by}], late_fee_fine_discount_history[same shape], payment_mode_id, payment_mode_source_id, payment_recieved_by, student (in family mode), clear_fee_date`.

API shape (monthlyFee[].fees[], customFee[], transferFee[]): monthly fee keys `fee_month, fee_year, due_date, late_fine, fee_status, fee_generation_date, actual_monthly_fee, monthly_fee_discount (%), paying_date, monthly_fee_after_discount, paid_amount, ...histories`; custom fee keys `custom_fee_name, actual_custom_fee, custom_fee_after_discount, custom_fee_fine, custom_fee_due_date, ...`. Important: **`monthly_fee_after_discount` is already reduced by the further discounts** (the page's discount / "Pay And Discount" saves it as paid + new payable), so the report's "Fee After Discount" per row = `fee_after_discount + Σ further discounts` (the value before the further discount). `late_fine` is the **current** fine (already reduced by fine discounts); the original fine = `late_fine + Σ fine discounts`.

Student object: `student_name, student_father_name, general_registration_code, student_class_name, student_section_name, student_campus_name, student_father_phone, student_status, family_credit, student_father_id_card_number` (CNIC). Family mode: `studentDataFromOfFeeMutipul` (siblings, the page loads up to 20), `totalDataMutipul` (all rows, each with `student`), `fatherIdCard` = family code, `totalStudent` (family list; empty in single mode, so the sibling count is unknown there and the label has no count).

Row building (also in the previews): `due = isFeeOverdue(...)`, `total = due ? fee_after_discount + fine : fee_after_discount`, `dues = total − paid_amount`.

Lookup helpers: `getModeName(id)`, `getSourceName(id)`, `formatDateTime`, `formatTime`.

---

## 5. Calculation formulas (what the reports use now)

Per fee row (computed by the page):
- `due` (overdue) = `isFeeOverdue({dueDate, compareDate: today, feeStatus, payingDate, clearFeeDate})`: dates compared as `en-CA` strings; Paid: paying date > due date; Clear: clear-fee date > due date; otherwise: today > due date.
- `total` = `due ? fee_after_discount + fine : fee_after_discount`; `dues` = `total − paid_amount`.
- Row **Fee After Discount** (column) = `fee_after_discount + Σ further_discount_history`.
- Row Fine cell: overdue only; original fine = `fine + Σ fine discounts`.

Report totals over a list of rows (one student, or all siblings together):
- `cleared` = `status === 'Clear'` (a Clear fee waives what is left).
- **Net Receivable** = Σ (cleared ? paid : total). (= Total column.)
- **Received** = Σ paid_amount.
- **Dues** = Σ (cleared ? 0 : dues).
- **Further total** = Σ further discounts. **Fee After Discount total** = Σ row Fee After Discount. **Actual total** = Σ actual_fee.
- **Fine discount total** = Σ fine discounts **of overdue fees only** (a fine discount on a fee that is not overdue is not inside Total, so it is ignored everywhere, and not shown in the fine cell either).
- **Discount** = Σ further + Σ fine discounts (overdue only). **The monthly percent discount is NOT part of it** (an old formula included it; that was wrong).
- **Fine Applied** (Fine total) = Σ fine of overdue fees.
- **Receivable** (first card) = Fee After Discount total + fine discount total.
- **Cleared Fee Waived** = Σ (total − paid) of cleared fees (stat box line, shown only when ≠ 0).
- Identity: Receivable − Discount + Fine Applied − Cleared waived = Net Receivable.
- **Overdue** = Σ dues of rows (not cleared, dues > 0, due) with count; **Not Yet Due** = same for not due. Overdue + Not Yet Due = Dues.

Family only:
- `familyAdvance` = `family_credit`. **Remaining** = family Dues. `duesAfterAdvance = Remaining − familyAdvance` = **Net Dues**; if negative the label becomes **Advance Left** and the absolute value is shown.
- Siblings table per student: Net Receivable = student's expected (Σ Total with the Clear rule), Received, Dues; "Family Total" = family totals.

Date Wise Breakdown (per student, or all siblings together):
- Every partial payment: `amount` to "received" on its date. Quick / full payment: `paid_amount − Σ partials` on `paying_date` (if not zero). Further discounts: to "discount" on their dates. **Fine discounts: only for overdue fees** (matches the stat box). Group by date (`en-CA`), sort ascending.
- `undatedReceived = max(0, totalReceived − datedReceived)`, `undatedDiscount = max(0, totalDiscount − datedDiscount)`; if > 0 a "Date not recorded" row is added so the totals match. The Discount total of the breakdown = the stat box Discount (further + fine).

Mode / Source (detailed): segments = every partial payment + a "quick" segment (`paid_amount − Σ partial`) when > 0. No segment: plain `mode / source (user)`; one quick segment: plain one line; otherwise the arrow blocks.

Worked example with real data (Rehan Ali, 22 fees, checked against an independent calculation): Receivable 85,300, Disc −4,900 (further 2,000 + fine 2,900), Fine Applied +800, Net Receivable 81,200, Received 81,200, Dues 0. Total row: Actual 92,300, Fee After Discount 82,400, Further 2,000, Fine DISC 2,900 / APL 800, Total 81,200, Paid 81,200, Dues 0. Date breakdown: 27 Sept 1,400 / 11,700; 29 Sept – / 2,600; 30 Sept 2,300 / 58,900; 01 Oct 600 / 4,000; 29 Oct 600 / 4,000 (two fees have a paying date of 28 Oct 2026, later than the test day; the report prints dates as stored).

---

## 6. How the pages are built and verified (technical notes)

Each HTML preview is one file: CSS in `<style>`, dummy data + the same helper functions as the app inside `<script>`, and a function that builds the page HTML as a template literal and inserts it into `document.body`. In `Fee Payment.jsx` one function `buildFeeLedgerReportHtml({ variant: 'simple'|'detailed', isFamily, systemSettings, getModeName, getSourceName, studentData, feeData, siblingCount, family, familyPages })` builds the same HTML string for the popup window, and `FEE_LEDGER_CSS = { simple, simpleFamily, detailed, detailedFamily }` holds the css. **The css in the page is the css of the four previews, verbatim** (everything between `<style>` and `/* preview only */`). The builder output must stay **identical to the preview page html**.

Mechanisms:
- **Bottom pinning** (`fitBottomBlocks`, `beforeprint`): hidden `.page-measure` element (portrait 281mm, landscape 196mm), simulates page breaks by walking the table rows, sets `.bottom-spacer` so `.report-bottom` sits at the end of the last page; `.report-bottom` needs `display: flow-root`. Safety margin 24px portrait, **80px landscape**. During measuring the body has class `measuring` (fixed page width `calc(196mm - 10px)` / `calc(283mm - 10px)`).
- Table rules: `tr { page-break-inside: avoid }`, `thead { display: table-header-group }`.
- Template literal trick for commented code: `${'' /* ... */}`.
- Slanted strike: `.fine-split > s { text-decoration: none; position: relative; } .fine-split > s::after { content: ""; position: absolute; left: 0; right: 0; top: 1.5px; bottom: 1px; background: linear-gradient(to bottom right, transparent calc(50% - 0.35px), #000 calc(50% - 0.35px), #000 calc(50% + 0.35px), transparent calc(50% + 0.35px)); }`.
- DISC / APL boxes: `td.fine-pair-cell { padding: 0 }`, `.fine-pair { display: flex }` with two `div`s each holding a `span` (label, 7px, grey) and a `b` (amount, 9px, weight 400).
- Leftover css in the Student Simple preview / page (harmless, can be removed): `td.fine-na { text-align: center }`, `td.fine-na.fine-zero`, `td.fine-na .fine-split ...` (from the old "center the not applied fine" idea, now the cell only shows a dash), `.summary-card.note` (not used), `.fine-legend`, the old `.fine-pair` order comments. The builder uses the class `fine-na fine-zero` for non overdue simple cells (the Family Simple preview was set to match).

Verification tools (Windows, no python: use node):
- Edge headless: `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=900,1350 --virtual-time-budget=5000 --screenshot="C:/full/forward/slash/path.png" "file:///A:/Ai%20Schooling%20System/Fee%20Reports/Fee%20Payment/<file>.html"` (write screenshots with forward slashes and a full path; `--force-device-scale-factor=2` to zoom). PDF: `--print-to-pdf=...` (also works with `--headless=new`); count pages with `grep -a -c "/Type /Page"`-style regex (`/\/Type\s*\/Page[^s]/g`). DOM dump: `--dump-dom` with a probe script that writes the result into a `<textarea>`/`<pre>`. The Browser pane of the app cannot screenshot local files.
- **Fit check** (after any width / text change): for every `td/th` compare the right edge of the text range with the right edge of the cell, flag gaps < 3.5px, also flag `scrollWidth > clientWidth`; skip the `.fine-pair-cell` cells (their text is centred). Run at the real print width (portrait 745-780px window, landscape 1060-1250px).
- **Preview vs page check**: take the builder block of `Fee Payment.jsx` (from `// FEE LEDGER REPORTS` to `function FeePayment() {`), run it with the dummy data slice of each preview (from `var systemSettings` to `/* ===== SAME CODE AS Fee Payment.jsx`), render both in Edge, compare the normalised `.student-report-page` html (strip comments and whitespace). Also compare the css of each `FEE_LEDGER_CSS` key with the preview css. Both must be identical. Scripts used (in the session scratchpad, which is cleared): `verify_all.js`, `css_check.js`, `ladder_check.js` (reads the stat cards from the rendered page and checks that they add up), `real_data_test.js` (real student data against an independent calculation), `fitcheck.js`, and the edit scripts `family_simple.js`, `detailed_student.js`, `family_detailed.js`, `patch_jsx.js`, `common.js`. Rebuild them if needed; the idea is above.
- esbuild syntax check of the page: `A:\Ai Schooling System\Software Code\Frontend\node_modules\.bin\esbuild "src/Pages/Fee Payment.jsx" --loader:.jsx=jsx --log-level=error` (prints nothing when ok).

Editing gotchas:
- Tool call text can mangle backslashes and `${}`: write node edit scripts with the Write tool and use placeholders (`@{` for `${`, `@@` for a backtick) that the script converts.
- Replace exact unique strings and fail loudly if the match count is not 1.
- The previews use LF in the working copy (git warns about CRLF); `Fee Payment.jsx` uses LF. Detect and keep line endings.
- Copying an old block into a `/* ... */` comment: replace any `*/` inside it with `* /` (a nested `*/` ended a comment early once and printed a stray `*/}` in the page).
- A css rule written after another with the same specificity wins: when making something normal weight, change the original declaration (a later `.fine-pair b { font-weight: 400 }` did not win over an earlier `font-weight: 700` that came later in the file).

---

## 7. Everything that changed in this stretch (chronological summary) and decisions

1. Fee Payment reports were integrated into `Fee Payment.jsx` (two buttons, student / family switch), formulas corrected (Discount no longer includes the monthly percent; Clear fees counted as paid; Net Receivable, Dues, Overdue / Not Yet Due rules), father's phone fixed in the backend projection and with a frontend fallback.
2. Simple reports: fine shown as struck-through original + current fine; total row `apl : / dis :`; fine legend removed; Fine column widened; strike line made slanted, then fitted corner to corner, then thinned.
3. The Student Simple preview got the real data of one student; formulas in the preview updated to the app's (they were old).
4. **Stat box redesign** (several rounds): four cards (Receivable, Discount, Received, Dues) → a step by step calculation. Names: Actual Fee → **Actual Class Fee**, After Discount → **Fee After Discount**, Further Disc → **Further Fee Disc**; first card "Total" was renamed by the user to **Receivable** (opinion asked: Receivable vs Payable, kept Receivable). Fine discount shown as one "Disc (Further Fee + Fine)" line; signs in the amounts; only the "=" lines bold; later the **Receivable value = Fee After Discount + fine discount** so the lines add up.
5. Fine column: three-part Fine column (Disc | Not Due | Applied) was built and then **reverted** by the user; ✓ / ✗ removed; fine amounts normal weight; not overdue fees show only a dash; waived (struck) amount normal weight; strike line thin.
6. Total row Fine cell: `DISC | APL` boxes (DISC left, APL right, 9px, normal weight), **always shown** (DISC 0 when no discount).
7. Page number and running student / family name removed (all reports). `@page` size `A4 auto`.
8. The same changes were applied to Family Simple, Student Detailed and Family Detailed (Detailed ones keep their fine history layout), then to `Fee Payment.jsx`, then the Receivable correction to all five files.
9. Siblings table column "Receivable" → "Net Receivable".

Decisions / things the user accepted (do not re-open without a reason):
- Not overdue fee: fine and fine discount are hidden (dash), also in the Detailed reports (history not shown for them).
- Fine discounts on not overdue fees are not counted anywhere.
- First card is called "Receivable" and equals Fee After Discount + fine discount.
- No legend, no page numbers, no running header.

Rejected / reverted (do not repeat): animated cards; compact spacing; bigger table fonts; automatic widths; dashed numbered blocks in Mode / Source; side by side breakdown groups; the stat box lines "Net Fee", "Fine Waived (not charged)" and "Total Discount" note; the three-part Fine column; the ✓ / ✗ marks; centring the not applied fine; `apl : / dis :` text in the total row; rotated (35deg) strike line.

---

## 8. State of the real app and open work

`Fee Payment.jsx`:
- Buttons: "Print Simple Report" (`handlePrintSimpleReport`), "Print Detailed Report" (`handlePrintDetailedReport`), old "Print Report" (`handlePrintReport`, unchanged). All three simple / detailed handlers go through `openFeeLedgerReport(variant)`: same guards and toasts as the old print, popup + `document.write` + auto print after 500 ms, `try/catch` around the builder. Check Family off = student report, on = family report (siblings loaded on screen, up to 20).
- The report block is verified identical to the four previews (page html and css) and passes esbuild. **It was not tested in the running app** (the user has to click the buttons with real data), and the print dialog was never tested.
- A backup of the page from before the last integration step is only in the session scratchpad (`FeePayment_before_report_changes.jsx`); the old previews are in the scratchpad as `orig_*.html` (cleared with the session).

Known leftovers / questions:
- The page footer cards and the report both use the Clear rule; the old "Print Report" is untouched.
- The sibling count shows only when `totalStudent` is loaded; the family report covers only the 20 siblings loaded on screen.
- Open check: whether "Apply Full Fee Discount" / "Pay And Discount" write into the further / fine discount histories (the reports read those histories).
- Server restart needed for the father's phone (see section 1).
- `A4 auto` behaviour (section 3.0). If the user wants a forced orientation again, use `A4 portrait` / `A4 landscape`.
- Two fees of the test data have a paying date in the future (28 Oct 2026); the report prints it as stored (a "later than today" warning was only suggested).
- Suggestions the user did NOT ask for (ignore unless he does): a one-line key under the table, a fee count line in the empty part of the student box, hiding "Overdue / Not Yet Due" when both are zero, page numbers in the family footer.

Next work: the user created the empty folder `Fee Report\Date Wise Fee Transaction Report`. **Ask which report it is, where its data / page code is, and propose a new HTML preview file name** before building anything.

---

## 9. Glossary: the user's voice-to-text mistakes

- "VMware page", "Vimet", "Webmail page", "free payment", "three payment" = **Fee Payment**. "ledger" = ledger.
- "Family Advance" = the family credit balance.
- "wave line", "center line", "wave fine amount", "cut" = **strikethrough** text. "strike 90 deg tilt" = a slanted line from top right to bottom left (we made it bottom left to top right, corner to corner).
- "render line", "due line", "underlined" = **underline**.
- "cross and tick" = ✗ and ✓. "arrow" = the `▶` sign.
- "find" / "file" often = **fine**. "feces" = fees. "ping date" = paying date.
- "old form" / "remove old form" = **remove bold**. "make bold" / "remove the bold of this" = font weight.
- "revert / revert their position" = swap the two items (or undo the last change when it says "revert code"). "Revert code" = undo the last change.
- "apl" = fine applied, "dis" / "disc" = discount. "waived" = a discount that cancelled part of the fine.
- "fixedorient" (heard once) = fixed orientation (portrait / landscape) in `@page size`.
- "Reduce the fee content" = fewer fee rows. "make this report the title correct" = fix the title text.

---

## 10. How to start the new session

1. Read this file, then the memory notes if they are loaded.
2. Re-read any file from disk before editing it (the user edits by hand and renames files).
3. For a new report ask which one it is and where its data / page code is; propose a new preview file name; follow section 2 for every change and report each change after each step.
4. For any change to a Fee Payment report keep the four previews and `Fee Payment.jsx` identical (run the preview vs page check in section 6).
