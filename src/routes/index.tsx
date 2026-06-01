import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import heroImg from "@/assets/hero-family2.png";
import mossellijn from "@/assets/mossellijn.png";
import panterprint from "@/assets/panterprint.png";
import panterprint2 from "@/assets/panterprint2.png";
import brievenbus from "@/assets/brievenbus.png";
import brbLogo from "@/assets/brb-logo.png";
import { Shirt, type LucideIcon, Coffee, Sticker, MessageCircle, Tv, HardHat } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amai. Er komt iets aan." },
      {
        name: "description",
        content:
          "Zet uw mail op de lijst, stem mee en zie als eerste hints en updates rond de toekomstige Backeljau-drop.",
      },
      { property: "og:title", content: "Amai. Er komt iets aan." },
      {
        property: "og:description",
        content: "Schrijf u in, stem mee en zie de eerste hints vóór de rest.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const OPTIONS: {
  id: string;
  label: string;
  Icon: LucideIcon;
  color: string;
}[] = [
  { id: "interest_tshirt", label: "T-shirt", Icon: Shirt, color: "var(--green)" },
  { id: "interest_hoodie", label: "Hoodie", Icon: Shirt, color: "var(--pink)" },
  { id: "interest_mok", label: "Mok", Icon: Coffee, color: "var(--green)" },
  { id: "interest_stickerpack", label: "Stickerpack", Icon: Sticker, color: "var(--turquoise)" },
  {
    id: "interest_quote_merch",
    label: "Quote merch",
    Icon: MessageCircle,
    color: "var(--bordeaux)",
  },
  { id: "interest_retro_special", label: "Retro special", Icon: Tv, color: "var(--yellow)" },
  { id: "interest_pet", label: "Pet", Icon: HardHat, color: "var(--pink)" },
];

type OptionalShareNavigator = Navigator & {
  share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
};

