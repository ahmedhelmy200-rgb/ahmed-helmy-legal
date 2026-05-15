import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

const PORTAL_URL = "https://helm-protal.vercel.app/";
const WHATSAPP_URL = "https://wa.me/971544144149?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D8%B3%D8%AA%D8%B4%D8%A7%D8%B1%D8%A9%20%D9%82%D8%A7%D9%86%D9%88%D9%86%D9%8A%D8%A9%20%D8%B9%D8%A7%D8%AC%D9%84%D8%A9";
const EMAIL_URL = "mailto:ahmedhelmy200@gmail.com?subject=طلب%20استشارة%20قانونية";

type CommentItem = {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
};

const serviceCards = [
  {
    title: "الاستشارات القانونية",
    text: "استقبال الاستفسار، فرز المستندات، تحديد المسار القانوني، وبيان الإجراء الأنسب بحسب طبيعة النزاع.",
  },
  {
    title: "صياغة المذكرات واللوائح",
    text: "إعداد مذكرات دفاع، صحف دعاوى، طلبات نيابة، تظلمات، ردود قضائية، وحوافظ مستندات منظمة.",
  },
  {
    title: "العقود والإقرارات",
    text: "صياغة ومراجعة عقود البيع، التنازل، الشراكة، العمل، التعهدات، الإقرارات، ومحاضر الاتفاق.",
  },
  {
    title: "القضايا التجارية والمدنية",
    text: "تحليل المديونيات، الشيكات، أوامر الأداء، المطالبات المالية، منازعات الشركات، والمسؤولية العقدية.",
  },
  {
    title: "القضايا العمالية والأحوال الشخصية",
    text: "ترتيب المطالبات العمالية، التسويات، النفقة، الحضانة، الرؤية، وإعداد الطلبات المرتبطة بها.",
  },
  {
    title: "البلاغات والطلبات العاجلة",
    text: "طلبات كف البحث، الإفراج بكفالة، حفظ البلاغ، التظلمات، ومخاطبات الشرطة والنيابة عند توافر المستندات.",
  },
];

const legalLibrary = [
  {
    title: "دليل المطالبات المالية",
    type: "صفحة قانونية",
    text: "شرح مبسط لفكرة إثبات الدين، سند المطالبة، الإنذار، أمر الأداء، والدعوى المدنية.",
  },
  {
    title: "دليل الشيكات والتنفيذ",
    type: "مذكرة معرفية",
    text: "متى يكون الشيك سندًا للمطالبة؟ وما الفرق بين المطالبة المدنية والبلاغ الجزائي والتنفيذ؟",
  },
  {
    title: "دليل البلاغات الجزائية",
    type: "صفحة إرشادية",
    text: "طريقة ترتيب الوقائع، المستندات، الشهود، طلبات التحقيق، وطلبات الحفظ أو الإحالة.",
  },
  {
    title: "دليل العقود التجارية",
    type: "كتاب مختصر",
    text: "بنود جوهرية في البيع، التنازل، الشراكة، العمولة، التوريد، وضمانات السداد والتنفيذ.",
  },
  {
    title: "دليل القضايا العمالية",
    type: "صفحة قانونية",
    text: "الأجور، مكافأة نهاية الخدمة، الفصل، الإنذار، التسوية الودية، وبيانات صحيفة المطالبة.",
  },
  {
    title: "نماذج قانونية عملية",
    type: "نماذج وصفحات",
    text: "قائمة نماذج قابلة للتطوير: إنذار، إقرار، مخالصة، طلب نيابة، طلب شرطة، ومذكرة دفاع.",
  },
];

