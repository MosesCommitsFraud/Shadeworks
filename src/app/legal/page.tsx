"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function ImpressumPage() {
    const [lang, setLang] = useState<"de" | "en">("de");

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold">
                            {lang === "de" ? "Impressum" : "Legal Notice"}
                        </h1>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLang(lang === "de" ? "en" : "de")}
                        >
                            {lang === "de" ? "English" : "Deutsch"}
                        </Button>
                    </div>

                    {lang === "de" ? <GermanContent /> : <EnglishContent />}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function GermanContent() {
    return (
        <>
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Angaben gemäß § 5 TMG
                </h2>
                <p className="text-muted-foreground">
                    Moritz Schäfer
                    <br />
                    Riedfeldstraße 82
                    <br />
                    68169 Mannheim
                    <br />
                    Deutschland
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
                <p className="text-muted-foreground">
                    E-Mail: zephyrclipsyt@gmail.com
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                </h2>
                <p className="text-muted-foreground">
                    Moritz Schäfer
                    <br />
                    Riedfeldstraße 82
                    <br />
                    68169 Mannheim
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    EU-Streitschlichtung
                </h2>
                <p className="text-muted-foreground">
                    Die Europäische Kommission stellt eine Plattform zur
                    Online-Streitbeilegung (OS) bereit:{" "}
                    <a
                        href="https://ec.europa.eu/consumers/odr/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://ec.europa.eu/consumers/odr/
                    </a>
                    <br />
                    Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Verbraucherstreitbeilegung / Universalschlichtungsstelle
                </h2>
                <p className="text-muted-foreground">
                    Wir sind nicht bereit oder verpflichtet, an
                    Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle teilzunehmen.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Haftung für Inhalte
                </h2>
                <p className="text-muted-foreground mb-4">
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
                    Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                    verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                    Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                    gespeicherte fremde Informationen zu überwachen oder nach
                    Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                    hinweisen.
                </p>
                <p className="text-muted-foreground">
                    Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                    Informationen nach den allgemeinen Gesetzen bleiben hiervon
                    unberührt. Eine diesbezügliche Haftung ist jedoch erst ab
                    dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
                    möglich. Bei Bekanntwerden von entsprechenden
                    Rechtsverletzungen werden wir diese Inhalte umgehend
                    entfernen.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Haftung für Links
                </h2>
                <p className="text-muted-foreground mb-4">
                    Unser Angebot enthält Links zu externen Websites Dritter,
                    auf deren Inhalte wir keinen Einfluss haben. Deshalb können
                    wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                    Für die Inhalte der verlinkten Seiten ist stets der
                    jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
                <p className="text-muted-foreground">
                    Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung
                    auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte
                    waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine
                    permanente inhaltliche Kontrolle der verlinkten Seiten ist
                    jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung
                    nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
                    werden wir derartige Links umgehend entfernen.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Urheberrecht</h2>
                <p className="text-muted-foreground mb-4">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke
                    auf diesen Seiten unterliegen dem deutschen Urheberrecht.
                    Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                    der Verwertung außerhalb der Grenzen des Urheberrechtes
                    bedürfen der schriftlichen Zustimmung des jeweiligen Autors
                    bzw. Erstellers. Downloads und Kopien dieser Seite sind nur
                    für den privaten, nicht kommerziellen Gebrauch gestattet.
                </p>
                <p className="text-muted-foreground">
                    Soweit die Inhalte auf dieser Seite nicht vom Betreiber
                    erstellt wurden, werden die Urheberrechte Dritter beachtet.
                    Insbesondere werden Inhalte Dritter als solche
                    gekennzeichnet. Sollten Sie trotzdem auf eine
                    Urheberrechtsverletzung aufmerksam werden, bitten wir um
                    einen entsprechenden Hinweis. Bei Bekanntwerden von
                    Rechtsverletzungen werden wir derartige Inhalte umgehend
                    entfernen.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Hosting</h2>
                <p className="text-muted-foreground">
                    Diese Website wird gehostet von:
                    <br />
                    <br />
                    Vercel Inc.
                    <br />
                    440 N Barranca Ave #4133
                    <br />
                    Covina, CA 91723
                    <br />
                    USA
                    <br />
                    <br />
                    Die Domain shadeworks.dev wird über Vercel Domains
                    registriert und verwaltet.
                </p>
            </section>
        </>
    );
}

