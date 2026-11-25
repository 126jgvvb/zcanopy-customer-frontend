"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { COLORS } from "@/lib/theme";

/**
 * Rendered from a small block model rather than one long string so the
 * headings, lists and anchors stay semantic (Google Play reviewers and
 * screen readers both benefit). Text is supplied as ReactNodes so inline
 * links and emphasis are possible.
 */
type Block =
  | { kind: "p"; content: ReactNode }
  | { kind: "h3"; content: string }
  | { kind: "ul"; items: ReactNode[] }
  | { kind: "ol"; items: ReactNode[] };

interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

const SUPPORT = "support@support.zcanopy.com";

const SECTIONS: Section[] = [
  {
    id: "who-we-are",
    title: "1. Who We Are & How to Contact Us",
    blocks: [
      {
        kind: "p",
        content: (
          <>
            This Privacy Policy applies to the <strong>ZCanopy</strong> mobile
            application, web platform (
            <a
              href="https://www.zcanopy.com"
              className="underline decoration-[var(--zcanopy-border)] underline-offset-2"
            >
              https://www.zcanopy.com
            </a>
            ), and related services (collectively, the{" "}
            <strong>&ldquo;Platform&rdquo;</strong>), operated by{" "}
            <strong>ZCanopy</strong> (<strong>&ldquo;ZCanopy,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;</strong>{" "}
            or <strong>&ldquo;our&rdquo;</strong>) in Kampala, Uganda.
          </>
        ),
      },
      {
        kind: "p",
        content:
          "If you have questions about this Privacy Policy, how your data is handled, or how to exercise your privacy rights, contact us at:",
      },
      {
        kind: "ul",
        items: [
          <>
            <strong>Privacy &amp; Support Email:</strong>{" "}
            <a href={`mailto:${SUPPORT}`} className="underline underline-offset-2">
              {SUPPORT}
            </a>
          </>,
          <>
            <strong>Phone / Support Channel:</strong>{" "}
            <a href="tel:+256741882818" className="underline underline-offset-2">
              +256741882818
            </a>
          </>,
          <>
            <strong>Business / Physical Address:</strong> Kampala, Uganda
          </>,
        ],
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    blocks: [
      {
        kind: "p",
        content:
          "Depending on how you use ZCanopy—as a prospective renter/client, a landlord/property owner, or a listing poster/broker—we collect the following categories of information:",
      },
      { kind: "h3", content: "A. Account & Profile Information" },
      {
        kind: "ul",
        items: [
          "Name, phone number, email address, and account credentials/authentication details.",
          "Role or account type (such as client/renter, broker, agent, or landlord).",
        ],
      },
      { kind: "h3", content: "B. Identity, Landlord Consent & Property Verification Data" },
      {
        kind: "p",
        content:
          "To prevent fraud, confirm landlord consent, and verify property availability and ownership details:",
      },
      {
        kind: "ul",
        items: [
          "Identity verification details (such as a valid government-issued ID or National Identification Number and supporting verification records where required).",
          "Landlord details and consent records (such as landlord name, national identification number, phone number, property location, neighborhood/area, rental pricing, availability status, photos/videos, and property/title verification details where applicable). Landlord details collected for verification and fraud prevention are not published to customers or used for marketing.",
          "Payout and account details for approved poster/broker fees or verified payouts.",
        ],
      },
      { kind: "h3", content: "C. Booking, Payment & Escrow/Refund Records" },
      {
        kind: "ul",
        items: [
          "Property booking or reservation records, escrow/commission/fee references, and payment transaction references (such as mobile money or payment gateway references—we do not store full raw payment PINs or card PINs on our servers).",
          "Refund requests and supporting ground-visit verification materials (such as visit date, transaction reference, description of findings, and photos or short videos submitted to support a claim).",
        ],
      },
      { kind: "h3", content: "D. Location & Device / App Usage Data" },
      {
        kind: "ul",
        items: [
          <>
            <strong>Location Data:</strong> Approximate or precise location data
            (such as when searching for rentals near an area, submitting a
            property listing or inspection report, or verifying on-ground
            property visits, subject to your device permissions).
          </>,
          <>
            <strong>Device &amp; Diagnostic Data:</strong> Device model, operating
            system version, app version, crash logs, performance telemetry, and
            basic network/IP information used to keep the Platform reliable and
            secure.
          </>,
        ],
      },
      { kind: "h3", content: "E. Communications" },
      {
        kind: "ul",
        items: [
          "Messages, support tickets, verification inquiries, and reports you send to ZCanopy support or through Platform workflows.",
        ],
      },
      { kind: "h3", content: "F. Advertising & Device Identifiers" },
      {
        kind: "p",
        content:
          "Some versions of the app display advertising through Google AdMob. When ads are shown, Google and its partners may collect:",
      },
      {
        kind: "ul",
        items: [
          "Device advertising identifiers (such as the Android Advertising ID), IP address, and general device/app information.",
          "Approximate location derived from your IP address, and your interactions with an ad (such as views, clicks, and the ad's performance).",
        ],
      },
      {
        kind: "p",
        content:
          "This data is used to serve and measure ads and to prevent ad fraud. You can reset or delete your advertising ID, or opt out of personalised advertising, in your device settings (Android: Settings → Google → Ads).",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Information",
    blocks: [
      { kind: "p", content: "We use collected information to:" },
      {
        kind: "ol",
        items: [
          <>
            <strong>Provide and operate the Platform:</strong> Display rental
            listings, manage bookings/reservations, coordinate property
            inspections, and facilitate payments or payouts.
          </>,
          <>
            <strong>Verify listings, consent, and identity:</strong> Confirm that
            the person offering a property is the owner or authorized
            representative, validate property details, and prevent fraudulent or
            duplicate listings.
          </>,
          <>
            <strong>Process payments, commissions, and refunds:</strong> Handle
            booking payments, applicable platform commissions/fees, payouts, and
            refund reviews (including on-ground verification).
          </>,
          <>
            <strong>Maintain safety, security, and legal compliance:</strong>{" "}
            Detect abuse or fraud, investigate irregular or reported
            transactions, protect users and property records, enforce our Terms
            of Agreement, and respond to lawful requests from courts, regulators,
            or law enforcement authorities.
          </>,
          <>
            <strong>Improve the app and user experience:</strong> Fix crashes,
            optimize performance, and understand how features are used.
          </>,
          <>
            <strong>Show advertising:</strong> Where ads are displayed, serve and
            measure them, which keeps the free parts of the Platform running.
            Advertising identifiers are handled as described in Section 2F.
          </>,
        ],
      },
    ],
  },
  {
    id: "how-we-share",
    title: "4. How We Share & Disclose Information",
    blocks: [
      {
        kind: "p",
        content: (
          <>
            We do <strong>not</strong> sell your personal data to data brokers. We
            share information only in the following circumstances:
          </>
        ),
      },
      {
        kind: "ul",
        items: [
          <>
            <strong>Service Providers &amp; Infrastructure Partners:</strong> With
            trusted third-party vendors that help us host and run the Platform,
            authenticate users, process payments/mobile money/payouts, deliver
            maps/location services, or monitor app stability and
            analytics—strictly to perform services on our behalf under
            confidentiality and security obligations. These currently include
            Google (Sign-In and Maps/geocoding), Amazon Web Services (S3 object
            storage for property media), Pesapal (payments and mobile money),
            Resend (email delivery), UgaText (SMS delivery), Google Firebase
            (push notifications and crash reporting), Google AdMob (advertising,
            including device advertising identifiers), and Vercel (web hosting).
          </>,
          <>
            <strong>Transaction &amp; Verification Counterparties:</strong> Where
            necessary to complete a booking, verify landlord consent, confirm
            property availability/pricing, or process a refund or payout (for
            example, sharing relevant booking or listing context with involved
            clients, brokers/agents, landlords, or payment channels as needed for
            verification).
          </>,
          <>
            <strong>Law Enforcement, Regulators &amp; Fraud Investigations:</strong>{" "}
            Where fraudulent, criminal, or otherwise unlawful activity is
            suspected or reported in connection with an account or transaction,
            or where required by applicable law, court order, or lawful
            government/law enforcement request, we may disclose personal and
            account information (such as full name, identity documents, phone
            number, email address, transaction history, and related records) to
            relevant law enforcement agencies, regulatory bodies, or competent
            authorities, or when reasonably necessary to investigate, prevent, or
            prosecute fraud or protect safety and property rights.
          </>,
          <>
            <strong>Business Transfers:</strong> In connection with a merger,
            restructuring, financing, or sale of all or part of our business
            assets, subject to appropriate safeguards.
          </>,
        ],
      },
    ],
  },
  {
    id: "security",
    title: "5. Data Security",
    blocks: [
      {
        kind: "p",
        content:
          "We implement reasonable technical and organizational safeguards designed to protect personal information against unauthorized access, alteration, loss, or disclosure—including encrypted data transmission (such as HTTPS/TLS in transit) and access controls on systems storing account and verification records. No method of electronic transmission or storage is 100% secure, so we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "retention",
    title: "6. Data Retention",
    blocks: [
      {
        kind: "p",
        content:
          "We retain personal information only for as long as necessary to fulfill the purposes described in this Privacy Policy, including:",
      },
      {
        kind: "ul",
        items: [
          "Maintaining active accounts and providing Platform services.",
          "Keeping transaction, commission, refund, consent, identity, and verification logs for dispute resolution, fraud investigation/prevention, accounting, and legal or regulatory compliance.",
        ],
      },
      {
        kind: "p",
        content:
          "When data is no longer needed for these purposes, we delete it or anonymize/aggregate it so it no longer identifies you, subject to technical backup cycles and legal retention obligations.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "7. Your Rights & Account / Data Deletion",
    blocks: [
      {
        kind: "p",
        content:
          "Depending on applicable laws (including Uganda's Data Protection and Privacy Act where applicable), you may have rights to:",
      },
      {
        kind: "ul",
        items: [
          "Request access to or correction of inaccurate personal information in your profile.",
          "Withdraw optional permissions (such as location access or notifications) through your device settings or app controls (noting that disabling certain permissions may limit features like nearby search or on-ground verification).",
          "Request deletion of your account and associated personal data.",
        ],
      },
      { kind: "h3", content: "How to Request Account or Data Deletion" },
      { kind: "p", content: "You can request account or data deletion by:" },
      {
        kind: "ol",
        items: [
          <>
            Using the in-app account/privacy deletion option (if available in your
            app settings),
          </>,
          <>
            Using our{" "}
            <Link href="/account-deletion" className="underline underline-offset-2">
              account deletion page
            </Link>
            , <strong>or</strong>
          </>,
          <>
            Emailing{" "}
            <a href={`mailto:${SUPPORT}`} className="underline underline-offset-2">
              {SUPPORT}
            </a>{" "}
            from your registered contact details with the subject{" "}
            <strong>&ldquo;Data / Account Deletion Request&rdquo;</strong> and your
            registered phone number or email address.
          </>,
        ],
      },
      {
        kind: "p",
        content:
          "We will verify your request and process deletion within a reasonable timeframe, except where retaining specific records (such as payment/refund/commission logs, fraud-prevention or investigation records, or legal compliance records) is required or permitted by law.",
      },
    ],
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    blocks: [
      {
        kind: "p",
        content: (
          <>
            ZCanopy is not intended for individuals under <strong>18 years of age</strong>{" "}
            (or the age of legal majority to enter rental or financial commitments
            in your jurisdiction). We do not knowingly collect personal
            information from children. If you believe a minor has provided
            personal data to us, please contact{" "}
            <a href={`mailto:${SUPPORT}`} className="underline underline-offset-2">
              {SUPPORT}
            </a>{" "}
            so we can take appropriate action.
          </>
        ),
      },
    ],
  },
  {
    id: "changes",
    title: "9. Changes to This Privacy Policy",
    blocks: [
      {
        kind: "p",
        content: (
          <>
            We may update this Privacy Policy from time to time to reflect changes
            in our Platform, business operations, payment/verification workflows,
            or legal requirements. We will update the{" "}
            <strong>&ldquo;Last Updated&rdquo;</strong> date at the top of this
            page and provide notice in the app or on our website when material
            changes are made.
          </>
        ),
      },
    ],
  },
];

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "h3":
      return (
        <h3 className="mt-6 text-base font-semibold text-[var(--foreground)]">
          {block.content}
        </h3>
      );
    case "ul":
      return (
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    default:
      return <p>{block.content}</p>;
  }
}

export default function PrivacyContent() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
          Legal
        </p>
        <h1 className="mt-2 text-4xl">Privacy Policy — ZCanopy</h1>

        <div
          className="mt-6 rounded-2xl p-5 text-sm text-gray-700"
          style={{
            border: `1px solid ${COLORS.accentGold}`,
            backgroundColor: `${COLORS.accentGold}1A`,
          }}
        >
          <p>
            <strong>Effective Date:</strong> November 25, 2026
          </p>
          <p className="mt-1">
            <strong>Last Updated:</strong> November 25, 2026
          </p>
        </div>

        <nav aria-label="Contents" className="mt-8">
          <p className="text-sm font-semibold text-[var(--zcanopy-card-brown)]">Contents</p>
          <ol className="mt-2 grid gap-1 text-sm text-gray-600 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="transition-colors hover:text-[var(--foreground)]"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600">
                {section.blocks.map((block, i) => (
                  <BlockView key={i} block={block} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-12 rounded-2xl p-6"
          style={{
            border: `1px solid ${COLORS.accentGold}`,
            backgroundColor: `${COLORS.accentGold}1A`,
          }}
        >
          <p className="text-sm font-semibold text-[var(--zcanopy-card-brown)]">
            Need help with your data?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            For access, correction, or deletion requests, email{" "}
            <a href={`mailto:${SUPPORT}`} className="underline underline-offset-2">
              {SUPPORT}
            </a>{" "}
            or call{" "}
            <a href="tel:+256741882818" className="underline underline-offset-2">
              +256741882818
            </a>
            . See also our{" "}
            <Link href="/account-deletion" className="underline underline-offset-2">
              Account Deletion
            </Link>{" "}
            page, our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms of Agreement
            </Link>{" "}
            and{" "}
            <Link href="/refund-policy" className="underline underline-offset-2">
              Refund Policy
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