const articles = [
  {
    title: "كيف تجهز ملفك قبل الاستشارة؟",
    body: "ابدأ بترتيب الوقائع زمنيًا، ثم اجمع المستندات، ثم حدد المطلوب بدقة: مطالبة، دفاع، تظلم، شكوى، أو تسوية.",
  },
  {
    title: "قوة المستندات قبل قوة الكلام",
    body: "أي طلب قانوني يحتاج إلى سند واضح. المحادثات، التحويلات، العقود، الإيصالات، والإنذارات قد تغير تقييم الملف بالكامل.",
  },
  {
    title: "متى يكون الطلب عاجلًا؟",
    body: "يكون الطلب عاجلًا عند وجود توقيف، منع سفر، مهلة طعن، جلسة قريبة، تنفيذ، حجز، أو ضرر يتفاقم بتأخير الإجراء.",
  },
];

const faq = [
  {
    q: "هل الموقع بديل عن منصة حلم بروتال؟",
    a: "لا. هذا موقع معلومات وخدمات قانونية، أما حلم بروتال فهي بوابة التسجيل والمتابعة وطلب الاستشارة المجانية أو العاجلة.",
  },
  {
    q: "كيف أطلب استشارة مجانية أو عاجلة؟",
    a: "استخدم زر حلم بروتال، ثم سجل بياناتك وموضوع الطلب وارفع المستندات المتاحة حتى يتم فرز الطلب بشكل صحيح.",
  },
  {
    q: "هل المعلومات المنشورة تعتبر فتوى قانونية نهائية؟",
    a: "لا. المعلومات عامة وإرشادية، ولا تغني عن فحص المستندات والوقائع وتحديد الاختصاص والطلبات.",
  },
  {
    q: "ما البيانات المطلوبة عند التواصل؟",
    a: "الاسم، رقم التواصل، المدينة، نوع الطلب، رقم القضية إن وجد، المحكمة أو الجهة المختصة، والمستندات المتاحة.",
  },
];

const isElectron = /electron/i.test(navigator.userAgent);
if ("serviceWorker" in navigator && window.location.protocol !== "file:" && !isElectron) {
  registerSW({ immediate: true });
}

const SectionTitle = ({ badge, title, text }: { badge: string; title: string; text?: string }) => (
  <div className="mb-7 text-right">
    <div className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100">
      {badge}
    </div>
    <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">{title}</h2>
    {text ? <p className="mt-3 max-w-3xl text-base leading-8 text-slate-300">{text}</p> : null}
  </div>
);

