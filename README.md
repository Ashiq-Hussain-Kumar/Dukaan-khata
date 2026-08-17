# Dukaan Khata

A shop billing and customer ledger app built with React — the kind of tool a small shop owner would use to track customers, sales, payments, and returns in place of a paper notebook (*khata*).



---

## What it does

- **Customers** — add, search, edit, and delete customer records
- **Transactions** — record sales (with line items), payments, and returns against a customer
- **Running balance** — every customer's outstanding balance updates automatically as transactions are added, edited, or deleted
- **Dashboard** — at-a-glance totals for sales, collections, and outstanding dues
- **Full CRUD on transactions** — create, view, edit, and delete, with balance corrections applied correctly in every case (including reassigning a transaction to a different customer)
- **Persistence** — data survives a page refresh via `localStorage`

## Tech stack

- React (Vite)
- React Router
- Context API for state management
- Tailwind CSS
- lucide-react for icons

No backend yet — all data lives in the browser via Context + `localStorage`. A real backend (Firebase, then a custom Node/Express API) is the planned next phase.

## What I learned building this

This started as a simple billing UI and turned into a real lesson in why ledger/accounting software is harder than it looks:

- **Derived vs. stored data.** Early versions stored a running `balance` snapshot on each transaction. Any edit or out-of-order insert made it stale. The fix was to stop storing it and instead compute each transaction's running balance fresh, on every render, from the full transaction history — the same reason real accounting systems treat their ledger as the source of truth rather than caching balances.
- **Balance consistency across edits.** Editing a transaction's amount, or reassigning it to a different customer, has to correctly reverse the old effect and apply the new one — on the right customer, in the right direction, for the right transaction type (sale, payment, return). Getting this right (and catching the bugs where it wasn't) was the most genuinely difficult part of the project.
- **Controlled components, done consistently.** A recurring bug throughout development was a form's `value` reading from one variable while `onChange` wrote to another — the classic controlled-input mismatch. Fixing it enough times made it second nature.
- **State shape matters.** Mutually exclusive UI states (view/edit/delete modes, which dropdown is open) are far easier to reason about as a single variable with a few possible values than as several independent booleans that have to be kept in sync by hand.

## Known limitations / not yet built

- No authentication — all data is local to one browser, not tied to a real user
- No backend — data doesn't sync across devices
- TypeScript not yet added (planned next)

