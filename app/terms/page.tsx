import type { Metadata } from "next";
import { LegalLayout } from "../legal-layout";

export const metadata: Metadata = { title: "Terms of Service · Minimal Forms" };

const LAST_UPDATED = "September 2, 2026";
const CONTACT_EMAIL = "hello@ivaan.cc";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p className="rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink/60">
        This is a general-purpose template, not legal advice. Review it
        (ideally with a lawyer) and update the placeholders — especially the
        contact email and governing-law section — before relying on it for a
        live product.
      </p>

      <section>
        <h2>1. Acceptance of these terms</h2>
        <p>
          By creating an account or using Minimal Forms (&quot;the
          Service&quot;), you agree to these Terms of Service. If you don&apos;t
          agree, please don&apos;t use the Service.
        </p>
      </section>

      <section>
        <h2>2. What Minimal Forms is</h2>
        <p>
          Minimal Forms lets you build forms and surveys, publish them, and
          collect responses. You&apos;re responsible for the forms you
          create and how you use the responses you receive.
        </p>
      </section>

      <section>
        <h2>3. Your account</h2>
        <ul>
          <li>You must provide accurate information when signing up.</li>
          <li>You&apos;re responsible for keeping your account credentials secure and for all activity under your account.</li>
          <li>You must be legally able to enter into these terms in your jurisdiction to use the Service.</li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>You agree not to use Minimal Forms to:</p>
        <ul>
          <li>Collect data unlawfully, or without a proper legal basis or disclosure to respondents.</li>
          <li>Build forms for phishing, scams, malware distribution, or spam.</li>
          <li>Upload content that is illegal, infringes someone else&apos;s rights, or is hateful, harassing, or sexually exploitative.</li>
          <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service or other users&apos; data.</li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate this policy.
        </p>
      </section>

      <section>
        <h2>5. Your content</h2>
        <p>
          You retain ownership of the forms, questions, images, and
          responses you create or collect (&quot;Your Content&quot;). By
          uploading or submitting it, you grant us a limited license to
          store, process, and display Your Content solely to operate the
          Service for you. You&apos;re responsible for having the rights to
          any images or content you upload.
        </p>
      </section>

      <section>
        <h2>6. Respondent data</h2>
        <p>
          If your forms collect personal data from respondents, you act as
          the data controller for that data, and we act only as a processor
          on your behalf. You&apos;re responsible for complying with
          applicable privacy laws (e.g. providing notice, obtaining
          consent, and honoring deletion requests) for the data you
          collect.
        </p>
      </section>

      <section>
        <h2>7. Service availability</h2>
        <p>
          We aim to keep Minimal Forms available and reliable, but we don&apos;t
          guarantee uninterrupted or error-free operation. We may modify,
          suspend, or discontinue parts of the Service at any time.
        </p>
      </section>

      <section>
        <h2>8. Termination</h2>
        <p>
          You may stop using the Service and delete your account at any
          time. We may suspend or terminate your access if you violate
          these terms. Sections that by their nature should survive
          termination (e.g. ownership, disclaimers, liability) will
          continue to apply.
        </p>
      </section>

      <section>
        <h2>9. Disclaimer</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as
          available&quot;, without warranties of any kind, express or
          implied, including merchantability, fitness for a particular
          purpose, and non-infringement.
        </p>
      </section>

      <section>
        <h2>10. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Minimal Forms and its
          operators won&apos;t be liable for any indirect, incidental,
          special, or consequential damages, or any loss of data, profits,
          or revenue, arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2>11. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. We&apos;ll update the
          &quot;Last updated&quot; date above when we do; continued use of
          the Service after changes means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2>12. Governing law</h2>
        <p>
          [Add your governing law / jurisdiction here — this depends on
          where you or your business are based.]
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
