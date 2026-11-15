import React, { useMemo, useState } from 'react';
import {
  Sparkles, Heart, Briefcase, Wallet, Activity, Calendar, Search,
  Star, Award, Info, TrendingUp, ExternalLink, BookOpen, Clock, CheckCircle2,
} from 'lucide-react';
import CrossAnalysis from './components/CrossAnalysis';
import { ZODIAC_SIGNS } from './data/zodiac';
import {
  getDailyReading, getMonthlyReading, getProfile, getNameProfile, readiness,
  toLocalISODate, toYearMonth, type ProfileResult, type NameProfile,
} from './lib/api';
import type { DailyReading, MonthlyReading, ZodiacSign } from './types';

type Reading = DailyReading | MonthlyReading;

const TABS = [
  { id: 'horoscope', label: 'Horoscope journalier', short: 'Horoscope', Icon: Sparkles },
  { id: 'mensuel', label: 'Tendances Mensuelles', short: 'Tendances', Icon: TrendingUp },
  { id: 'profiler', label: 'Mon Profil', short: 'Mon Profil', Icon: Search },
] as const;
type TabId = (typeof TABS)[number]['id'];

const CATEGORY_CARDS = [
  { key: 'amour', label: 'Amour & relations', Icon: Heart, box: 'bg-rose-50/40 border-rose-100', iconBox: 'bg-rose-100 text-rose-700', title: 'text-rose-950', badge: 'bg-rose-100 text-rose-900' },
  { key: 'travail', label: 'Travail & carrière', Icon: Briefcase, box: 'bg-sky-50/40 border-sky-100', iconBox: 'bg-sky-100 text-sky-700', title: 'text-sky-950', badge: 'bg-sky-100 text-sky-900' },
  { key: 'argent', label: 'Argent & finances', Icon: Wallet, box: 'bg-emerald-50/40 border-emerald-100', iconBox: 'bg-emerald-100 text-emerald-700', title: 'text-emerald-950', badge: 'bg-emerald-100 text-emerald-900' },
  { key: 'sante', label: 'Santé & vitalité', Icon: Activity, box: 'bg-amber-50/40 border-amber-100', iconBox: 'bg-amber-100 text-amber-800', title: 'text-amber-950', badge: 'bg-amber-100 text-amber-900' },
] as const;

const NUM_TONES = {
  lifePath: { box: 'bg-indigo-50/40 border-indigo-100', label: 'text-indigo-900', badge: 'bg-indigo-600' },
  expression: { box: 'bg-purple-50/40 border-purple-100', label: 'text-purple-900', badge: 'bg-purple-600' },
  soul: { box: 'bg-rose-50/40 border-rose-100', label: 'text-rose-900', badge: 'bg-rose-600' },
  intimate: { box: 'bg-emerald-50/40 border-emerald-100', label: 'text-emerald-900', badge: 'bg-emerald-600' },
  personalYear: { box: 'bg-amber-50/40 border-amber-100', label: 'text-amber-900', badge: 'bg-amber-600' },
  inclusion: { box: 'bg-sky-50/40 border-sky-100', label: 'text-sky-900', badge: '' },
} as const;
type NumTone = (typeof NUM_TONES)[keyof typeof NUM_TONES];

const DeveloperFooter = () => (
  <footer className="mt-8 mb-4 text-center">
    <a
      href="https://precieux6.github.io/mon-portfolio/#contact"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors duration-200 bg-white/60 hover:bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-2xs"
    >
      <span>Développé par Précieux Trésor TOSSOU • Astrologie & SaaS</span>
      <ExternalLink size={12} className="opacity-70" />
    </a>
  </footer>
);

const Pending = () => (
  <p className="p-6 text-sm text-slate-500 text-center">Les prévisions sont en cours de préparation.</p>
);

