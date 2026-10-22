import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Use" };

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Terms() {
  return (
    <LegalPage title="Terms of Use" updated="22 October 2026">
      <section>
        <h2>Food guidance, not medical advice</h2>
        <p>Sugar Saathi helps you log food and see patterns next to your glucose readings. It is <strong>not</strong> a medical device and does not give medical advice, diagnosis or treatment. It never tells you what medicine or insulin to take. Always talk to your doctor or diabetes educator about your treatment, targets and any change to your diet.</p>
        <p>If a reading worries you or you feel unwell, follow the plan your doctor gave you or contact your doctor or emergency services. Do not wait for this app.</p>
      </section>

      <section>
        <h2>Estimates, not exact numbers</h2>
        <p>Nutrition values come from a starter food table that has not been clinically verified. Portions are your own judgement, and photos and voice are read by AI, so mistakes are possible. Treat every number as an estimate. Patterns are possible links to discuss with your educator, not conclusions.</p>
      </section>

      <section>
        <h2>Free, trial and Pro</h2>
        <ul>
          <li>Every new account gets a <strong>7-day Pro trial</strong> with no card. After it, you keep a free plan with the essentials. Your data is never taken away when a trial ends.</li>
          <li>The trial is remembered in your browser. Using it again after clearing your browser data may not be possible, or may not be offered.</li>
          <li><strong>Pro is not on sale yet.</strong> What it will include, and its price, may change. Nothing is charged today.</li>
          <li>Daily limits apply to AI-read meals to keep the service fair and affordable.</li>
        </ul>
      </section>

      <section>
        <h2>Using the service</h2>
        <ul>
          <li>You are 18 or over, and you are responsible for the information you enter and for keeping your device secure.</li>
          <li>Your data lives on your device. If you clear your browser data or lose the device, it is gone unless you exported a backup.</li>
          <li>Please do not misuse the service, try to break it, overload it or use it to harm others.</li>
        </ul>
      </section>

      <section>
        <h2>Availability and liability</h2>
        <p>The service is provided &quot;as is&quot;. It may change, pause or have errors. To the extent the law allows, we are not responsible for decisions made using the app or for losses from its use or unavailability.</p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>We may update these terms. Continuing to use the app after a change means you accept it. Indian law applies. {CONTACT ? <>Questions? Write to <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</> : "A contact email will be added here before launch."}</p>
      </section>
    </LegalPage>
  );
}
