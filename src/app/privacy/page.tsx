"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function DatenschutzPage() {
    const [lang, setLang] = useState<"de" | "en">("de");

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold">
                            {lang === "de"
                                ? "Datenschutzerklärung"
                                : "Privacy Policy"}
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
                    1. Datenschutz auf einen Blick
                </h2>

                <h3 className="text-lg font-medium mb-2">
                    Allgemeine Hinweise
                </h3>
                <p className="text-muted-foreground mb-4">
                    Die folgenden Hinweise geben einen einfachen Überblick
                    darüber, was mit Ihren personenbezogenen Daten passiert,
                    wenn Sie diese Website besuchen. Personenbezogene Daten sind
                    alle Daten, mit denen Sie persönlich identifiziert werden
                    können. Ausführliche Informationen zum Thema Datenschutz
                    entnehmen Sie unserer unter diesem Text aufgeführten
                    Datenschutzerklärung.
                </p>

                <h3 className="text-lg font-medium mb-2">
                    Datenerfassung auf dieser Website
                </h3>
                <p className="text-muted-foreground mb-4">
                    <strong>
                        Wer ist verantwortlich für die Datenerfassung auf dieser
                        Website?
                    </strong>
                    <br />
                    Die Datenverarbeitung auf dieser Website erfolgt durch den
                    Websitebetreiber. Dessen Kontaktdaten können Sie dem
                    Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser
                    Datenschutzerklärung entnehmen.
                </p>

                <p className="text-muted-foreground mb-4">
                    <strong>Wie erfassen wir Ihre Daten?</strong>
                    <br />
                    Ihre Daten werden zum einen dadurch erhoben, dass Sie uns
                    diese mitteilen. Hierbei kann es sich z.B. um Daten handeln,
                    die Sie in ein Kontaktformular eingeben. Andere Daten werden
                    automatisch oder nach Ihrer Einwilligung beim Besuch der
                    Website durch unsere IT-Systeme erfasst. Das sind vor allem
                    technische Daten (z.B. Internetbrowser, Betriebssystem oder
                    Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten
                    erfolgt automatisch, sobald Sie diese Website betreten.
                </p>

                <p className="text-muted-foreground mb-4">
                    <strong>Wofür nutzen wir Ihre Daten?</strong>
                    <br />
                    Ein Teil der Daten wird erhoben, um eine fehlerfreie
                    Bereitstellung der Website zu gewährleisten. Andere Daten
                    können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                </p>

                <p className="text-muted-foreground">
                    <strong>
                        Welche Rechte haben Sie bezüglich Ihrer Daten?
                    </strong>
                    <br />
                    Sie haben jederzeit das Recht, unentgeltlich Auskunft über
                    Herkunft, Empfänger und Zweck Ihrer gespeicherten
                    personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                    Recht, die Berichtigung oder Löschung dieser Daten zu
                    verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung
                    erteilt haben, können Sie diese Einwilligung jederzeit für
                    die Zukunft widerrufen. Außerdem haben Sie das Recht, unter
                    bestimmten Umständen die Einschränkung der Verarbeitung
                    Ihrer personenbezogenen Daten zu verlangen. Des Weiteren
                    steht Ihnen ein Beschwerderecht bei der zuständigen
                    Aufsichtsbehörde zu.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Hosting</h2>
                <p className="text-muted-foreground mb-4">
                    Wir hosten die Inhalte unserer Website bei folgendem
                    Anbieter:
                </p>

                <h3 className="text-lg font-medium mb-2">Vercel</h3>
                <p className="text-muted-foreground mb-4">
                    Anbieter ist die Vercel Inc., 440 N Barranca Ave #4133,
                    Covina, CA 91723, USA (nachfolgend „Vercel").
                </p>
                <p className="text-muted-foreground mb-4">
                    Wenn Sie unsere Website besuchen, erfasst Vercel
                    verschiedene Logdaten inklusive Ihrer IP-Adresse. Details
                    entnehmen Sie der Datenschutzerklärung von Vercel:{" "}
                    <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://vercel.com/legal/privacy-policy
                    </a>
                </p>
                <p className="text-muted-foreground">
                    Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6
                    Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an
                    einer möglichst zuverlässigen Darstellung unserer Website.
                    Sofern eine entsprechende Einwilligung abgefragt wurde,
                    erfolgt die Verarbeitung ausschließlich auf Grundlage von
                    Art. 6 Abs. 1 lit. a DSGVO; die Einwilligung ist jederzeit
                    widerrufbar.
                </p>
                <p className="text-muted-foreground mt-4">
                    Die Datenübertragung in die USA wird auf die
                    Standardvertragsklauseln der EU-Kommission gestützt. Details
                    finden Sie hier:{" "}
                    <a
                        href="https://vercel.com/legal/dpa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://vercel.com/legal/dpa
                    </a>
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    3. Allgemeine Hinweise und Pflichtinformationen
                </h2>

                <h3 className="text-lg font-medium mb-2">Datenschutz</h3>
                <p className="text-muted-foreground mb-4">
                    Die Betreiber dieser Seiten nehmen den Schutz Ihrer
                    persönlichen Daten sehr ernst. Wir behandeln Ihre
                    personenbezogenen Daten vertraulich und entsprechend den
                    gesetzlichen Datenschutzvorschriften sowie dieser
                    Datenschutzerklärung.
                </p>
                <p className="text-muted-foreground mb-4">
                    Wenn Sie diese Website benutzen, werden verschiedene
                    personenbezogene Daten erhoben. Personenbezogene Daten sind
                    Daten, mit denen Sie persönlich identifiziert werden können.
                    Die vorliegende Datenschutzerklärung erläutert, welche Daten
                    wir erheben und wofür wir sie nutzen. Sie erläutert auch,
                    wie und zu welchem Zweck das geschieht.
                </p>
                <p className="text-muted-foreground">
                    Wir weisen darauf hin, dass die Datenübertragung im Internet
                    (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken
                    aufweisen kann. Ein lückenloser Schutz der Daten vor dem
                    Zugriff durch Dritte ist nicht möglich.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Hinweis zur verantwortlichen Stelle
                </h3>
                <p className="text-muted-foreground mb-4">
                    Die verantwortliche Stelle für die Datenverarbeitung auf
                    dieser Website ist:
                </p>
                <p className="text-muted-foreground mb-4">
                    Moritz Schäfer
                    <br />
                    Riedfeldstraße 82
                    <br />
                    68169 Mannheim
                    <br />
                    Deutschland
                    <br />
                    <br />
                    E-Mail: zephyrclipsyt@gmail.com
                </p>
                <p className="text-muted-foreground">
                    Verantwortliche Stelle ist die natürliche oder juristische
                    Person, die allein oder gemeinsam mit anderen über die
                    Zwecke und Mittel der Verarbeitung von personenbezogenen
                    Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">Speicherdauer</h3>
                <p className="text-muted-foreground">
                    Soweit innerhalb dieser Datenschutzerklärung keine
                    speziellere Speicherdauer genannt wurde, verbleiben Ihre
                    personenbezogenen Daten bei uns, bis der Zweck für die
                    Datenverarbeitung entfällt. Wenn Sie ein berechtigtes
                    Löschersuchen geltend machen oder eine Einwilligung zur
                    Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
                    sofern wir keine anderen rechtlich zulässigen Gründe für die
                    Speicherung Ihrer personenbezogenen Daten haben (z.B.
                    steuer- oder handelsrechtliche Aufbewahrungsfristen); im
                    letztgenannten Fall erfolgt die Löschung nach Fortfall
                    dieser Gründe.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Allgemeine Hinweise zu den Rechtsgrundlagen der
                    Datenverarbeitung auf dieser Website
                </h3>
                <p className="text-muted-foreground">
                    Sofern Sie in die Datenverarbeitung eingewilligt haben,
                    verarbeiten wir Ihre personenbezogenen Daten auf Grundlage
                    von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a
                    DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1
                    DSGVO verarbeitet werden. Im Falle einer ausdrücklichen
                    Einwilligung in die Übertragung personenbezogener Daten in
                    Drittstaaten erfolgt die Datenverarbeitung außerdem auf
                    Grundlage von Art. 49 Abs. 1 lit. a DSGVO. Sofern Sie in die
                    Speicherung von Cookies oder in den Zugriff auf
                    Informationen in Ihr Endgerät (z.B. via
                    Device-Fingerprinting) eingewilligt haben, erfolgt die
                    Datenverarbeitung zusätzlich auf Grundlage von § 25 Abs. 1
                    TTDSG. Die Einwilligung ist jederzeit widerrufbar.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Widerruf Ihrer Einwilligung zur Datenverarbeitung
                </h3>
                <p className="text-muted-foreground">
                    Viele Datenverarbeitungsvorgänge sind nur mit Ihrer
                    ausdrücklichen Einwilligung möglich. Sie können eine bereits
                    erteilte Einwilligung jederzeit widerrufen. Die
                    Rechtmäßigkeit der bis zum Widerruf erfolgten
                    Datenverarbeitung bleibt vom Widerruf unberührt.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Widerspruchsrecht gegen die Datenerhebung in besonderen
                    Fällen sowie gegen Direktwerbung (Art. 21 DSGVO)
                </h3>
                <p className="text-muted-foreground">
                    WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1
                    LIT. E ODER F DSGVO ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT,
                    AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN SITUATION
                    ERGEBEN, GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN
                    DATEN WIDERSPRUCH EINZULEGEN; DIES GILT AUCH FÜR EIN AUF
                    DIESE BESTIMMUNGEN GESTÜTZTES PROFILING. DIE JEWEILIGE
                    RECHTSGRUNDLAGE, AUF DENEN EINE VERARBEITUNG BERUHT,
                    ENTNEHMEN SIE DIESER DATENSCHUTZERKLÄRUNG. WENN SIE
                    WIDERSPRUCH EINLEGEN, WERDEN WIR IHRE BETROFFENEN
                    PERSONENBEZOGENEN DATEN NICHT MEHR VERARBEITEN, ES SEI DENN,
                    WIR KÖNNEN ZWINGENDE SCHUTZWÜRDIGE GRÜNDE FÜR DIE
                    VERARBEITUNG NACHWEISEN, DIE IHRE INTERESSEN, RECHTE UND
                    FREIHEITEN ÜBERWIEGEN ODER DIE VERARBEITUNG DIENT DER
                    GELTENDMACHUNG, AUSÜBUNG ODER VERTEIDIGUNG VON
                    RECHTSANSPRÜCHEN (WIDERSPRUCH NACH ART. 21 ABS. 1 DSGVO).
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Beschwerderecht bei der zuständigen Aufsichtsbehörde
                </h3>
                <p className="text-muted-foreground">
                    Im Falle von Verstößen gegen die DSGVO steht den Betroffenen
                    ein Beschwerderecht bei einer Aufsichtsbehörde, insbesondere
                    in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres
                    Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu.
                    Das Beschwerderecht besteht unbeschadet anderweitiger
                    verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Recht auf Datenübertragbarkeit
                </h3>
                <p className="text-muted-foreground">
                    Sie haben das Recht, Daten, die wir auf Grundlage Ihrer
                    Einwilligung oder in Erfüllung eines Vertrags automatisiert
                    verarbeiten, an sich oder an einen Dritten in einem
                    gängigen, maschinenlesbaren Format aushändigen zu lassen.
                    Sofern Sie die direkte Übertragung der Daten an einen
                    anderen Verantwortlichen verlangen, erfolgt dies nur, soweit
                    es technisch machbar ist.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Auskunft, Berichtigung und Löschung
                </h3>
                <p className="text-muted-foreground">
                    Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen
                    jederzeit das Recht auf unentgeltliche Auskunft über Ihre
                    gespeicherten personenbezogenen Daten, deren Herkunft und
                    Empfänger und den Zweck der Datenverarbeitung und ggf. ein
                    Recht auf Berichtigung oder Löschung dieser Daten. Hierzu
                    sowie zu weiteren Fragen zum Thema personenbezogene Daten
                    können Sie sich jederzeit an uns wenden.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Recht auf Einschränkung der Verarbeitung
                </h3>
                <p className="text-muted-foreground">
                    Sie haben das Recht, die Einschränkung der Verarbeitung
                    Ihrer personenbezogenen Daten zu verlangen. Hierzu können
                    Sie sich jederzeit an uns wenden.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    SSL- bzw. TLS-Verschlüsselung
                </h3>
                <p className="text-muted-foreground">
                    Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der
                    Übertragung vertraulicher Inhalte, wie zum Beispiel
                    Bestellungen oder Anfragen, die Sie an uns als
                    Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung.
                    Eine verschlüsselte Verbindung erkennen Sie daran, dass die
                    Adresszeile des Browsers von „http://" auf „https://"
                    wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                </p>
                <p className="text-muted-foreground mt-2">
                    Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können
                    die Daten, die Sie an uns übermitteln, nicht von Dritten
                    mitgelesen werden.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    4. Datenerfassung auf dieser Website
                </h2>

                <h3 className="text-lg font-medium mb-2">Cookies</h3>
                <p className="text-muted-foreground mb-4">
                    Unsere Internetseiten verwenden so genannte „Cookies".
                    Cookies sind kleine Datenpakete und richten auf Ihrem
                    Endgerät keinen Schaden an. Sie werden entweder
                    vorübergehend für die Dauer einer Sitzung (Session-Cookies)
                    oder dauerhaft (permanente Cookies) auf Ihrem Endgerät
                    gespeichert. Session-Cookies werden nach Ende Ihres Besuchs
                    automatisch gelöscht. Permanente Cookies bleiben auf Ihrem
                    Endgerät gespeichert, bis Sie diese selbst löschen oder eine
                    automatische Löschung durch Ihren Webbrowser erfolgt.
                </p>
                <p className="text-muted-foreground mb-4">
                    Cookies können von uns (First-Party-Cookies) oder von
                    Drittunternehmen stammen (sog. Third-Party-Cookies).
                    Third-Party-Cookies ermöglichen die Einbindung bestimmter
                    Dienstleistungen von Drittunternehmen innerhalb von
                    Webseiten (z.B. Cookies zur Abwicklung von
                    Zahlungsdienstleistungen).
                </p>
                <p className="text-muted-foreground mb-4">
                    Cookies haben verschiedene Funktionen. Zahlreiche Cookies
                    sind technisch notwendig, da bestimmte Webseitenfunktionen
                    ohne diese nicht funktionieren würden (z.B. die
                    Warenkorbfunktion oder die Anzeige von Videos). Andere
                    Cookies können zur Auswertung des Nutzerverhaltens oder zu
                    Werbezwecken verwendet werden.
                </p>
                <p className="text-muted-foreground mb-4">
                    Cookies, die zur Durchführung des elektronischen
                    Kommunikationsvorgangs, zur Bereitstellung bestimmter, von
                    Ihnen erwünschter Funktionen (z.B. für die
                    Warenkorbfunktion) oder zur Optimierung der Website (z.B.
                    Cookies zur Messung des Webpublikums) erforderlich sind
                    (notwendige Cookies), werden auf Grundlage von Art. 6 Abs. 1
                    lit. f DSGVO gespeichert, sofern keine andere
                    Rechtsgrundlage angegeben wird. Der Websitebetreiber hat ein
                    berechtigtes Interesse an der Speicherung von notwendigen
                    Cookies zur technisch fehlerfreien und optimierten
                    Bereitstellung seiner Dienste. Sofern eine Einwilligung zur
                    Speicherung von Cookies und vergleichbaren
                    Wiedererkennungstechnologien abgefragt wurde, erfolgt die
                    Verarbeitung ausschließlich auf Grundlage dieser
                    Einwilligung (Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1
                    TTDSG); die Einwilligung ist jederzeit widerrufbar.
                </p>
                <p className="text-muted-foreground">
                    Sie können Ihren Browser so einstellen, dass Sie über das
                    Setzen von Cookies informiert werden und Cookies nur im
                    Einzelfall erlauben, die Annahme von Cookies für bestimmte
                    Fälle oder generell ausschließen sowie das automatische
                    Löschen der Cookies beim Schließen des Browsers aktivieren.
                    Bei der Deaktivierung von Cookies kann die Funktionalität
                    dieser Website eingeschränkt sein.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Server-Log-Dateien
                </h3>
                <p className="text-muted-foreground mb-4">
                    Der Provider der Seiten erhebt und speichert automatisch
                    Informationen in so genannten Server-Log-Dateien, die Ihr
                    Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 ml-4">
                    <li>Browsertyp und Browserversion</li>
                    <li>verwendetes Betriebssystem</li>
                    <li>Referrer URL</li>
                    <li>Hostname des zugreifenden Rechners</li>
                    <li>Uhrzeit der Serveranfrage</li>
                    <li>IP-Adresse</li>
                </ul>
                <p className="text-muted-foreground">
                    Eine Zusammenführung dieser Daten mit anderen Datenquellen
                    wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt
                    auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der
                    Websitebetreiber hat ein berechtigtes Interesse an der
                    technisch fehlerfreien Darstellung und der Optimierung
                    seiner Website – hierzu müssen die Server-Log-Files erfasst
                    werden.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Lokale Speicherung (Local Storage)
                </h3>
                <p className="text-muted-foreground">
                    Diese Website verwendet die lokale Speicherung (Local
                    Storage) Ihres Browsers, um Benutzereinstellungen wie z.B.
                    das gewählte Farbschema (Dark/Light Mode) zu speichern.
                    Diese Daten werden ausschließlich lokal auf Ihrem Gerät
                    gespeichert und nicht an unsere Server übertragen. Die
                    Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. f DSGVO
                    (berechtigtes Interesse an einer benutzerfreundlichen
                    Website).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    5. Analyse-Tools und Werbung
                </h2>

                <h3 className="text-lg font-medium mb-2">Vercel Analytics</h3>
                <p className="text-muted-foreground mb-4">
                    Diese Website nutzt Vercel Analytics, einen Webanalysedienst
                    der Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
                    USA. Vercel Analytics erfasst anonymisierte Daten über die
                    Nutzung dieser Website, um uns bei der Verbesserung unseres
                    Angebots zu unterstützen.
                </p>
                <p className="text-muted-foreground mb-4">
                    Vercel Analytics erfasst folgende Daten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 ml-4">
                    <li>Seitenaufrufe</li>
                    <li>Besuchsdauer</li>
                    <li>Geografischer Standort (Land/Region)</li>
                    <li>Gerätetyp und Browser</li>
                    <li>Referrer</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                    Vercel Analytics verwendet keine Cookies und speichert keine
                    persönlichen Daten. Die IP-Adresse wird anonymisiert und
                    nicht gespeichert. Weitere Informationen finden Sie in der
                    Datenschutzerklärung von Vercel:{" "}
                    <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://vercel.com/legal/privacy-policy
                    </a>
                </p>
                <p className="text-muted-foreground">
                    Die Nutzung von Vercel Analytics erfolgt auf Grundlage von
                    Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes
                    Interesse an der Analyse des Nutzerverhaltens, um unser
                    Webangebot zu optimieren. Die Datenübertragung in die USA
                    wird auf die Standardvertragsklauseln der EU-Kommission
                    gestützt.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">
                    6. Aktualität und Änderung dieser Datenschutzerklärung
                </h2>
                <p className="text-muted-foreground">
                    Diese Datenschutzerklärung ist aktuell gültig und hat den
                    Stand Dezember 2024. Aufgrund der Weiterentwicklung unserer
                    Website und Angebote darüber oder aufgrund geänderter
                    gesetzlicher beziehungsweise behördlicher Vorgaben kann es
                    notwendig werden, diese Datenschutzerklärung zu ändern. Die
                    jeweils aktuelle Datenschutzerklärung kann jederzeit auf der
                    Website unter{" "}
                    <a
                        href="/privacy"
                        className="text-foreground hover:underline"
                    >
                        https://shadeworks.dev/privacy
                    </a>{" "}
                    von Ihnen abgerufen und ausgedruckt werden.
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
                    1. Privacy at a Glance
                </h2>

                <h3 className="text-lg font-medium mb-2">
                    General Information
                </h3>
                <p className="text-muted-foreground mb-4">
                    The following notes provide a simple overview of what
                    happens to your personal data when you visit this website.
                    Personal data is any data that can be used to personally
                    identify you. For detailed information on data protection,
                    please refer to our privacy policy listed below this text.
                </p>

                <h3 className="text-lg font-medium mb-2">
                    Data Collection on This Website
                </h3>
                <p className="text-muted-foreground mb-4">
                    <strong>
                        Who is responsible for data collection on this website?
                    </strong>
                    <br />
                    Data processing on this website is carried out by the
                    website operator. You can find their contact details in the
                    section "Notice on the Responsible Party" in this privacy
                    policy.
                </p>

                <p className="text-muted-foreground mb-4">
                    <strong>How do we collect your data?</strong>
                    <br />
                    Your data is collected in part by you providing it to us.
                    This may include data you enter into a contact form, for
                    example. Other data is collected automatically or with your
                    consent by our IT systems when you visit the website. This
                    is primarily technical data (e.g., internet browser,
                    operating system, or time of page access). This data is
                    collected automatically as soon as you enter this website.
                </p>

                <p className="text-muted-foreground mb-4">
                    <strong>What do we use your data for?</strong>
                    <br />
                    Some of the data is collected to ensure error-free provision
                    of the website. Other data may be used to analyze your user
                    behavior.
                </p>

                <p className="text-muted-foreground">
                    <strong>
                        What rights do you have regarding your data?
                    </strong>
                    <br />
                    You have the right to receive information about the origin,
                    recipient, and purpose of your stored personal data free of
                    charge at any time. You also have the right to request the
                    correction or deletion of this data. If you have given
                    consent to data processing, you can revoke this consent at
                    any time for the future. You also have the right to request
                    the restriction of the processing of your personal data
                    under certain circumstances. Furthermore, you have the right
                    to lodge a complaint with the competent supervisory
                    authority.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Hosting</h2>
                <p className="text-muted-foreground mb-4">
                    We host the content of our website with the following
                    provider:
                </p>

                <h3 className="text-lg font-medium mb-2">Vercel</h3>
                <p className="text-muted-foreground mb-4">
                    The provider is Vercel Inc., 440 N Barranca Ave #4133,
                    Covina, CA 91723, USA (hereinafter "Vercel").
                </p>
                <p className="text-muted-foreground mb-4">
                    When you visit our website, Vercel collects various log data
                    including your IP address. For details, please refer to
                    Vercel&apos;s privacy policy:{" "}
                    <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://vercel.com/legal/privacy-policy
                    </a>
                </p>
                <p className="text-muted-foreground">
                    The use of Vercel is based on Art. 6 para. 1 lit. f GDPR. We
                    have a legitimate interest in presenting our website as
                    reliably as possible. If consent has been requested,
                    processing is carried out exclusively on the basis of Art. 6
                    para. 1 lit. a GDPR; consent can be revoked at any time.
                </p>
                <p className="text-muted-foreground mt-4">
                    Data transfer to the USA is based on the EU
                    Commission&apos;s Standard Contractual Clauses. Details can
                    be found here:{" "}
                    <a
                        href="https://vercel.com/legal/dpa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://vercel.com/legal/dpa
                    </a>
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    3. General Information and Mandatory Information
                </h2>

                <h3 className="text-lg font-medium mb-2">Data Protection</h3>
                <p className="text-muted-foreground mb-4">
                    The operators of these pages take the protection of your
                    personal data very seriously. We treat your personal data
                    confidentially and in accordance with statutory data
                    protection regulations and this privacy policy.
                </p>
                <p className="text-muted-foreground mb-4">
                    When you use this website, various personal data is
                    collected. Personal data is data that can be used to
                    personally identify you. This privacy policy explains what
                    data we collect and what we use it for. It also explains how
                    and for what purpose this is done.
                </p>
                <p className="text-muted-foreground">
                    We point out that data transmission over the Internet (e.g.,
                    when communicating by email) may have security gaps.
                    Complete protection of data against access by third parties
                    is not possible.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Notice on the Responsible Party
                </h3>
                <p className="text-muted-foreground mb-4">
                    The responsible party for data processing on this website
                    is:
                </p>
                <p className="text-muted-foreground mb-4">
                    Moritz Schäfer
                    <br />
                    Riedfeldstraße 82
                    <br />
                    68169 Mannheim
                    <br />
                    Germany
                    <br />
                    <br />
                    Email: zephyrclipsyt@gmail.com
                </p>
                <p className="text-muted-foreground">
                    The responsible party is the natural or legal person who
                    alone or jointly with others decides on the purposes and
                    means of processing personal data (e.g., names, email
                    addresses, etc.).
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Storage Duration
                </h3>
                <p className="text-muted-foreground">
                    Unless a more specific storage period has been stated within
                    this privacy policy, your personal data will remain with us
                    until the purpose for data processing no longer applies. If
                    you assert a legitimate request for deletion or revoke
                    consent for data processing, your data will be deleted
                    unless we have other legally permissible reasons for storing
                    your personal data (e.g., tax or commercial law retention
                    periods); in the latter case, deletion will occur after
                    these reasons no longer apply.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    General Information on Legal Bases for Data Processing on
                    This Website
                </h3>
                <p className="text-muted-foreground">
                    If you have consented to data processing, we process your
                    personal data on the basis of Art. 6 para. 1 lit. a GDPR or
                    Art. 9 para. 2 lit. a GDPR if special categories of data are
                    processed according to Art. 9 para. 1 GDPR. In the case of
                    explicit consent to the transfer of personal data to third
                    countries, data processing is also carried out on the basis
                    of Art. 49 para. 1 lit. a GDPR. If you have consented to the
                    storage of cookies or access to information on your device
                    (e.g., via device fingerprinting), data processing is
                    additionally carried out on the basis of § 25 para. 1 TTDSG.
                    Consent can be revoked at any time.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Revocation of Your Consent to Data Processing
                </h3>
                <p className="text-muted-foreground">
                    Many data processing operations are only possible with your
                    express consent. You can revoke consent you have already
                    given at any time. The legality of the data processing
                    carried out until the revocation remains unaffected by the
                    revocation.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Right to Object to Data Collection in Special Cases and
                    Direct Marketing (Art. 21 GDPR)
                </h3>
                <p className="text-muted-foreground">
                    IF DATA PROCESSING IS BASED ON ART. 6 PARA. 1 LIT. E OR F
                    GDPR, YOU HAVE THE RIGHT TO OBJECT TO THE PROCESSING OF YOUR
                    PERSONAL DATA AT ANY TIME FOR REASONS ARISING FROM YOUR
                    PARTICULAR SITUATION; THIS ALSO APPLIES TO PROFILING BASED
                    ON THESE PROVISIONS. THE RESPECTIVE LEGAL BASIS ON WHICH
                    PROCESSING IS BASED CAN BE FOUND IN THIS PRIVACY POLICY. IF
                    YOU OBJECT, WE WILL NO LONGER PROCESS YOUR AFFECTED PERSONAL
                    DATA UNLESS WE CAN DEMONSTRATE COMPELLING LEGITIMATE GROUNDS
                    FOR THE PROCESSING THAT OVERRIDE YOUR INTERESTS, RIGHTS AND
                    FREEDOMS, OR THE PROCESSING SERVES TO ASSERT, EXERCISE OR
                    DEFEND LEGAL CLAIMS (OBJECTION PURSUANT TO ART. 21 PARA. 1
                    GDPR).
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Right to Lodge a Complaint with the Competent Supervisory
                    Authority
                </h3>
                <p className="text-muted-foreground">
                    In the event of violations of the GDPR, data subjects have
                    the right to lodge a complaint with a supervisory authority,
                    particularly in the Member State of their habitual
                    residence, their place of work, or the place of the alleged
                    violation. The right to lodge a complaint exists without
                    prejudice to other administrative or judicial remedies.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Right to Data Portability
                </h3>
                <p className="text-muted-foreground">
                    You have the right to have data that we process
                    automatically on the basis of your consent or in fulfillment
                    of a contract handed over to you or to a third party in a
                    common, machine-readable format. If you request the direct
                    transfer of the data to another controller, this will only
                    be done to the extent that it is technically feasible.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Information, Correction and Deletion
                </h3>
                <p className="text-muted-foreground">
                    Within the framework of the applicable legal provisions, you
                    have the right at any time to free information about your
                    stored personal data, its origin and recipient, and the
                    purpose of data processing and, if applicable, a right to
                    correction or deletion of this data. For this purpose, as
                    well as for further questions on the subject of personal
                    data, you can contact us at any time.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Right to Restriction of Processing
                </h3>
                <p className="text-muted-foreground">
                    You have the right to request the restriction of the
                    processing of your personal data. You can contact us at any
                    time for this purpose.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    SSL/TLS Encryption
                </h3>
                <p className="text-muted-foreground">
                    This site uses SSL or TLS encryption for security reasons
                    and to protect the transmission of confidential content,
                    such as orders or inquiries that you send to us as the site
                    operator. You can recognize an encrypted connection by the
                    fact that the address line of the browser changes from
                    "http://" to "https://" and by the lock symbol in your
                    browser line.
                </p>
                <p className="text-muted-foreground mt-2">
                    When SSL or TLS encryption is activated, the data you
                    transmit to us cannot be read by third parties.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    4. Data Collection on This Website
                </h2>

                <h3 className="text-lg font-medium mb-2">Cookies</h3>
                <p className="text-muted-foreground mb-4">
                    Our websites use so-called "cookies". Cookies are small data
                    packets and do not cause any damage to your device. They are
                    either stored temporarily for the duration of a session
                    (session cookies) or permanently (permanent cookies) on your
                    device. Session cookies are automatically deleted after your
                    visit ends. Permanent cookies remain stored on your device
                    until you delete them yourself or they are automatically
                    deleted by your web browser.
                </p>
                <p className="text-muted-foreground mb-4">
                    Cookies can come from us (first-party cookies) or from
                    third-party companies (so-called third-party cookies).
                    Third-party cookies enable the integration of certain
                    services from third-party companies within websites (e.g.,
                    cookies for processing payment services).
                </p>
                <p className="text-muted-foreground mb-4">
                    Cookies have various functions. Many cookies are technically
                    necessary, as certain website functions would not work
                    without them (e.g., the shopping cart function or the
                    display of videos). Other cookies can be used to analyze
                    user behavior or for advertising purposes.
                </p>
                <p className="text-muted-foreground mb-4">
                    Cookies that are required to carry out the electronic
                    communication process, to provide certain functions you have
                    requested (e.g., for the shopping cart function), or to
                    optimize the website (e.g., cookies to measure web audience)
                    (necessary cookies) are stored on the basis of Art. 6 para.
                    1 lit. f GDPR, unless another legal basis is specified. The
                    website operator has a legitimate interest in storing
                    necessary cookies for the technically error-free and
                    optimized provision of its services. If consent to the
                    storage of cookies and comparable recognition technologies
                    has been requested, processing is carried out exclusively on
                    the basis of this consent (Art. 6 para. 1 lit. a GDPR and §
                    25 para. 1 TTDSG); consent can be revoked at any time.
                </p>
                <p className="text-muted-foreground">
                    You can set your browser so that you are informed about the
                    setting of cookies and only allow cookies in individual
                    cases, exclude the acceptance of cookies for certain cases
                    or in general, and activate the automatic deletion of
                    cookies when closing the browser. If cookies are
                    deactivated, the functionality of this website may be
                    limited.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">
                    Server Log Files
                </h3>
                <p className="text-muted-foreground mb-4">
                    The provider of the pages automatically collects and stores
                    information in so-called server log files, which your
                    browser automatically transmits to us. These are:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 ml-4">
                    <li>Browser type and version</li>
                    <li>Operating system used</li>
                    <li>Referrer URL</li>
                    <li>Host name of the accessing computer</li>
                    <li>Time of the server request</li>
                    <li>IP address</li>
                </ul>
                <p className="text-muted-foreground">
                    This data is not merged with other data sources. The
                    collection of this data is based on Art. 6 para. 1 lit. f
                    GDPR. The website operator has a legitimate interest in the
                    technically error-free presentation and optimization of its
                    website - for this purpose, server log files must be
                    collected.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-6">Local Storage</h3>
                <p className="text-muted-foreground">
                    This website uses your browser&apos;s local storage to save
                    user settings such as the selected color scheme (dark/light
                    mode). This data is stored exclusively locally on your
                    device and is not transmitted to our servers. The legal
                    basis for this is Art. 6 para. 1 lit. f GDPR (legitimate
                    interest in a user-friendly website).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    5. Analytics Tools and Advertising
                </h2>

                <h3 className="text-lg font-medium mb-2">Vercel Analytics</h3>
                <p className="text-muted-foreground mb-4">
                    This website uses Vercel Analytics, a web analytics service
                    provided by Vercel Inc., 440 N Barranca Ave #4133, Covina,
                    CA 91723, USA. Vercel Analytics collects anonymized data
                    about the use of this website to help us improve our
                    offering.
                </p>
                <p className="text-muted-foreground mb-4">
                    Vercel Analytics collects the following data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 ml-4">
                    <li>Page views</li>
                    <li>Visit duration</li>
                    <li>Geographic location (country/region)</li>
                    <li>Device type and browser</li>
                    <li>Referrer</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                    Vercel Analytics does not use cookies and does not store
                    personal data. The IP address is anonymized and not stored.
                    For more information, please see Vercel&apos;s privacy
                    policy:{" "}
                    <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                    >
                        https://vercel.com/legal/privacy-policy
                    </a>
                </p>
                <p className="text-muted-foreground">
                    The use of Vercel Analytics is based on Art. 6 para. 1 lit.
                    f GDPR. We have a legitimate interest in analyzing user
                    behavior to optimize our web offering. Data transfer to the
                    USA is based on the EU Commission&apos;s Standard
                    Contractual Clauses.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">
                    6. Currency and Changes to This Privacy Policy
                </h2>
                <p className="text-muted-foreground">
                    This privacy policy is currently valid and was last updated
                    in December 2024. Due to the further development of our
                    website and offers or due to changed legal or regulatory
                    requirements, it may become necessary to change this privacy
                    policy. The current privacy policy can be viewed and printed
                    at any time on the website at{" "}
                    <a
                        href="/privacy"
                        className="text-foreground hover:underline"
                    >
                        https://shadeworks.dev/privacy
                    </a>
                </p>
            </section>
        </>
    );
}
