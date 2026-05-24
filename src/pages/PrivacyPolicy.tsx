export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-4xl font-bold">
          Privacy Policy
        </h1>

        <p className="mb-6 text-muted-foreground">
          Last Updated: May 2026
        </p>

        <div className="space-y-6 text-sm leading-7 text-foreground/80">
          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Information We Collect
            </h2>

            <p>
              We may collect your Google
              account information such as
              your name, email address,
              contacts and calendar access
              when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Why We Use This Data
            </h2>

            <p>
              Contact access is used to
              quickly select doctor details.
              Calendar access is used to
              create follow-up reminders for
              employees.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Data Protection
            </h2>

            <p>
              We do not sell, rent or share
              your personal information with
              third parties. Your data is
              securely handled using trusted
              cloud services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Google API Services
            </h2>

            <p>
              Our application uses Google API
              Services. By using this
              application, you also agree to
              Google’s Privacy Policy and API
              Services User Data Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Contact Us
            </h2>

            <p>
              If you have any questions
              regarding this Privacy Policy,
              please contact us at your
              official company email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}