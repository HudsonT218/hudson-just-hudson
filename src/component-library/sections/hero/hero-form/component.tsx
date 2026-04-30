import { useState, useId, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface HeroFormProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  benefits?: string[];
  formTitle?: string;
  formSubtitle?: string;
  submitLabel?: string;
  privacyText?: string;
}

const DEFAULT_BENEFITS = [
  'No credit card required',
  'Cancel anytime',
  'Free for 14 days',
];

export function HeroForm({
  eyebrow = 'Start free',
  headline = 'Get started in under two minutes',
  subheadline = 'Create an account, pick a template, and watch your site come together. No setup fees, no surprises.',
  benefits = DEFAULT_BENEFITS,
  formTitle = 'Create your free account',
  formSubtitle = 'We will email you a magic link to get started.',
  submitLabel = 'Get started',
  privacyText = 'By signing up you agree to our Terms and Privacy Policy.',
}: HeroFormProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {eyebrow && (
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-6">
                {eyebrow}
              </span>
            )}
            <h1 className="font-heading font-bold text-text-primary text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight">
              {headline}
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              {subheadline}
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="inline-flex w-6 h-6 rounded-full bg-primary/10 text-primary items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="text-text-primary">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-surface rounded-xl shadow-lg border border-border p-8"
          >
            <h2 className="font-heading text-xl font-semibold text-text-primary">
              {formTitle}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">{formSubtitle}</p>

            {submitted ? (
              <div className="mt-6 rounded-md bg-success/10 border border-success/30 p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-success" />
                <p className="text-sm text-text-primary">Thanks — check your inbox for the magic link.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label
                    htmlFor={`${id}-email`}
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Work email
                  </label>
                  <input
                    id={`${id}-email`}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors"
                >
                  {submitLabel}
                </button>
                <p className="text-xs text-text-muted text-center">{privacyText}</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroForm;
