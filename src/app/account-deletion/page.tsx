import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { COLORS } from "@/lib/theme";
import { buildMetadata } from "@/lib/seo";

const SUPPORT = "support@support.zcanopy.com";
const PHONE = "+256741882818";

export const metadata: Metadata = buildMetadata({
  title: "Delete Your Account & Data",
  description:
    "How to delete your ZCanopy account and the personal data attached to it, in the app or by email, including what is deleted and what we must keep.",
  path: "/account-deletion",
});

export default function Page() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
          Privacy
        </p>
        <h1 className="mt-2 text-4xl">Delete your ZCanopy account &amp; data</h1>

        <div
          className="mt-6 rounded-2xl p-5 text-sm text-gray-700"
          style={{
            border: `1px solid ${COLORS.accentGold}`,
            backgroundColor: `${COLORS.accentGold}1A`,
          }}
        >
          <p>
            This page applies to the <strong>ZCanopy mobile app</strong> and{" "}
            <strong>www.zcanopy.com</strong>, for customers, brokers/agents and
            landlords. You do not need to install anything or sign in here to
            start a request.
          </p>
        </div>

        <h2 className="mt-10 text-xl">Option 1 — Delete in the app (fastest)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
          <li>Open the ZCanopy app and sign in to the account you want removed.</li>
          <li>
            Go to <strong>Profile → Edit profile</strong>.
          </li>
          <li>
            Tap <strong>Delete Account</strong> and confirm. You will be asked to
            verify a one-time code sent to the email address on the account.
          </li>
        </ol>

        <h2 className="mt-10 text-xl">Option 2 — Request deletion by email</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Email{" "}
          <a href={`mailto:${SUPPORT}`} className="underline underline-offset-2">
            {SUPPORT}
          </a>{" "}
          from the email address registered on the account, with the subject{" "}
          <strong>&ldquo;Data / Account Deletion Request&rdquo;</strong>, and
          include your registered phone number so we can match the request to the
          right account.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          If you no longer have access to the registered email address, call{" "}
          <a href="tel:+256741882818" className="underline underline-offset-2">
            {PHONE}
          </a>{" "}
          and we will tell you what we need to verify the account before deleting
          it.
        </p>

        <h2 className="mt-10 text-xl">What is deleted</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
          <li>Your profile: name, email address, phone number and account credentials.</li>
          <li>
            Account content: saved properties/favourites, in-app messages and
            support conversations attached to the account.
          </li>
          <li>
            Push-notification tokens and session records, so the account can no
            longer receive or make requests.
          </li>
          <li>
            For brokers/agents: the account is closed and your listings are removed
            from public view. Identity-verification documents are deleted once they
            are no longer needed for an open dispute or investigation.
          </li>
        </ul>

        <h2 className="mt-10 text-xl">What we may keep</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          We keep a limited set of records where the law requires it or where they
          are needed to resolve an open case: payment, commission, refund and
          escrow records, and records relating to fraud prevention or an active
          investigation. These records are kept only for as long as the applicable
          accounting, tax, anti-fraud or legal obligation requires, and they are not
          used for marketing.
        </p>

        <h2 className="mt-10 text-xl">Timing</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          We acknowledge requests within a few business days and aim to complete
          verified deletions within <strong>30 days</strong>. Where a request
          cannot be completed immediately (for example, an open refund or fraud
          review), we will tell you what is outstanding and when it is expected to
          be cleared. Data held in backups is removed as the backup cycle rolls
          over.
        </p>

        <h2 className="mt-10 text-xl">Delete only some data</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          You do not have to delete the whole account. You can edit your profile
          details in the app, ask us to correct inaccurate information, or turn off
          optional permissions (such as location or notifications) in your device
          settings. Location permission is only requested when a feature needs it,
          and denying it does not block browsing.
        </p>

        <div
          className="mt-10 rounded-2xl p-6 text-sm leading-relaxed text-gray-700"
          style={{
            border: `1px solid ${COLORS.accentGold}`,
            backgroundColor: `${COLORS.accentGold}1A`,
          }}
        >
          <p className="font-semibold text-[var(--zcanopy-card-brown)]">
            Need help with a request?
          </p>
          <p className="mt-2">
            Email{" "}
            <a href={`mailto:${SUPPORT}`} className="underline underline-offset-2">
              {SUPPORT}
            </a>{" "}
            or call{" "}
            <a href="tel:+256741882818" className="underline underline-offset-2">
              {PHONE}
            </a>
            , Kampala, Uganda. See also our{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