const LegalWebsite: React.FC = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("helm_legal_comments") || "[]");
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    localStorage.setItem("helm_legal_comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

  const submitComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !body.trim()) return;

    const item: CommentItem = {
      id: `${Date.now()}`,
      name: name.trim(),
      subject: subject.trim() || "تعليق عام",
      body: body.trim(),
      createdAt: new Date().toLocaleString("ar-AE"),
    };

    setComments((prev) => [item, ...prev].slice(0, 20));
    setName("");
    setSubject("");
    setBody("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.20),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 text-2xl font-black text-slate-950 shadow-lg shadow-amber-500/20">
              H
            </div>
            <div>
              <div className="text-base font-black md:text-lg">مكتب حلم للاستشارات القانونية</div>
              <div className="text-xs font-semibold text-slate-300">Helm Legal Consulting Services</div>
            </div>
          </a>

          <nav className="hidden items-center gap-2 lg:flex">
            <a className="rounded-xl px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10" href="#services">الخدمات</a>
            <a className="rounded-xl px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10" href="#library">المكتبة</a>
            <a className="rounded-xl px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10" href="#articles">مقالات</a>
            <a className="rounded-xl px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10" href="#faq">الأسئلة</a>
            <a className="rounded-xl px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10" href="#comments">التعليقات</a>
          </nav>

          <a
            href={PORTAL_URL}
            className="rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-600 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20"
          >
            حلم بروتال
          </a>
        </div>
      </header>

      <section id="home" className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-7 text-right">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.9)]" />
            معلومات قانونية وخدمات إلكترونية
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              خدمات مكتب حلم
              <span className="mt-2 block bg-gradient-to-l from-amber-200 via-yellow-500 to-amber-100 bg-clip-text text-transparent">
                للاستشارات القانونية
              </span>
            </h1>
            <p className="max-w-3xl text-lg leading-9 text-slate-200 md:text-xl">
              منصة تعريفية قانونية تجمع معلومات عامة، صفحات إرشادية، مكتبة نماذج وكتب مختصرة، وقناة مباشرة للدخول إلى حلم بروتال لطلب استشارة مجانية أو عاجلة أو تسجيل الدخول لمتابعة ملفك.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={PORTAL_URL} className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-600 px-6 py-4 text-base font-black text-slate-950 shadow-xl shadow-amber-500/20 transition hover:scale-[1.02]">
              استشارة مجانية / عاجلة عبر حلم بروتال
            </a>
            <a href={PORTAL_URL} className="inline-flex items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 px-6 py-4 text-base font-black text-amber-100 transition hover:bg-amber-300/20">
              تسجيل الدخول للبوابة
            </a>
            <a href={WHATSAPP_URL} className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-4 text-base font-bold text-white transition hover:bg-white/[0.12]">
              واتساب عاجل
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <div className="text-2xl font-black text-amber-200">24/7</div>
              <div className="mt-1 text-sm text-slate-200">استقبال الطلبات إلكترونيًا</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <div className="text-2xl font-black text-amber-200">PDF</div>
              <div className="mt-1 text-sm text-slate-200">مذكرات ونماذج ومستندات</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <div className="text-2xl font-black text-amber-200">Portal</div>
              <div className="mt-1 text-sm text-slate-200">تسجيل ومتابعة عبر حلم بروتال</div>
            </div>
          </div>
        </div>

        <aside className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 rotate-6 rounded-[2.25rem] bg-amber-400/20 blur-xl" />
          <div className="relative rounded-[2.25rem] border border-white/15 bg-slate-900/90 p-5 shadow-2xl">
            <div className="rounded-[1.75rem] border border-amber-200/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 text-5xl font-black text-slate-950 shadow-2xl shadow-amber-500/30">
                H
              </div>
              <h2 className="mt-5 text-2xl font-black">HELM Portal</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">بوابة الاستشارات المجانية والعاجلة وتسجيل الدخول</p>

              <div className="mt-6 space-y-3 text-right">
                <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ طلب استشارة مجانية</div>
                <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ طلب عاجل مع رفع المستندات</div>
                <div className="rounded-2xl bg-white/[0.06] p-3 text-sm text-slate-200">✓ تسجيل دخول ومتابعة الطلب</div>
              </div>

              <a href={PORTAL_URL} className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-amber-100">
                فتح حلم بروتال الآن
              </a>
            </div>
          </div>
        </aside>
      </section>

      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10">
        <SectionTitle badge="الخدمات القانونية" title="خدمات المكتب" text="أقسام عملية منظمة تساعد الزائر على فهم نوع الخدمة قبل إرسال الطلب عبر حلم بروتال." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-right shadow-xl backdrop-blur">
              <h3 className="text-xl font-black text-amber-100">{card.title}</h3>
              <p className="mt-3 leading-8 text-slate-300">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="library" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10">
        <SectionTitle badge="المكتبة القانونية" title="كتب وصفحات قانونية مختصرة" text="محتوى معرفي مبدئي للزوار، قابل للتوسع لاحقًا بإضافة ملفات PDF وروابط تحميل مستقلة داخل المستودع." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {legalLibrary.map((book) => (
            <article key={book.title} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 text-right shadow-xl">
              <div className="mb-3 inline-flex rounded-full bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100">{book.type}</div>
              <h3 className="text-xl font-black text-white">{book.title}</h3>
              <p className="mt-3 leading-8 text-slate-300">{book.text}</p>
              <a href={PORTAL_URL} className="mt-5 inline-flex rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-black text-amber-100">
                اطلب نسخة أو استشارة حول الموضوع
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="articles" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10">
        <SectionTitle badge="مقالات وصفحات" title="معلومات قانونية عامة" text="المحتوى التالي توعوي عام، ولا يعتبر رأيًا قانونيًا نهائيًا قبل فحص المستندات والوقائع." />
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-right">
              <h3 className="text-xl font-black text-amber-100">{article.title}</h3>
              <p className="mt-3 leading-8 text-slate-300">{article.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-5 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 shadow-2xl md:grid-cols-[1fr_auto] md:items-center">
          <div className="text-right">
            <h2 className="text-2xl font-black text-amber-100">لديك أمر عاجل أو تريد استشارة مجانية؟</h2>
            <p className="mt-3 leading-8 text-slate-200">ادخل إلى حلم بروتال وسجل الطلب، أو استخدم واتساب في الحالات العاجلة مع إرسال المستندات الأساسية.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={PORTAL_URL} className="rounded-2xl bg-amber-300 px-6 py-4 text-center font-black text-slate-950">دخول حلم بروتال</a>
            <a href={WHATSAPP_URL} className="rounded-2xl border border-white/15 bg-white/[0.08] px-6 py-4 text-center font-black text-white">واتساب عاجل</a>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10">
        <SectionTitle badge="الأسئلة الشائعة" title="إجابات مختصرة للزوار" />
        <div className="grid gap-4 md:grid-cols-2">
          {faq.map((item) => (
            <article key={item.q} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 text-right">
              <h3 className="text-lg font-black text-amber-100">{item.q}</h3>
              <p className="mt-3 leading-8 text-slate-300">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="comments" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10 pb-16">
        <SectionTitle badge="تعليقات الزوار" title="اترك تعليقًا أو سؤالًا عامًا" text="التعليقات هنا تظهر على نفس الجهاز محليًا. للتعليق العام الحقيقي المشترك بين كل الزوار يلزم تفعيل GitHub Discussions أو ربط قاعدة بيانات لاحقًا." />
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={submitComment} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-right shadow-2xl backdrop-blur">
            <label className="block text-sm font-black text-slate-200">الاسم</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-amber-300" placeholder="اكتب اسمك" />

            <label className="mt-4 block text-sm font-black text-slate-200">الموضوع</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-amber-300" placeholder="مثال: استفسار عن مطالبة مالية" />

            <label className="mt-4 block text-sm font-black text-slate-200">التعليق</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-2 min-h-36 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-amber-300" placeholder="اكتب تعليقك أو سؤالك العام" />

            <button type="submit" className="mt-4 w-full rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-600 px-6 py-4 font-black text-slate-950">
              نشر التعليق
            </button>
            <a href={PORTAL_URL} className="mt-3 inline-flex w-full justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 px-6 py-4 font-black text-amber-100">
              للاستشارة الخاصة استخدم حلم بروتال
            </a>
          </form>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 text-right text-slate-300">
                لا توجد تعليقات محفوظة على هذا الجهاز حتى الآن.
              </div>
            ) : (
              comments.map((comment) => (
                <article key={comment.id} className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 text-right">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-amber-100">{comment.subject}</h3>
                    <span className="text-xs text-slate-500">{comment.createdAt}</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-400">{comment.name}</div>
                  <p className="mt-3 leading-8 text-slate-300">{comment.body}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950/80 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-right text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>© {currentYear} مكتب حلم للاستشارات القانونية. جميع الحقوق محفوظة.</div>
          <div className="flex flex-wrap gap-3">
            <a href={PORTAL_URL} className="text-amber-100">حلم بروتال</a>
            <a href={WHATSAPP_URL}>واتساب</a>
            <a href={EMAIL_URL}>البريد الإلكتروني</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

const el = document.getElementById("root");
if (!el) throw new Error("Root element #root not found");

ReactDOM.createRoot(el).render(
  <React.StrictMode>
    <LegalWebsite />
  </React.StrictMode>
);