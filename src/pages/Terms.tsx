export default function Terms() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-4xl font-bold">
          Terms & Conditions
        </h1>

        <p className="mb-6 text-muted-foreground">
          Last Updated: May 2026
        </p>

        <div className="space-y-6 text-sm leading-7 text-foreground/80">
          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Acceptance of Terms
            </h2>

            <p>
              By using this platform, you
              agree to comply with these
              Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Use of Services
            </h2>

            <p>
              This platform is intended for
              authorized employees and
              company-related business
              activities only.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              User Responsibilities
            </h2>

            <p>
              Users are responsible for
              maintaining the confidentiality
              of their accounts and using the
              platform responsibly.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Service Availability
            </h2>

            <p>
              We may update, modify or
              temporarily suspend the service
              without prior notice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              Contact Information
            </h2>

            <p>
              For any questions regarding
              these Terms, please contact
              your official company email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}