function track(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    console.log("[track]", event, data ?? {});
  }
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function Landing() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const [picks, setPicks] = useState<string[]>([]);
  const [voteEmail, setVoteEmail] = useState("");
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSaved, setVoteSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("brb_subscribed") === "1") setSubscribed(true);
    if (localStorage.getItem("brb_voted") === "1") setVoteSaved(true);
  }, []);

  const submitHero = (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Amai, dat e-mailadres klopt niet.");
      return;
    }

    if (!consent) {
      setError("Vink eerst even de toestemming aan.");
      return;
    }

    setError(null);
    localStorage.setItem("brb_subscribed", "1");
    localStorage.setItem("brb_email", email);
    setSubscribed(true);
    track("hero_email_submit", { email });

    document.getElementById("kies")?.scrollIntoView({ behavior: "smooth" });
  };

  const togglePick = (id: string) => {
    setPicks((current) => {
      if (current.includes(id)) {
        const next = current.filter((x) => x !== id);
        track("poll_option_selected", { id, selected: false });
        return next;
      }

      if (current.length >= 3) return current;

      track("poll_option_selected", { id, selected: true });
      return [...current, id];
    });
  };

  const saveVote = (e: FormEvent) => {
    e.preventDefault();

    if (picks.length === 0) {
      setVoteError("Kies eerst minstens één ding.");
      return;
    }

    const storedEmail = localStorage.getItem("brb_email") || "";
    const useEmail = subscribed ? storedEmail : voteEmail;

    if (!isValidEmail(useEmail)) {
      setVoteError("Bijna. Vul een geldig e-mailadres in.");
      return;
    }

    setVoteError(null);

    if (!subscribed) {
      localStorage.setItem("brb_subscribed", "1");
      localStorage.setItem("brb_email", useEmail);
      setSubscribed(true);
    }

    localStorage.setItem("brb_voted", "1");
    localStorage.setItem("brb_picks", JSON.stringify(picks));
    setVoteSaved(true);

    track("poll_vote_saved", { picks, email: useEmail });
  };

  const finalSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Amai, dat e-mailadres klopt niet.");
      return;
    }

    if (!consent) {
      setError("Vink eerst even de toestemming aan.");
      return;
    }

    setError(null);
    localStorage.setItem("brb_subscribed", "1");
    localStorage.setItem("brb_email", email);
    setSubscribed(true);
    track("final_cta_submit", { email });
  };

  const share = async () => {
    const text = "Amai. Er komt iets aan. Stem mee op de eerste Backeljau-drop.";
    track("share_clicked");

    const nav =
      typeof window !== "undefined" ? (window.navigator as OptionalShareNavigator) : undefined;

    if (nav?.share) {
      try {
        await nav.share({
          title: "Backeljau",
          text,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else if (nav?.clipboard) {
      await nav.clipboard.writeText(`${text} ${window.location.href}`);
      alert("Link gekopieerd. Stuur maar door.");
    }
  };

  const counter = useMemo(() => `${picks.length}/3 gekozen`, [picks.length]);

  return (
    <main
      className="min-h-screen text-ink overflow-x-hidden"
      style={{ backgroundColor: "var(--pink)" }}
    >
      {/* HERO */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: "var(--yellow)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url(${panterprint2})`,
            backgroundSize: "600px",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="mx-auto flex flex-col lg:flex-row items-stretch w-full max-w-[1400px] relative z-10">
          <div className="relative w-full lg:w-[60%] min-h-[70vh] lg:min-h-[95vh] overflow-hidden rounded-b-[2rem] lg:rounded-bl-[2rem] lg:rounded-tr-none">
            <img
              src={heroImg}
              alt="Nostalgische familiescène"
              className="h-full w-full object-contain object-center"
            />

            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
              <img
                src={brbLogo}
                alt="Logo"
                className="w-28 sm:w-36 md:w-48 lg:w-56 h-auto drop-shadow-[4px_4px_0_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>

          <div className="flex w-full lg:w-[40%] items-center justify-center px-4 py-10 lg:py-0 lg:px-8">
            <div
              className="w-full max-w-md border-2 border-ink rounded-2xl p-6 md:p-8"
              style={{ backgroundColor: "var(--cream)" }}
            >
              <h1 className="font-display text-5xl md:text-6xl leading-[0.9]">Amai.</h1>

              <p className="mt-3 font-display text-3xl md:text-4xl leading-none">
                Er komt iets aan.
              </p>

              <p className="mt-5 text-base md:text-lg">Schrijf u in. Zie het eerst.</p>

              {!subscribed ? (
                <form onSubmit={submitHero} className="mt-6 space-y-3" noValidate>
                  <label className="block">
                    <span className="block text-sm mb-1">Uw e-mailadres</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="uw@email.be"
                      className="w-full rounded-lg border-2 border-ink bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-[color:var(--turquoise)]"
                    />
                  </label>

                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-5 w-5 accent-[color:var(--bordeaux)]"
                    />
                    <span>Ja, stuur mij updates. Uitschrijven kan altijd.</span>
                  </label>

                  {error && (
                    <p className="text-sm" style={{ color: "var(--bordeaux)" }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full font-display text-xl md:text-2xl py-4 rounded-xl border-2 border-ink shadow-chunky hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_var(--ink)] transition-all"
                    style={{ backgroundColor: "var(--yellow)", color: "var(--ink)" }}
                  >
                    Zet mij op de lijst
                  </button>

                  <p className="text-xs text-center opacity-80">Geen zever. Alleen updates.</p>
                </form>
              ) : (
                <div className="mt-6 space-y-3">
                  <div
                    className="rounded-xl border-2 border-ink p-4 shadow-chunky"
                    style={{ backgroundColor: "var(--turquoise)" }}
                  >
                    <p className="font-display text-2xl">Amai. Ge staat erop.</p>
                    <p className="mt-1 text-sm">
                      Nog 10 seconden? Kies mee wat er eerst moet komen.
                    </p>
                  </div>

                  <a
                    href="#kies"
                    className="block text-center font-display text-xl py-4 rounded-xl border-2 border-ink shadow-chunky"
                    style={{ backgroundColor: "var(--yellow)", color: "var(--ink)" }}
                  >
                    Naar de stemronde
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KIES */}
      <section
        id="kies"
        className="relative pt-56 md:pt-64 pb-20 px-0 overflow-visible"
        style={{ backgroundColor: "var(--pink)" }}
      >
        <img
          src={mossellijn}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-10 w-[110vw] max-w-none h-auto -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 opacity-25 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url(${panterprint})`,
            backgroundSize: "600px",
          }}
        />

        <div className="relative z-20 max-w-5xl mx-auto text-center">
          <h2
            className="font-display text-6xl sm:text-8xl md:text-9xl text-shadow-chunky-lg leading-none"
            style={{ color: "var(--yellow)" }}
          >
            KIES MEE
          </h2>

          <p className="mt-3 font-display text-xl md:text-2xl" style={{ color: "var(--cream)" }}>
            Wat komt er eerst? Max. 3.
          </p>

          <div
            className="mt-6 inline-block rounded-full border-2 border-ink px-4 py-1 font-display"
            style={{ backgroundColor: "var(--turquoise)", color: "var(--ink)" }}
          >
            {counter}
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {OPTIONS.map((option) => {
              const selected = picks.includes(option.id);
              const disabled = !selected && picks.length >= 3;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => togglePick(option.id)}
                  disabled={disabled}
                  aria-pressed={selected}
                  className="font-display text-lg md:text-xl py-5 px-3 rounded-2xl border-2 border-ink shadow-chunky transition-all hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_var(--ink)] disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
                  style={{
                    backgroundColor: selected ? "var(--yellow)" : "var(--cream)",
                    color: "var(--ink)",
                    transform: selected ? "rotate(-1deg)" : undefined,
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center rounded-full border-2 border-ink"
                    style={{
                      backgroundColor: option.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <option.Icon
                      className="h-7 w-7 md:h-8 md:w-8"
                      strokeWidth={2.5}
                      color="var(--ink)"
                    />
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {!voteSaved ? (
            <form onSubmit={saveVote} className="mt-8 space-y-3 text-left">
              {!subscribed && (
                <div
                  className="rounded-xl border-2 border-ink p-4 shadow-chunky"
                  style={{ backgroundColor: "var(--cream)" }}
                >
                  <p className="font-display text-lg">Bijna. Waar mogen we uw stem bewaren?</p>

                  <input
                    type="email"
                    value={voteEmail}
                    onChange={(e) => setVoteEmail(e.target.value)}
                    placeholder="uw@email.be"
                    className="mt-2 w-full rounded-lg border-2 border-ink bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-[color:var(--turquoise)]"
                  />
                </div>
              )}

              {voteError && (
                <p
                  className="text-sm text-center rounded-lg p-2"
                  style={{
                    color: "var(--bordeaux)",
                    backgroundColor: "var(--cream)",
                  }}
                >
                  {voteError}
                </p>
              )}

              <button
                type="submit"
                className="w-full font-display text-xl md:text-2xl py-4 rounded-xl border-2 border-ink shadow-chunky hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_var(--ink)] transition-all"
                style={{ backgroundColor: "var(--yellow)", color: "var(--ink)" }}
              >
                Bewaar mijn stem
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-3">
              <div
                className="rounded-xl border-2 border-ink p-5 shadow-chunky text-left"
                style={{ backgroundColor: "var(--cream)" }}
              >
                <p className="font-display text-2xl">Uw stem zit erin. Schoon gekozen.</p>
                <p className="mt-1">Merci. Ge helpt Drop 001 kiezen.</p>
              </div>

              <button
                type="button"
                onClick={share}
                className="w-full font-display text-lg py-3 rounded-xl border-2 border-ink shadow-chunky"
                style={{ backgroundColor: "var(--turquoise)", color: "var(--ink)" }}
              >
                Stuur door naar iemand die dit ook nog weet
              </button>
            </div>
          )}
        </div>
      </section>

      {/* TOT ZIENS */}
      <section
        className="relative pt-16 pb-20 px-4 overflow-hidden"
        style={{ backgroundColor: "var(--turquoise)" }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <img
            src={brievenbus}
            alt="Iemand kijkt door een brievenbus"
            className="block mx-auto h-auto w-[95vw] md:w-[85vw] lg:w-[75vw] max-w-[1400px] drop-shadow-[8px_8px_0_var(--ink)]"
          />

          <h2
            className="font-display text-6xl sm:text-8xl md:text-9xl mt-8 text-shadow-chunky-lg leading-none"
            style={{ color: "var(--yellow)" }}
          >
            TOT ZIENS
          </h2>

          <p className="font-display text-2xl md:text-3xl mt-3" style={{ color: "var(--ink)" }}>
            Tot ziens? Niet te rap.
          </p>

          <p className="mt-3 max-w-xl mx-auto" style={{ color: "var(--ink)" }}>
            De eerste hints gaan naar de lijst. Schrijf u in, stem mee en mis de eerste drop niet.
          </p>

          {!subscribed ? (
            <form onSubmit={finalSubmit} className="mt-8 max-w-md mx-auto space-y-3 text-left">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="uw@email.be"
                className="w-full rounded-lg border-2 border-ink bg-white px-4 py-3 text-base outline-none focus:ring-4 focus:ring-[color:var(--bordeaux)]"
              />

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-[color:var(--bordeaux)]"
                />
                <span>Ja, stuur mij updates. Uitschrijven kan altijd.</span>
              </label>

              {error && (
                <p className="text-sm" style={{ color: "var(--bordeaux)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full font-display text-xl md:text-2xl py-4 rounded-xl border-2 border-ink shadow-chunky hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_var(--ink)] transition-all"
                style={{ backgroundColor: "var(--yellow)", color: "var(--ink)" }}
              >
                Laat mij niks missen
              </button>
            </form>
          ) : (
            <div
              className="mt-8 inline-block rounded-xl border-2 border-ink p-5 shadow-chunky"
              style={{ backgroundColor: "var(--cream)" }}
            >
              <p className="font-display text-2xl">Ge staat al op de lijst.</p>
              <p className="mt-1 text-sm">We sturen u de eerste hints.</p>
            </div>
          )}
        </div>
      </section>

      <footer
        className="px-4 py-8"
        style={{ backgroundColor: "var(--ink)", color: "var(--cream)" }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="underline hover:opacity-80">
              Privacy
            </a>
            <a href="#" className="underline hover:opacity-80">
              Contact
            </a>
          </div>

          <p className="text-xs opacity-70 max-w-xl mx-auto">
            Deze pagina verzamelt interesse voor een toekomstige merchdrop. Officiële lancering
            gebeurt pas wanneer alle rechten correct geregeld zijn.
          </p>

          <p className="font-display text-sm opacity-60">Drop 001 — Voor wie het nog weet.</p>
        </div>
      </footer>
    </main>
  );
}
