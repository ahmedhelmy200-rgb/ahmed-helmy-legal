import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

const PORTAL_URL = "https://helm-protal.vercel.app/";

const isElectron = /electron/i.test(navigator.userAgent);
if ("serviceWorker" in navigator && window.location.protocol !== "file:" && !isElectron) {
  registerSW({ immediate: true });
}

const PortalRedirectLanding: React.FC = () => {
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    const redirect = window.setTimeout(() => {
      window.location.replace(PORTAL_URL);
    }, 4000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(redirect);
    };
  }, []);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white" dir="rtl">
      <section className="relative flex min-h-screen items-center justify-center px-5 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.25),transparent_28%),radial-gradient(circle_at_80%_35%,rgba(59,130,246,0.20),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -left-24 bottom-12 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative w-full max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur md:p-10">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_0.95fr]">
            <div className="space-y-7 text-right">
              <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.9)]" />
                بوابة التوجيه الرسمية
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  حلم بروتال
                  <span className="mt-2 block bg-gradient-to-l from-amber-200 via-yellow-500 to-amber-100 bg-clip-text text-transparent">
                    HELM Portal
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-9 text-slate-200 md:text-xl">
                  يتم الآن توجيهك إلى المنصة الإلكترونية لمتابعة الطلبات، الملفات، الخدمات، والمستندات القانونية عبر بوابة حلم بروتال.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-2xl font-black text-amber-200">01</div>
                  <div className="mt-1 text-sm text-slate-200">متابعة الملفات</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-2xl font-black text-amber-200">02</div>
                  <div className="mt-1 text-sm text-slate-200">رفع المستندات</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-2xl font-black text-amber-200">03</div>
                  <div className="mt-1 text-sm text-slate-200">طلبات إلكترونية</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={PORTAL_URL}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-600 px-6 py-4 text-base font-black text-slate-950 shadow-xl shadow-amber-500/20 transition hover:scale-[1.02]"
                >
                  دخول المنصة الآن
                </a>
                <div className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300">
                  تحويل تلقائي خلال <strong className="text-amber-200">{seconds}</strong> ثوانٍ
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rotate-6 rounded-[2.25rem] bg-amber-400/20 blur-xl" />
                <div className="relative w-72 rounded-[2.25rem] border border-white/15 bg-slate-900/90 p-5 shadow-2xl md:w-80">
                  <div className="mx-auto mb-6 h-2 w-24 rounded-full bg-white/20" />
                  <div className="rounded-[1.75rem] border border-amber-200/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 text-5xl font-black text-slate-950 shadow-2xl shadow-amber-500/30">
                      H
                    </div>
                    <h2 className="mt-5 text-2xl font-black">HELM Portal</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-300">منصة إلكترونية قانونية موحدة</p>

                    <div className="mt-6 space-y-3 text-right">
                      <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ دخول سريع وآمن</div>
                      <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ واجهة عربية واضحة</div>
                      <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ متوافق مع الجوال</div>
                    </div>
                  </div>
                  <div className="mt-5 text-center text-xs text-slate-500">© {currentYear} Ahmed Helmy Legal</div>
                </div>
              </div>
            </div>
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
    <PortalRedirectLanding />
  </React.StrictMode>
);
