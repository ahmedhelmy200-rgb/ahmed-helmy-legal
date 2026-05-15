import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

const PORTAL_URL = "https://helm-protal.vercel.app/";
const WHATSAPP_URL = "https://wa.me/971544144149";
const EMAIL_URL = "mailto:ahmedhelmy200@gmail.com";

const isElectron = /electron/i.test(navigator.userAgent);
if ("serviceWorker" in navigator && window.location.protocol !== "file:" && !isElectron) {
  registerSW({ immediate: true });
}

const LegalWebsiteLanding: React.FC = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white" dir="rtl">
      <section className="relative min-h-screen px-5 py-8 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(212,175,55,0.22),transparent_27%),radial-gradient(circle_at_82%_38%,rgba(14,165,233,0.18),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_46%,#111827_100%)]" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -left-24 bottom-12 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
          <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.06] px-5 py-4 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 text-2xl font-black text-slate-950 shadow-lg shadow-amber-500/20">
                H
              </div>
              <div>
                <div className="text-base font-black md:text-lg">المستشار أحمد حلمي</div>
                <div className="text-xs font-semibold text-slate-300">Ahmed Helmy Legal</div>
              </div>
            </div>

            <a
              href={PORTAL_URL}
              className="hidden rounded-2xl border border-amber-300/25 bg-amber-300/10 px-5 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-300/20 md:inline-flex"
            >
              حلم بروتال
            </a>
          </header>

          <div className="grid flex-1 items-center gap-10 py-10 md:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-7 text-right">
              <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.9)]" />
                موقع قانوني مستقل
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  خدمات واستشارات قانونية
                  <span className="mt-2 block bg-gradient-to-l from-amber-200 via-yellow-500 to-amber-100 bg-clip-text text-transparent">
                    بمنهج منظم وواضح
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-9 text-slate-200 md:text-xl">
                  هذا الموقع مستقل للتعريف بالخدمات القانونية والتواصل، مع توفير مدخل مباشر إلى المنصة الإلكترونية حلم بروتال لمتابعة الطلبات والملفات والمستندات.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-2xl font-black text-amber-200">01</div>
                  <div className="mt-1 text-sm text-slate-200">استشارات قانونية</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-2xl font-black text-amber-200">02</div>
                  <div className="mt-1 text-sm text-slate-200">صياغة مذكرات وعقود</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-2xl font-black text-amber-200">03</div>
                  <div className="mt-1 text-sm text-slate-200">متابعة ملفات إلكترونية</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={PORTAL_URL}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-600 px-6 py-4 text-base font-black text-slate-950 shadow-xl shadow-amber-500/20 transition hover:scale-[1.02]"
                >
                  دخول منصة حلم بروتال
                </a>
                <a
                  href={WHATSAPP_URL}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-4 text-base font-bold text-white transition hover:bg-white/[0.12]"
                >
                  تواصل واتساب
                </a>
                <a
                  href={EMAIL_URL}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-4 text-base font-bold text-white transition hover:bg-white/[0.12]"
                >
                  إرسال بريد
                </a>
              </div>
            </section>

            <aside className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 rotate-6 rounded-[2.25rem] bg-amber-400/20 blur-xl" />
                <div className="relative rounded-[2.25rem] border border-white/15 bg-slate-900/90 p-5 shadow-2xl">
                  <div className="rounded-[1.75rem] border border-amber-200/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 text-5xl font-black text-slate-950 shadow-2xl shadow-amber-500/30">
                      H
                    </div>
                    <h2 className="mt-5 text-2xl font-black">HELM Portal</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-300">أيقونة ومدخل المنصة الإلكترونية</p>

                    <div className="mt-6 space-y-3 text-right">
                      <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ متابعة الطلبات والملفات</div>
                      <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ رفع ومراجعة المستندات</div>
                      <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ دخول واضح من الموقع المستقل</div>
                    </div>

                    <a
                      href={PORTAL_URL}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-amber-100"
                    >
                      فتح المنصة الإلكترونية
                    </a>
                  </div>
                  <div className="mt-5 text-center text-xs text-slate-500">© {currentYear} Ahmed Helmy Legal</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

const el = document.getElementById("root");
if (!el) throw new Error("Root element #root not found");

ReactDOM.createRoot(el).render(
  <React.StrictMode>
    <LegalWebsiteLanding />
  </React.StrictMode>
);
