"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import Roll from "@/components/ui/Roll";
import { initMotion } from "@/lib/motion";
import { sendNote } from "@/lib/web3forms";
import type { ContactSection } from "@/sanity/lib/types";
import styles from "./NoteForm.module.css";

type FieldName = "name" | "email" | "message";
type Errors = Partial<Record<FieldName, string>>;
type Status = "idle" | "sending" | "error";

type Props = {
  form: ContactSection["form"];
  /** Shown in the failure message so a visitor can still reach you. */
  email: string;
};

const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

export default function NoteForm({ form: t, email }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const checks: Record<FieldName, (v: string) => string | null> = {
    name: (v) => (v.trim().length > 1 ? null : t.nameError),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : t.emailError),
    message: (v) => (v.trim().length > 4 ? null : t.messageError),
  };

  function validate(field: FieldName, value: string) {
    const msg = checks[field](value);
    setErrors((e) => ({ ...e, [field]: msg ?? undefined }));
    return msg === null;
  }

  const fieldProps = (field: FieldName) => ({
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `note-${field}-err` : undefined,
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.currentTarget.value) validate(field, e.currentTarget.value);
    },
    onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (errors[field]) validate(field, e.currentTarget.value);
    },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const el = e.currentTarget;
    const data = new FormData(el);
    const v = (k: string) => String(data.get(k) ?? "");

    const failed = (["name", "email", "message"] as FieldName[]).filter((f) => !validate(f, v(f)));
    if (failed.length) {
      el.querySelector<HTMLElement>(`[name="${failed[0]}"]`)?.focus();
      return;
    }
    if (v("botcheck")) return; // honeypot: a person never fills this in, so say nothing

    setStatus("sending");
    try {
      await sendNote({ name: v("name").trim(), email: v("email").trim(), topic: v("topic"), message: v("message").trim() });
      setSentTo(v("name").trim().split(/\s+/)[0]);
      setStatus("idle");
      el.reset();
      requestAnimationFrame(() => {
        if (initMotion().G && doneRef.current) gsap.from(doneRef.current.children, { y: 20, opacity: 0, stagger: 0.06, duration: 0.6, ease: "expo.out" });
        againRef.current?.focus();
      });
    } catch (err) {
      console.warn("Note not sent:", err);
      setStatus("error");
    }
  }

  const sending = status === "sending";
  const sendLabel = sending ? t.sendingLabel : status === "error" ? t.retryLabel : t.sendLabel;
  const statusText = sending ? t.sendingStatus : status === "error" ? fill(t.errorText, { email }) : t.idleStatus;

  if (sentTo !== null) {
    return (
      <div className={styles.wrap}>
        <div ref={doneRef} className={styles.done}>
          <span className="mono">{t.successKicker}</span>
          <h3>{fill(t.successTitle, { name: sentTo })}</h3>
          <p className="mono">{t.successBody}</p>
          <button
            ref={againRef}
            type="button"
            className={styles.again}
            onClick={() => {
              setSentTo(null);
              setStatus("idle");
              requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[name="name"]')?.focus());
            }}
          >
            <Roll text={`(${t.writeAnotherLabel})`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate>
        <h3>
          {t.titleLead} <span className="it">{t.titleItalic}</span>
        </h3>
        <div className={styles.two}>
          <div className={`${styles.fld} ${errors.name ? styles.bad : ""}`}>
            <label htmlFor="note-name">{t.nameLabel}</label>
            <input id="note-name" autoComplete="name" required maxLength={80} {...fieldProps("name")} />
            <span id="note-name-err" className={styles.err}>{errors.name}</span>
          </div>
          <div className={`${styles.fld} ${errors.email ? styles.bad : ""}`}>
            <label htmlFor="note-email">{t.emailLabel}</label>
            <input id="note-email" type="email" autoComplete="email" inputMode="email" required maxLength={120} {...fieldProps("email")} />
            <span id="note-email-err" className={styles.err}>{errors.email}</span>
          </div>
        </div>
        <fieldset className={styles.chips}>
          <legend>{t.topicLegend}</legend>
          {t.topics.map((topic, i) => (
            <label key={topic.value}>
              <input type="radio" name="topic" value={topic.value} defaultChecked={i === 0} />
              <span>{topic.label}</span>
            </label>
          ))}
        </fieldset>
        <div className={`${styles.fld} ${errors.message ? styles.bad : ""}`}>
          <label htmlFor="note-message">{t.messageLabel}</label>
          <textarea id="note-message" required maxLength={2000} placeholder={t.messagePlaceholder} {...fieldProps("message")} />
          <span id="note-message-err" className={styles.err}>{errors.message}</span>
        </div>
        <div className={styles.hp} aria-hidden="true">
          <label htmlFor="note-hp">Leave this empty</label>
          <input id="note-hp" name="botcheck" tabIndex={-1} autoComplete="off" />
        </div>
        <div className={styles.foot}>
          <span className="mono" aria-live="polite">{statusText}</span>
          <button className={styles.send} type="submit" disabled={sending}>
            <Roll text={sendLabel} />
          </button>
        </div>
      </form>
    </div>
  );
}
