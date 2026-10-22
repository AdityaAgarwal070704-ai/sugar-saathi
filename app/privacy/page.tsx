import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="22 October 2026">
      <section>
        <h2>The short version</h2>
        <ul>
          <li>Your meals, glucose readings, goals, routine and recipes stay <strong>on your own device</strong>. We do not receive them or keep a copy.</li>
          <li>When you sign in with Google, we keep your name, email and profile picture only in a signed cookie in your browser.</li>
          <li>When you use an AI feature, the text or photo you send is passed on to get an answer, and we do not store it.</li>
          <li>We never sell your information.</li>
        </ul>
      </section>

      <section>
        <h2>What we handle</h2>
        <p><strong>Sign-in.</strong> Google tells us your Google account ID, name, email address and profile picture link. We put them in a signed cookie (up to 30 days) so you stay signed in. We do not keep them in a database.</p>
        <p><strong>Trial cookie.</strong> A second signed cookie records your Google account ID and the date you first signed in, so your 7-day Pro trial is not restarted each time you sign in. It lasts up to 400 days. Clearing your browser data removes it.</p>
        <p><strong>Health information you enter.</strong> Meals, glucose readings, goals, routines, walks, recipes and settings are saved in your browser&apos;s local storage. They never leave your device unless you use the features below or export a backup yourself.</p>
        <p><strong>AI features.</strong> When you ask the app to read a meal, a photo of a meal, a recipe description, a weekly summary or a day plan, the text, photo or calculated statistics you send go to our server and are passed to an AI service (Google Gemini, reached through OpenRouter) to produce the answer. We do not store them. The AI services have their own terms for how they handle requests. Photos are shrunk on your device first and are never saved by us.</p>
        <p><strong>Hosting records.</strong> Our hosting provider (Vercel) keeps ordinary technical logs such as IP address, time and page requested, under its own policy.</p>
      </section>

      <section>
        <h2>Who we share with</h2>
        <p>Google (sign-in), OpenRouter and Google (AI answers), and Vercel (hosting). We do not sell or rent personal information, and we do not use your health entries for advertising.</p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li><strong>See or keep your data:</strong> use Export backup in the Me screen.</li>
          <li><strong>Delete your data:</strong> use &quot;Delete all my data&quot; in Me, or &quot;Sign out and clear this device&quot;. Because we hold no copy, this removes it completely.</li>
          <li><strong>Sign out:</strong> removes the sign-in cookie. Your Google account is not affected.</li>
          <li><strong>Stop Google sharing:</strong> remove Sugar Saathi from your Google account&apos;s &quot;Sign in with Google&quot; connections.</li>
        </ul>
      </section>

      <section>
        <h2>Who can use Sugar Saathi</h2>
        <p>Sugar Saathi is for adults (18 and over). Please do not use it for a child&apos;s health records without a parent or doctor involved.</p>
      </section>

      <section>
        <h2>Consent and changes</h2>
        <p>By choosing &quot;Continue with Google&quot; you agree to this policy and consent to the handling described above. You can withdraw consent at any time by signing out and clearing your device. If we change this policy in a way that matters, we will say so in the app.</p>
        <p>{CONTACT ? <>Questions? Write to <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.</> : "A contact email will be added here before launch."}</p>
      </section>
    </LegalPage>
  );
}
