'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { BookOpen, ChevronDown, Send } from 'lucide-react';
import { webApi } from '@/lib/api';

/**
 * Short answers to the questions customers ask most often. They explain how
 * the escrow countdown, bookings and payments work so a customer can resolve
 * most questions without waiting for a reply.
 */
export const HELP_ARTICLES: { id: string; title: string; body: string }[] = [
  {
    id: 'countdown',
    title: 'What the countdown on a booking is',
    body: 'When you pay for a booking, your money is held by ZCanopy in escrow instead of going straight to the broker. The countdown shows how long that hold lasts — one day by default, and you can change it under My Bookings. If the countdown runs out before you approve the broker, the held money is returned to you automatically.',
  },
  {
    id: 'release',
    title: 'Releasing the money to the broker',
    body: 'Open My Bookings, find the booking and press "Approve & release funds". Only do that once you have visited the property and are happy with it. If you are not going to the property, leave the countdown running so the money comes back to you instead.',
  },
  {
    id: 'booking',
    title: 'How booking a property works',
    body: 'Find a property, send a booking request with your phone number and pay the booking charge. The booking then appears under My Bookings with its status, the amount held and the countdown. You can also look up a booking you made elsewhere using its booking code.',
  },
  {
    id: 'payment',
    title: 'Payments and refunds',
    body: 'The booking charge is taken from your mobile money account or card. A refund goes back to the number you paid from. If a booking expires without being approved, the held funds are reversed to you automatically and the booking is marked as returned.',
  },
  {
    id: 'account',
    title: 'Updating my details and notifications',
    body: 'Your phone number is what we use for booking confirmations and one-time codes, so keep it up to date under My Profile. You get a notification for every booking, payment and message the team sends you.',
  },
  {
    id: 'support',
    title: 'Getting help from the team',
    body: 'Use the form on this page to reach the ZCanopy team and we will reply to the email address on your account. You can also read your message thread under My Messages.',
  },
];

const inputClass =
  'w-full rounded-xl border border-[var(--zcanopy-border)] bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[var(--zcanopy-primary)] focus:ring-2 focus:ring-[var(--zcanopy-primary)]/30 dark:bg-[var(--zcanopy-surface)]';

export default function CustomerHelpSupport({
  token,
  onMessageSent,
}: {
  token: string | null;
  onMessageSent?: () => void;
}) {
  const [openArticle, setOpenArticle] = useState<string | null>('countdown');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [unsubscribeBusy, setUnsubscribeBusy] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!subject.trim() || !body.trim()) {
      setFeedback({ ok: false, text: 'Please add a subject and a message before sending.' });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      const res = await webApi.customer.sendMessage(token, {
        subject: subject.trim(),
        body: body.trim(),
      });
      if (res?.success) {
        trackEvent(AnalyticsEvents.ContactAdminSent, { source: 'help_section' });
        setFeedback({ ok: true, text: res.message || 'Your message has been sent to the ZCanopy team.' });
        setSubject('');
        setBody('');
        onMessageSent?.();
      } else {
        setFeedback({ ok: false, text: res?.message || 'We could not send your message. Please try again.' });
      }
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'We could not send your message. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) return;
    setUnsubscribeBusy(true);
    try {
      const res = await webApi.customer.unsubscribe(token);
      if (res?.success) {
        setUnsubscribed(true);
      } else {
        setFeedback({ ok: false, text: res?.message || 'We could not unsubscribe you just now.' });
      }
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'We could not unsubscribe you just now.',
      });
    } finally {
      setUnsubscribeBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--zcanopy-border)] bg-[var(--zcanopy-surface)] p-6 shadow-[var(--zcanopy-shadow)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--zcanopy-primary)' }}>Help &amp; support</p>
          <h2 className="mt-1 font-display text-2xl" style={{ color: 'var(--zcanopy-card-brown)' }}>Guides, answers and a direct line to us.</h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: 'var(--zcanopy-muted)' }}>Read the short guides below, or send the team a message and we will reply to the email on your account.</p>
        </div>
        <BookOpen className="h-6 w-6 shrink-0" style={{ color: 'var(--zcanopy-accent-gold)' }} />
      </div>

      {/* Help guides */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {HELP_ARTICLES.map((article) => {
          const expanded = openArticle === article.id;
          return (
            <div key={article.id} className="rounded-xl border border-[var(--zcanopy-border)]">
              <button
                type="button"
                onClick={() => {
                  trackEvent(AnalyticsEvents.HelpGuideOpened, { article: article.id });
                  setOpenArticle(expanded ? null : article.id);
                }}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>{article.title}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--zcanopy-muted)' }}
                />
              </button>
              {expanded ? (
                <p className="border-t border-[var(--zcanopy-border)] px-4 py-3 text-sm leading-relaxed" style={{ color: 'var(--zcanopy-muted)' }}>
                  {article.body}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Message the admin */}
        <form onSubmit={handleSend} className="rounded-xl border border-[var(--zcanopy-border)] p-4 lg:col-span-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Send a message to the ZCanopy team</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--zcanopy-muted)' }}>
            Tell us what you need and we will reply to the email address on your account. Your message is also kept under My Messages.
          </p>

          <label htmlFor="help-message-subject" className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--zcanopy-muted)' }}>
            Subject
          </label>
          <input
            id="help-message-subject"
            type="text"
            maxLength={120}
            placeholder="e.g. Question about my booking countdown"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />

          <label htmlFor="help-message-body" className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--zcanopy-muted)' }}>
            Message
          </label>
          <textarea
            id="help-message-body"
            rows={5}
            maxLength={2000}
            placeholder="Tell us what happened and what you would like us to do."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" />
              {busy ? 'Sending…' : 'Send message'}
            </button>
            <Link href="/customer?view=messages" className="text-xs font-semibold hover:underline" style={{ color: 'var(--zcanopy-primary)' }}>
              Read my messages
            </Link>
          </div>

          {feedback ? (
            <p className="mt-3 text-xs font-medium" style={{ color: feedback.ok ? 'var(--zcanopy-primary)' : '#dc2626' }}>
              {feedback.text}
            </p>
          ) : null}
        </form>

        {/* Unsubscribe */}
        <div className="rounded-xl border border-[var(--zcanopy-border)] p-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--zcanopy-card-brown)' }}>Email updates</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--zcanopy-muted)' }}>
            Unsubscribe from ZCanopy emails and notifications. Your bookings, payments and messages stay on your
            account, but you will stop receiving updates and will no longer be able to sign in.
          </p>
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={unsubscribeBusy || unsubscribed}
            className="mt-4 w-full rounded-xl border border-[var(--zcanopy-border)] px-4 py-2.5 text-xs font-semibold transition hover:border-[var(--zcanopy-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: 'var(--zcanopy-card-brown)' }}
          >
            {unsubscribed ? 'You have unsubscribed' : unsubscribeBusy ? 'Unsubscribing…' : 'Unsubscribe from emails'}
          </button>
          {unsubscribed ? (
            <p className="mt-2 text-xs font-medium" style={{ color: 'var(--zcanopy-primary)' }}>
              You have been unsubscribed. Sign in again any time to keep your account active.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
