import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="23 November 2026">
      <section>
        <h2>The short version</h2>
        <ul>
          <li>On the <strong>Free</strong> plan, your meals, glucose readings, goals, routine and recipes stay <strong>on your own device</strong>. We do not receive them or keep a copy.</li>
          <li>On the <strong>trial or Pro</strong>, when cloud sync is switched on, we also keep a <strong>copy of that data in our database</strong> (hosted by Supabase) so your phones stay in step. You can delete it at any time.</li>
          <li>When you sign in with Google, we keep your name and profile picture only in a signed cookie in your browser. With cloud sync on, we also store your email and the date you first signed in, to run your trial.</li>
          <li>When you use an AI feature, the text or photo you send is passed on to get an answer, and we do not store it.</li>
          <li>We never sell your information.</li>
        </ul>
      </section>

      <section>
        <h2>What we handle</h2>
        <p><strong>Sign-in.</strong> Google tells us your Google account ID, name, email address and profile picture link. We put them in a signed cookie (up to 30 days) so you stay signed in. We do not keep them in a database.</p>
        <p><strong>Trial cookie.</strong> A second signed cookie records your Google account ID and the date you first signed in, so your 7-day Pro trial is not restarted each time you sign in. It lasts up to 400 days. Clearing your browser data removes it.</p>
        <p><strong>Health information you enter.</strong> Meals, glucose readings, goals, routines, walks, recipes and settings are saved in your browser&apos;s local storage. On the Free plan they never leave your device unless you use the features below or export a backup yourself. On the trial or Pro, with cloud sync on, one copy of this data is also stored in a database hosted by Supabase, linked to your Google account ID. Only our server can read that database; it is not open to the public. The database servers may be outside India. If the trial ends and you move to Free, syncing stops and the copy already in the cloud is kept until you delete it.</p>
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
          <li><strong>Delete your data:</strong> &quot;Delete all my data&quot; in Me removes it from this device <strong>and</strong> from our database. &quot;Sign out and clear this device&quot; removes only the copy on this device, so a cloud copy, if you have one, stays until you delete it. Deleting your cloud copy works on any plan.</li>
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