function EnglishContent() {
    return (
        <>
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Information according to § 5 TMG (German Telemedia Act)
                </h2>
                <p className="text-muted-foreground">
                    Moritz Schäfer
                    <br />
                    Riedfeldstraße 82
                    <br />
                    68169 Mannheim
                    <br />
                    Germany
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Contact</h2>
                <p className="text-muted-foreground">
                    Email: zephyrclipsyt@gmail.com
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Responsible for content according to § 55 Abs. 2 RStV
                </h2>
                <p className="text-muted-foreground">
                    Moritz Schäfer
                    <br />
                    Riedfeldstraße 82
                    <br />
                    68169 Mannheim
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    EU Dispute Resolution
                </h2>
                <p className="text-muted-foreground">
                    The European Commission provides a platform for online
                    dispute resolution (OS):{" "}
                    <a
                        href="https://ec.europa.eu/consumers/odr/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://ec.europa.eu/consumers/odr/
                    </a>
                    <br />
                    You can find our email address in the legal notice above.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Consumer Dispute Resolution
                </h2>
                <p className="text-muted-foreground">
                    We are not willing or obliged to participate in dispute
                    resolution proceedings before a consumer arbitration board.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Liability for Content
                </h2>
                <p className="text-muted-foreground mb-4">
                    As a service provider, we are responsible for our own
                    content on these pages in accordance with general laws
                    pursuant to § 7 Abs.1 TMG. According to §§ 8 to 10 TMG,
                    however, we as a service provider are not obligated to
                    monitor transmitted or stored third-party information or to
                    investigate circumstances that indicate illegal activity.
                </p>
                <p className="text-muted-foreground">
                    Obligations to remove or block the use of information under
                    general law remain unaffected. However, liability in this
                    regard is only possible from the time of knowledge of a
                    specific infringement. Upon becoming aware of corresponding
                    infringements, we will remove this content immediately.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Liability for Links
                </h2>
                <p className="text-muted-foreground mb-4">
                    Our offer contains links to external websites of third
                    parties, on whose contents we have no influence. Therefore,
                    we cannot assume any liability for these external contents.
                    The respective provider or operator of the pages is always
                    responsible for the contents of the linked pages.
                </p>
                <p className="text-muted-foreground">
                    The linked pages were checked for possible legal violations
                    at the time of linking. Illegal contents were not
                    recognizable at the time of linking. However, a permanent
                    content control of the linked pages is not reasonable
                    without concrete evidence of an infringement. Upon becoming
                    aware of legal violations, we will remove such links
                    immediately.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Copyright</h2>
                <p className="text-muted-foreground mb-4">
                    The content and works created by the site operators on these
                    pages are subject to German copyright law. Duplication,
                    processing, distribution, and any kind of exploitation
                    outside the limits of copyright require the written consent
                    of the respective author or creator. Downloads and copies of
                    this site are only permitted for private, non-commercial
                    use.
                </p>
                <p className="text-muted-foreground">
                    Insofar as the content on this site was not created by the
                    operator, the copyrights of third parties are respected. In
                    particular, third-party content is marked as such. Should
                    you nevertheless become aware of a copyright infringement,
                    please inform us accordingly. Upon becoming aware of legal
                    violations, we will remove such content immediately.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Hosting</h2>
                <p className="text-muted-foreground">
                    This website is hosted by:
                    <br />
                    <br />
                    Vercel Inc.
                    <br />
                    440 N Barranca Ave #4133
                    <br />
                    Covina, CA 91723
                    <br />
                    USA
                    <br />
                    <br />
                    The domain shadeworks.dev is registered and managed through
                    Vercel Domains.
                </p>
            </section>
        </>
    );
}
