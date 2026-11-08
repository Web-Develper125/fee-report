# Fee Reports – Agent Context (handover)

You continue the work of a previous agent for the user (Muhammad Ahmad). Read this fully before acting.
Do not repeat decisions already made. Do the next thing the user asks, nothing more.

## 1. What the project is

School fee reports. Two places hold the same report design:

| Place | Path | Purpose |
|---|---|---|
| Fee Reports repo | `A:\Ai Schooling System\Fee Reports` | Standalone HTML print previews with dummy data (the design is made and approved here first). Remote `origin` = `git@web-develper125:Web-Develper125/fee-report.git`, branch `main`. Served as GitHub Pages through `index.html`. |
| Frontend repo | `A:\Ai Schooling System\Software Code\Frontend` | The real React app. Report pages in `src\Report Pages\*.jsx` and `src\Pages\*.jsx`. Remote `ahmad-devwlper145/School-Management-System-Frontend-New`. |
| Server repo | `A:\Ai Schooling System\Software Code\Server` | Node backend. Remote `ahmad-devwlper145/School-Management-System-Backend-New`. |

Workflow per report: edit the HTML preview -> the user checks it -> migrate the same design and logic into the JSX page -> user says "final" -> rename with check marks -> push.

## 2. Marks and naming (very important)

- `✔️` = done, `✔️✔️` = migrated to the frontend, `✔️✔️✔️` = final.
- The three checks go on the file name AND, when every report in the folder is final, on the folder name.
  Example: `Fee Report\Unpaid Fee Report ✔️✔️✔️\Unpaid Fee Report (Summary) ✔️✔️✔️.html`.
- A folder with one unfinished report keeps no checks on the folder name.
- Report names: pairs are called `(Summary)` and `(Detailed)`. A report that has no second version yet is named `(Summary)` and the page gets a disabled "Print Detailed Report" button (done for Misleading Entries, Daily Closing, Family Advance Balance, Collected Fine).
- The markers are a naming convention only: `build-index.js` reads them.

## 3. Push rules

1. **Always run `node build-index.js` (in `A:\Ai Schooling System\Fee Reports`) before every push** and commit `index.html` together with the renamed reports. Never push `index.html` that links to files that are not committed (it happened once: broken links).
2. Only the Fee Reports repo is pushed unless the user says otherwise. The Frontend and Server repos are committed/pushed by the user themself. Never push the server.
3. Commit messages end with: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
4. Ask before anything hard to reverse. Do not commit or push when the user did not ask.
5. Use `git mv` for renames so history is kept (plain `mv` if the old path is already gone).

Typical final-and-push command sequence (adapt names):

```bash
cd "A:/Ai Schooling System/Fee Reports/Fee Report"
git mv "<Folder>" "<Folder> ✔️✔️✔️"
# rename each html inside the same way
cd ../.. && node build-index.js
git add -A "Fee Report" index.html
git commit -m "Mark <Report> final

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push
```

## 4. Current status (at hand-over)

Final (`✔️✔️✔️`): Arrear Reports (4 files: Student/Class Wise x Summary/Detailed), Collected Fine, Daily Closing, Date Wise Fee Collection (Detailed + Summary), Estimate Fee (3 reports), Family Advance Balance, Family Collected Fee, Family Dues, Generated Voucher (Summary + Detailed), Inactive Students Fee (Detailed + Summary), Misleading Entries, Payment Channel Wise (Summary), Unpaid Fee (Detailed + Summary).

Not final:
- `Date Wise Fee Transaction Report ✔️` – folder now holds `(Detailed)` and `(Summary)` html files without checks. Ask the user what is left.
- `Fee Collection Report` (no checks) – `Class Wise Fee Collection Report ✔️.html` and `Section Wise Fee Collection Report ✔️.html` (two separate reports, not a Summary/Detailed pair).

Uncommitted at hand-over: Frontend `src\Report Pages\Family Collected Fee Report.jsx` (print + preview migrated from the HTML). Server: `transportFee.controller.js` has an unproven edit (removed four "must exist" mode conditions for `PaymentChannelWiseReport`); the user was asked whether to keep or revert and never answered.

## 5. How the HTML previews and the JSX pages are built

- Print reports are template-literal HTML strings. In JSX they are written with `window.open(...).document.write(...)`, then `print()` on load. The HTML previews hold the same code with dummy data and do `document.open(); document.write(reportContent); document.close();` plus a preview-only "Print" button.
- Where a page also shows the report on screen (Payment Channel Wise, Family Collected), the page renders the same html with `dangerouslySetInnerHTML` and `zoom: 1.35`. All CSS is scoped under a class (`.pcw-report`, `.fcf-report`) so it cannot leak into the app. Dynamic text is escaped (`pcwEscape`, `fcfEscape`).
- **Do not duplicate code**: one builder function for preview and print; shared CSS constant. The user asked for this explicitly.
- Generating the HTML from the JSX source with a node script ("SAME CODE AS …jsx") was used for Generated Voucher so the two cannot drift. Other reports were hand-copied.
- In an HTML preview, `</script>` inside the template must be written `<\/script>`.