function SignPicker({ selected, onSelect, showDates }: { selected: ZodiacSign; onSelect: (s: ZodiacSign) => void; showDates: boolean }) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Choisissez votre signe :</p>
        <span className="text-xs text-purple-700 font-semibold">Actif : <strong className="text-slate-900">{selected.name}</strong></span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {ZODIAC_SIGNS.map((sign) => {
          const isSelected = selected.id === sign.id;
          return (
            <button
              key={sign.id}
              onClick={() => onSelect(sign)}
              className={`flex items-center gap-2.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition duration-200 border text-left ${
                isSelected
                  ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs ring-2 ring-purple-500/20'
                  : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="text-2xl sm:text-3xl shrink-0">{sign.symbol}</span>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold truncate">{sign.name}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{showDates ? sign.dates : sign.element}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SignHero({ sign, eyebrow, title, subtitle }: { sign: ZodiacSign; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className={`bg-gradient-to-r ${sign.color} text-white p-4 sm:p-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left`}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl border border-white/20 shadow-inner shrink-0">
        {sign.symbol}
      </div>
      <div>
        <span className="text-[10px] uppercase bg-white/20 px-2.5 py-0.5 rounded-full font-bold">{eyebrow}</span>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">{title}</h3>
        <p className="text-white/90 text-xs sm:text-sm mt-0.5 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function ReadingView({ reading, conseilTitle, justify }: { reading: Reading; conseilTitle: string; justify: boolean }) {
  return (
    <div className="p-4 sm:p-8 space-y-4 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {CATEGORY_CARDS.map((c) => {
          const r = reading[c.key];
          const Icon = c.Icon;
          return (
            <div key={c.key} className={`${c.box} border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 ${c.iconBox} rounded-xl`}><Icon size={18} /></div>
                  <h4 className={`text-sm sm:text-base font-bold ${c.title}`}>{c.label}</h4>
                </div>
                <span className={`text-xs font-extrabold ${c.badge} px-2.5 py-0.5 rounded-full`}>{r.score}%</span>
              </div>
              <p className={`text-slate-700 text-xs sm:text-sm leading-relaxed ${justify ? 'text-justify' : ''}`}>{r.text}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-lg shrink-0">💡</div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-widest block">{conseilTitle}</span>
            <p className="text-xs sm:text-base italic text-purple-100 mt-0.5">"{reading.conseil}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignBlock({ title, sign, sub }: { title: string; sign: ZodiacSign; sub: string }) {
  return (
    <div className="text-center sm:text-left">
      <span className="text-[10px] sm:text-xs font-extrabold text-purple-700 uppercase">{title}</span>
      <div className="flex items-center gap-2 justify-center sm:justify-start">
        <span className="text-4xl sm:text-5xl">{sign.symbol}</span>
        <h3 className="text-xl sm:text-3xl font-black text-slate-900">{sign.name}</h3>
      </div>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function NumCard({ tone, label, n, icon, text, detail }: { tone: NumTone; label: string; n?: number; icon?: React.ReactNode; text: string; detail?: string }) {
  return (
    <div className={`${tone.box} border p-4 sm:p-5 rounded-2xl space-y-2`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-bold uppercase ${tone.label}`}>{label}</span>
        {icon ?? (
          <span className={`w-7 h-7 shrink-0 rounded-full ${tone.badge} text-white font-extrabold text-xs flex items-center justify-center`}>{n}</span>
        )}
      </div>
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">{text}</p>
      {detail && <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">{detail}</p>}
    </div>
  );
}

function ProfileView({ p }: { p: ProfileResult }) {
  const num = p.numerology;
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-200 p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 p-4 sm:p-6 bg-purple-50 rounded-2xl sm:rounded-3xl border border-purple-100">
        <div className="grid grid-cols-2 gap-4 sm:gap-10 flex-1">
          <SignBlock title="Signe tropical" sign={p.tropical.sign} sub={`${p.tropical.sign.dates} • Année ${p.birthYear}`} />
          <SignBlock title="Signe sidéral" sign={p.sign} sub={`Élément ${p.sign.element}`} />
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-purple-200 text-xs text-purple-900 max-w-xs shadow-2xs text-left">
          <strong className="block text-purple-950 font-bold mb-1">🔑 Transit :</strong>
          <p className="text-slate-600 text-[11px] leading-relaxed">{p.dominantPlanet}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-slate-900 font-extrabold text-base sm:text-lg flex items-center gap-2 border-b pb-2">
          <BookOpen className="text-purple-700" size={20} /> ANALYSE NUMÉROLOGIQUE COMPLÈTE
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumCard tone={NUM_TONES.lifePath} label="Chemin de vie" n={num.lifePath} text={num.lifePathText} detail={num.details.lifePath} />
          <NumCard tone={NUM_TONES.expression} label="Nombre d'expression" n={num.expression} text={num.expressionText} detail={num.details.expression} />
          <NumCard tone={NUM_TONES.soul} label="Élan spirituel (âme)" n={num.soul} text={num.soulText} detail={num.details.soul} />
          <NumCard tone={NUM_TONES.intimate} label="Nombre intime" n={num.intimate} text={num.intimateText} detail={num.details.intimate} />
          <NumCard tone={NUM_TONES.personalYear} label={`Année personnelle (${new Date().getFullYear()}) · ${num.personalYearLabel}`} n={num.personalYear} text={num.personalYearText} detail={num.details.personalYear} />
          <NumCard tone={NUM_TONES.inclusion} label="Inclusion & maturité" icon={<Clock size={16} className="text-sky-700" />} text={`${num.inclusionText} ${num.maturityText}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3">
          <h4 className="text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-2">
            <Award className="text-emerald-600" size={18} /> TOP 10 QUALITÉS
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {p.qualities.map((item) => (
              <span key={item} className="bg-white border border-emerald-200 text-emerald-900 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg">{item}</span>
            ))}
          </div>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3">
          <h4 className="text-amber-950 font-bold text-sm sm:text-base flex items-center gap-2">
            <Info className="text-amber-600" size={18} /> TOP 10 DÉFAUTS
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {p.flaws.map((item) => (
              <span key={item} className="bg-white border border-amber-200 text-amber-900 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg">{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-3">
        <h4 className="text-amber-300 font-black text-base sm:text-lg uppercase tracking-wider flex items-center gap-2">
          <Star size={20} className="text-amber-400 fill-amber-400" /> Synthèse astrologique & numérologique
        </h4>
        <p className="text-purple-100 text-xs sm:text-sm leading-relaxed text-justify font-medium">{num.summaryText}</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3">
        <h4 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
          <Star size={18} className="text-amber-500 fill-amber-500" /> Domaines d'excellence
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {p.excellenceDomains.map((domain) => (
            <div key={domain} className="bg-white p-2.5 rounded-xl border border-slate-200 text-center font-bold text-[11px] sm:text-xs text-slate-800">{domain}</div>
          ))}
        </div>
      </div>

      <CrossAnalysis profile={p} />
    </div>
  );
}

function NameProfileView({ p }: { p: NameProfile }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-200 p-4 sm:p-8 space-y-6 animate-fadeIn">
      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-xl px-4 py-3">
        Sans date de naissance, votre profil s'appuie sur votre nom. Ajoutez votre date pour découvrir votre signe.
      </div>

      <h4 className="text-slate-900 font-extrabold text-base sm:text-lg flex items-center gap-2 border-b pb-2">
        <BookOpen className="text-purple-700" size={20} /> ANALYSE NUMÉROLOGIQUE DE VOTRE NOM
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumCard tone={NUM_TONES.expression} label="Nombre d'expression" n={p.expression} text={p.expressionText} detail={p.expressionDetail} />
        <NumCard tone={NUM_TONES.soul} label="Élan spirituel (âme)" n={p.soul} text={p.soulText} detail={p.soulDetail} />
        <NumCard tone={NUM_TONES.intimate} label="Nombre intime" n={p.intimate} text={p.intimateText} detail={p.intimateDetail} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
          <h4 className="text-emerald-950 font-bold text-sm flex items-center gap-2"><Award className="text-emerald-600" size={16} /> Qualités</h4>
          <div className="flex flex-wrap gap-1.5">
            {p.qualities.map((q) => (
              <span key={q} className="bg-white border border-emerald-200 text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-lg">{q}</span>
            ))}
          </div>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-2">
          <h4 className="text-amber-950 font-bold text-sm flex items-center gap-2"><Info className="text-amber-600" size={16} /> Points de vigilance</h4>
          <div className="flex flex-wrap gap-1.5">
            {p.flaws.map((f) => (
              <span key={f} className="bg-white border border-amber-200 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-lg">{f}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
        <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2"><Star size={16} className="text-amber-500 fill-amber-500" /> Domaines d'excellence</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {p.excellenceDomains.map((d) => (
            <div key={d} className="bg-white p-2.5 rounded-xl border border-slate-200 text-center font-bold text-[11px] text-slate-800">{d}</div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-5 rounded-2xl space-y-2">
        <h4 className="text-amber-300 font-black text-sm uppercase tracking-wider">Signature cabalistique</h4>
        <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">{p.cabal.keyPhrase}</p>
        <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">{p.inclusionText}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('horoscope');
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0] as ZodiacSign);

  const [birthdateInput, setBirthdateInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [searchedProfile, setSearchedProfile] = useState<ProfileResult | null>(null);
  const [searchedNameProfile, setSearchedNameProfile] = useState<NameProfile | null>(null);
  const [profileError, setProfileError] = useState('');

  const todayISO = useMemo(() => toLocalISODate(), []);
  const yearMonthISO = useMemo(() => toYearMonth(todayISO), [todayISO]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const monthFormatted = useMemo(() => {
    return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, []);

  // Null tant que les banques de phrases ne sont pas complètes : aucun texte de repli.
  const currentHoroscope = useMemo<DailyReading | null>(() => {
    return readiness.daily.ready ? getDailyReading(selectedSign.id, todayISO) : null;
  }, [selectedSign, todayISO]);

  const currentMonthlyTrends = useMemo<MonthlyReading | null>(() => {
    return readiness.monthly.ready ? getMonthlyReading(selectedSign.id, yearMonthISO) : null;
  }, [selectedSign, yearMonthISO]);

  const handleProfileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullNameInput.trim().length < 2) {
      setProfileError('Saisissez votre nom complet (2 lettres minimum).');
      return;
    }
    if (birthdateInput) {
      const profile = getProfile(birthdateInput, fullNameInput);
      if (!profile) {
        setProfileError('Vérifiez la date (passée, après 1900).');
        return;
      }
      setSearchedProfile(profile);
      setSearchedNameProfile(null);
    } else {
      const nameProfile = getNameProfile(fullNameInput);
      if (!nameProfile) {
        setProfileError('Le nom saisi ne permet pas de calcul.');
        return;
      }
      setSearchedNameProfile(nameProfile);
      setSearchedProfile(null);
    }
    setProfileError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-24 sm:pb-12 flex flex-col selection:bg-purple-200 selection:text-purple-900 overflow-x-hidden">

      {/* HEADER FIXE */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/logo-astraea.png"
              alt="Logo ASTRAEA"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 bg-clip-text text-transparent tracking-tight">
                ASTRAEA
              </h1>
              <p className="text-[10px] text-slate-500 font-medium hidden md:block">Astrologie & Numérologie</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  activeTab === id ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={15} className={activeTab === id ? 'text-purple-600' : ''} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-slate-700">{todayFormatted}</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
              <CheckCircle2 size={12} /> Éphémérides Actives
            </p>
          </div>
        </div>
      </header>

      {/* CONTENEUR PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 flex-1 w-full">

        {/* ONGLET 1 : HOROSCOPE DU JOUR */}
        {activeTab === 'horoscope' && (
          <div className="space-y-4 sm:space-y-8 animate-fadeIn">
            <div className="text-center max-w-3xl mx-auto space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Mon horoscope au quotidien avec Maître Folly Valère TOSSOU
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
                Prévisions pour le {todayFormatted}.
              </p>
              {currentHoroscope?.headline && (
                <p className="text-xs sm:text-sm text-purple-800 font-medium mt-1">{currentHoroscope.headline}</p>
              )}
            </div>

            <SignPicker selected={selectedSign} onSelect={setSelectedSign} showDates />

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-200 overflow-hidden">
              <SignHero
                sign={selectedSign}
                eyebrow="Votre signe"
                title={selectedSign.name}
                subtitle={`${selectedSign.dates} • Élément ${selectedSign.element} • Régent : ${selectedSign.planet}`}
              />
              {currentHoroscope
                ? <ReadingView reading={currentHoroscope} conseilTitle="Conseil du jour" justify={false} />
                : <Pending />}
            </div>

            <DeveloperFooter />
          </div>
        )}

        {/* ONGLET 2 : TENDANCES MENSUELLES */}
        {activeTab === 'mensuel' && (
          <div className="space-y-4 sm:space-y-8 animate-fadeIn">
            <div className="text-center max-w-3xl mx-auto space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Tendances mensuelles avec Maître Folly Valère TOSSOU
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
                Bilan global et approfondi pour le mois de <strong className="text-purple-800 capitalize">{monthFormatted}</strong>.
              </p>
              {currentMonthlyTrends?.headline && (
                <p className="text-xs sm:text-sm text-purple-800 font-medium mt-1">{currentMonthlyTrends.headline}</p>
              )}
            </div>

            <SignPicker selected={selectedSign} onSelect={setSelectedSign} showDates={false} />

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-200 overflow-hidden">
              <SignHero
                sign={selectedSign}
                eyebrow={`Grand bilan de ${monthFormatted}`}
                title={selectedSign.name}
                subtitle={`${selectedSign.dates} • Élément ${selectedSign.element}`}
              />
              {currentMonthlyTrends
                ? <ReadingView reading={currentMonthlyTrends} conseilTitle="Conseil du mois" justify />
                : <Pending />}
            </div>

            <DeveloperFooter />
          </div>
        )}

        {/* ONGLET 3 : PROFIL */}
        {activeTab === 'profiler' && (
          <div className="space-y-4 sm:space-y-8 animate-fadeIn">
            <div className="text-center max-w-3xl mx-auto space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Profilage astrologique & numérologique
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
                Découvrez vos signes et votre numérologie complète.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200">
              <form onSubmit={handleProfileSearch} className="space-y-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                    Nom et prénoms :
                  </label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    required
                    placeholder="Ex : Aïcha Dossou Koffi"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-300 focus:ring-2 focus:ring-purple-600 text-xs sm:text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                    Date de naissance (facultative) :
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="date"
                        min="1900-01-01"
                        max={todayISO}
                        value={birthdateInput}
                        onChange={(e) => setBirthdateInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-300 focus:ring-2 focus:ring-purple-600 text-xs sm:text-sm outline-none"
                      />
                      <Calendar className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    </div>
                    <button type="submit" className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <Search size={16} /> Calculer
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Sans date, votre profil s'appuie sur votre nom : nombres, traits et signature cabalistique.
                  </p>
                </div>
              </form>
              {profileError && (
                <p role="alert" className="mt-3 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{profileError}</p>
              )}
            </div>

            {searchedProfile && <ProfileView p={searchedProfile} />}
            {searchedNameProfile && <NameProfileView p={searchedNameProfile} />}

            <DeveloperFooter />
          </div>
        )}
      </main>

      {/* BARRE DE NAVIGATION BOTTOM MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 md:hidden px-3 py-2 shadow-lg">
        <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
          {TABS.map(({ id, short, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition ${
                activeTab === id ? 'text-purple-800 bg-purple-50' : 'text-slate-500'
              }`}
            >
              <Icon size={18} className="mb-0.5" />
              <span>{short}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
