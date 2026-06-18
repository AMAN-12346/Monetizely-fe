# Monetizely Quoting Tool

A lightweight quoting application built for Monetizely. It allows analysts to define SaaS products (with tiers, features, and add-on pricing rules) and dynamically generate quotes for customers. The generated quotes provide a full line-item math breakdown and can be shared via a read-only URL.

## Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (via Mongoose)
- **Testing**: Jest (Backend Unit Tests), Playwright (Frontend E2E Tests)

---

## How to run the tool locally

The project is split into two directories: `monetizely-backend` and `monetizely-frontend`.

### 1. Start the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd monetizely-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the backend root:
   ```env
   MONGODB_URI=mongodb://localhost:27017/monetizely
   PORT=5001
   ```
   *(Ensure you have MongoDB running locally, or use a MongoDB Atlas connection string).*
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Start the Frontend
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd monetizely-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env.local` file in the frontend root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

### Running Tests
- **Backend Unit Tests (Pricing Math)**: Inside `monetizely-backend`, run `npm test`.
- **Frontend E2E Tests**: Inside `monetizely-frontend`, run `npx playwright test`.

---

## Deployment to Vercel

The project is split into two parts, and both can be deployed to Vercel easily.

**1. Deploying the Backend:**
- Create a new project in Vercel and point it to the `monetizely-backend` directory.
- Set the `Build Command` to `npm run build`.
- Add your `MONGODB_URI` environment variable (using MongoDB Atlas).
- The included `vercel.json` will automatically serve the Express app as a serverless function.

**2. Deploying the Frontend:**
- Create a new project in Vercel and point it to the `monetizely-frontend` directory.
- Add the `NEXT_PUBLIC_API_URL` environment variable, pointing to your deployed backend's URL (e.g., `https://your-backend-app.vercel.app/api`).
- Vercel will automatically build and deploy the Next.js app.

---

## Assumptions Made

1. **Term Discounts apply only to Base Tier Cost**: The 15% annual and 25% two-year discounts are applied *only* to the base per-seat tier pricing. They do not automatically discount fixed monthly add-ons or per-seat add-ons. 
2. **"Percentage of Product" Add-ons scale with Discounts**: If a customer selects a percentage-based add-on (e.g., 10% of product cost), the 10% is calculated against the **post-discount** base product cost.
3. **Independent Add-on Seats**: When a feature is sold as a "per-seat" add-on, the number of seats for that add-on can be different from the core product seats. (e.g., A company might buy 100 core product seats but only need 10 seats of a specific "API Access" add-on).
4. **Overall Quote Discount**: The final optional percentage discount applied at the end of the quote creation is applied to the **entire subtotal** (Base Tier Cost + All Add-ons).
5. **USD Currency**: As requested, all pricing logic handles USD explicitly and tax calculations are ignored for now.

---

## Decisions Made

1. **MongoDB**: Chose MongoDB/Mongoose because quoting catalogs often involve deeply nested, flexible documents (e.g., products -> features -> tier configurations -> pricing models). A NoSQL document structure maps perfectly to this without needing complex SQL JOINs.
2. **Pure Pricing Service (`pricingService.ts`)**: I completely decoupled the pricing math from the Express controllers and Mongoose models. The `pricingService` relies on pure TypeScript functions, making it incredibly easy to unit test every edge case without mocking a database.
3. **Next.js App Router**: Used the modern App Router to ensure fast navigation between the Catalog setup and the Quoting tool, leveraging server-side rendering for the read-only quote views to make them instantly shareable without loading spinners.
4. **Playwright for E2E**: Chose Playwright to test the full lifecycle (Create Product -> Configure Tier -> Configure Feature -> Generate Quote -> View Quote) because it mimics real user behavior and handles Next.js hydration seamlessly.

---

## Questions I would have asked

If we were collaborating on this feature, I'd ask:
1. **Proration & Mid-cycle adjustments**: How do we handle quotes for customers who want to add 10 more seats halfway through their annual term? Should the quoting tool support prorated quotes?
2. **Minimum Seats**: Do certain tiers have a minimum seat requirement (e.g., Enterprise requires at least 50 seats)? 
3. **Add-on Dependencies**: Are there scenarios where buying "Add-on B" requires you to already have "Add-on A" (or a specific Tier)?
4. **Quote Expiration**: Currently, the quoting tool assumes a standard validity period. Should analysts be able to customize the exact expiration date for a specific deal?

---

## What I would build next

If I had more time, I would focus on:
1. **Authentication & Authorization**: Implement a lightweight login (e.g., NextAuth) to ensure only analysts can edit catalogs or create quotes, while customers can only access the read-only share URLs.
2. **Quote PDF Export**: Add a backend service using Puppeteer or a specialized library to generate a polished, branded PDF version of the quote for analysts to attach to emails.
3. **Versioning & Immutability**: If a product's price is updated in the catalog, it shouldn't retroactively change historical quotes. I would implement a strict snapshotting system where a Quote saves a deep copy of the pricing catalog at the exact moment it was generated.
4. **CRM Integration**: Build webhooks to automatically sync accepted quotes and generated line items directly into Salesforce or HubSpot.