## 6. Design standard (all reports share it)

- A4 portrait, `@page margin: 6mm`, font Poppins (Google font import), body 9.5px, compact.
- Header: logo | school name + report title + filter rows (centered, `||` separators) | spacer; one black line under it.
- Stats: one horizontal grid strip, the main total in a grey box.
- Table: black outer header border, grey `#c4c4c4` header, no stripes, `border-collapse`, `thead` repeats, rows `page-break-inside:avoid`.
- Totals row grey (`Grand Total:` / `Section Total:`).
- Footer: `Generated on: dd/mm/yyyy | Powered by Ai Schooling System.com`.
- Column widths: **the user dislikes fixed widths** ("no fixed widths"). Use auto layout with `white-space:nowrap`; only one wide text column (e.g. Fee Details) may take the rest with `width:100%`. Some older reports still carry a `<colgroup>`; remove it when asked, never add new ones unasked.
- Father name goes on its own second line under the student name (`display:block`, smaller font).
- Numbers right aligned, zero shown as `-` where the design says so, `Rs.` only in the stats box.
- Report-specific: Reg # shows the last number of the code, zeros kept (`DPS-STD-001` -> `001`). Campus/Class/Section merged into one `Campus / Class / Section` column in Summary tables.
- Detailed Class Wise Arrear: every section on its own page; footer "Generated on…" is shown at the bottom of a section page only if there is room (script measures the page row by row).

## 7. Business rules worth knowing

- API: `POST /api/transportFee/getFeeDefaultersNewFast`, needs a Bearer token (401 without). `page` is a label that changes the query: `FeeIncomeReport`, `PaymentChannelWiseReport` (adds mode/source filter), `Collected Fine Report`, `PrintFeeVoucher`. `includeUnpaidFees` adds all unpaid invoices of returned students; `includeFamilyAdvance` returns each family's current balance (not date based). Family advance deposits in a range come from `GET /api/familyCredit/getFamilyAdvanceByDate/:school/:start/:end`. Never store or repeat tokens; the user once pasted a live admin token (advised to log out/in).
- Payments: payment segments = partial history + quick payment (paid_amount − partial sum), filtered by date range (+05:00), receiver, mode. Fee Receiving = paid − fee paid from family-credit mode. Net Receiving = Fee Receiving + advance received. Number Of Invoices/Students = those with a payment or discount in range for the selected receiver/mode.
- Generated Voucher: overdue adds fine; Clear fee counts only what was paid; Outstanding = max(0, net − paid); Fee After Disc = fee_after_discount + further discounts; Fine Applied = late_fine only when overdue.
- Arrears: due-dated vs within-due-date amounts; overdue rule = compare paying date (Paid) / clear date (Clear) / today (others) with the due date.

## 8. Tooling and checks

- Shell: Windows; Bash (Git Bash) and PowerShell both available. Use forward slashes in Bash.
- Syntax check a JSX page (no full build): from the Frontend folder
  `./node_modules/.bin/esbuild "src/<path>.jsx" --loader:.jsx=jsx --log-level=warning > /dev/null` and `./node_modules/.bin/eslint "src/<path>.jsx"` (look for `no-undef`, `no-unused-vars`).
- Edit scripts: write small node scripts (in a scratchpad folder, not in the repo) with exact-anchor replacements that throw when an anchor is missing; keep each file's line endings (several files are CRLF).
- Preview an HTML in a browser to check layout; the browser tool may refuse local files outside the project folder (copy a test page into the project folder, then delete it).
- Frontend pages use `ReusableTable` (props `pageItemsShowingSize`, `defaultPageLimitSize`, `tableFooter`, column `align`, `render`) and `Button` (`disabled`, `loading`, `startIcon`).

## 9. Working style the user expects

- Short, plain answers; example-based explanations when asked ("short and with example").
- Do exactly what was asked (e.g. "just add the breakdown, don't update too much").
- Say clearly what was tested and what was not (e.g. "syntax checked, not run in the app").
- The user types fast and with typos/voice-to-text errors ("powered by sql.com" meant the existing "Powered by Ai Schooling System.com" footer). Infer intent; ask one short question only if the answer changes the work a lot.
- Never invent results; do not push unless asked; mention uncommitted changes in other repos.
