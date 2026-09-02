import type { Metadata } from "next";
import { LegalLayout } from "../legal-layout";

export const metadata: Metadata = { title: "Privacy Policy · Minimal Forms" };

const LAST_UPDATED = "September 2, 2026";
const CONTACT_EMAIL = "hello@ivaan.cc";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p className="rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink/60">
        This is a general-purpose template, not legal advice. Review it (ideally
        with a lawyer) and update the placeholders — especially the contact
        email and anything about your specific region&apos;s privacy law — before
        relying on it for a live product.
      </p>

      <section>
        <h2>1. Who we are</h2>
        <p>
          Minimal Forms (&quot;we&quot;, &quot;us&quot;) is a form-building
          service that lets people create forms and surveys and collect
          responses. This policy explains what data we collect, why, and how
          you can control it.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <ul>
          <li>
            <strong>Account data.</strong> When you sign up, our authentication
            provider (Clerk) collects your email address, name, and
            authentication details (e.g. password hash or social login
            identifiers). We never see or store your password ourselves.
          </li>
          <li>
            <strong>Content you create.</strong> Form titles, descriptions,
            questions, answer options, and any background or question images
            you upload.
          </li>
          <li>
            <strong>Responses.</strong> When someone fills out one of your
            published forms, their answers (and, for image-backed questions,
            no personal data beyond what they type) are stored and shown to
            you as the form owner. We do not require respondents to have an
            account.
          </li>
          <li>
            <strong>Usage and log data.</strong> Standard technical data
            (IP address, browser type, timestamps) collected by our hosting
            provider for security and reliability.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How we use it</h2>
        <ul>
          <li>To operate the service: create your account, save your forms, and deliver responses to you.</li>
          <li>To secure the service: detect abuse, spam, and unauthorized access.</li>
          <li>To communicate with you about your account (e.g. sign-in codes, important service notices).</li>
        </ul>
        <p>
          We do not sell your data or use it for third-party advertising.
        </p>
      </section>

      <section>
        <h2>4. Who we share it with</h2>
        <p>We use a small number of service providers (subprocessors) to run Minimal Forms:</p>
        <ul>
          <li><strong>Clerk</strong> — authentication and account management.</li>
          <li><strong>Supabase</strong> — database and file storage for your forms, responses, and uploaded images.</li>
          <li>Our hosting provider — runs the application itself.</li>
        </ul>
        <p>
          These providers process data only as needed to provide their part
          of the service, under their own privacy and security terms.
        </p>
      </section>

      <section>
        <h2>5. Your responsibilities as a form owner</h2>
        <p>
          If you use Minimal Forms to collect personal data from
          respondents (names, emails, health or financial information,
          etc.), you are the controller of that data. You&apos;re
          responsible for having a lawful basis to collect it, telling
          respondents what you&apos;ll do with it, and honoring any
          deletion or access requests they make to you directly.
        </p>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>
          We use the minimum cookies needed to keep you signed in, set by
          our authentication provider (Clerk). We do not use advertising or
          cross-site tracking cookies.
        </p>
      </section>

      <section>
        <h2>7. Data retention</h2>
        <p>
          We keep your forms and responses for as long as your account is
          active. If you delete a form, its questions, responses, and
          uploaded images are permanently removed from our database and
          storage. If you delete your account, we delete your data within a
          reasonable period, except where we&apos;re required to keep
          records for legal reasons.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use industry-standard measures (encrypted connections,
          access-controlled databases) to protect your data. No method of
          storage or transmission is 100% secure, and we can&apos;t
          guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>9. Your rights</h2>
        <p>
          You can access, edit, or delete your forms and account data at any
          time from your dashboard. To request a full export or deletion of
          your account data, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Depending
          on where you live, you may have additional rights under laws like
          the GDPR or CCPA.
        </p>
      </section>

      <section>
        <h2>10. Children&apos;s privacy</h2>
        <p>
          Minimal Forms is not directed at children under 13, and we do not
          knowingly collect personal data from them.
        </p>
      </section>

      <section>
        <h2>11. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. We&apos;ll update the
          &quot;Last updated&quot; date above when we do.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
