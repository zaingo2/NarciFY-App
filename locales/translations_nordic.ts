
import sv from './sv.json';
import no from './no.json';
import fi from './fi.json';

// Danish Translation (Generated)
const da = {
  "langName": "Dansk",
  "navigation": {
    "home": "Hjem",
    "audios": "Personlige 8D-lydfiler",
    "patternDetector": "Mønsterdetektor",
    "recommendations": "Automatiske Anbefalinger",
    "sos": "SOS Ro På",
    "status": "Status",
    "premium": "Premium",
    "freeUser": "Gratis Bruger",
    "upgrade": "Opgrader til Premium",
    "languageSelectorLabel": "Vælg Sprog",
    "manageSubscription": "Administrer Abonnement",
    "affiliateProgram": "Affiliate Program",
    "copyright": "Alle rettigheder forbeholdes.",
    "trialStatus": "Prøveperiode",
    "trialDaysLeft": "{count, plural, one {# dag tilbage} other {# dage tilbage}}"
  },
  "disclaimer": {
    "title": "Vigtig Ansvarsfraskrivelse",
    "text": "NarciFY er et AI-drevet værktøj kun til informationsformål og er ikke en erstatning for professionel psykologisk eller juridisk rådgivning. Hvis du er i umiddelbar fare, bedes du kontakte dine lokale alarmtjenester."
  },
  "analysisPanel": {
    "title": "Hjem",
    "description": "Beskriv en situation, samtale eller adfærd. Vores AI hjælper dig med at identificere potentiel manipulation og tilbyder vejledning.",
    "textInputTab": "Tekstinput",
    "audioInputTab": "Lydinput",
    "errorPrefix": "Fejl",
    "textPlaceholder": "F.eks. 'De fortalte mig, at jeg overreagerede, da jeg blev ked af det over, at de aflyste vores planer i sidste øjeblik igen...'",
    "analyzeTextButton": "Analyser Tekst",
    "audioDescription": "Optag dine tanker, en nylig samtale eller upload en lydfil.",
    "recordAudioButton": "Optag Lyd",
    "uploadFileButton": "Upload Fil",
    "stopRecordingButton": "Stop Optagelse",
    "fileReady": "Fil klar: \"{fileName}\"",
    "recordingComplete": "Optagelse fuldført!",
    "transcribeAndAnalyzeButton": "Transskriber & Analyser",
    "cancelButton": "Annuller",
    "analyzingMessage": "Analyserer, vent venligst... Dette kan tage et øjeblik for komplekse situationer.",
    "errors": {
      "emptySituation": "Beskriv venligst en situation.",
      "unknown": "Der opstod en ukendt fejl.",
      "micDenied": "Mikrofonadgang blev nægtet. Aktiver det venligst i dine browserindstillinger.",
      "noAudio": "Optag eller upload venligst lyd først.",
      "transcriptionFailed": "Lyd kunne ikke transskriberes eller var tom.",
      "fileTooLarge": "Filstørrelsen overstiger grænsen på 20 MB.",
      "invalidFileType": "Ugyldig filtype. Upload venligst en lydfil."
    }
  },
  "analysisResultDisplay": {
    "title": "Analyse Fuldført",
    "seekHelpTitle": "Anbefaling: Søg Professionel Hjælp",
    "seekHelpText": "Baseret på din beskrivelse ser denne situation ud til at være alvorlig. Vi anbefaler stærkt at søge støtte fra en kvalificeret terapeut eller rådgiver.",
    "readAloudButton": "Læs Højt",
    "tryAgainButton": "Prøv Igen",
    "generatingButton": "Genererer...",
    "generatingMessage": "Genererer lyd, vent venligst et øjeblik...",
    "playButton": "Afspil",
    "pauseButton": "Pause",
    "resumeButton": "Genoptag",
    "stopButton": "Stop",
    "downloadButton": "Download",
    "accordion": {
      "isManipulation": "Er Dette Manipulation?",
      "suggestedResponses": "Foreslåede Svar",
      "neutralizingTactics": "Neutraliseringstaktikker",
      "miniLesson": "Mini-Lektion: {title}"
    },
    "errors": {
      "ttsFailed": "Beklager, kunne ikke generere lyd på nuværende tidspunkt.",
      "downloadGenerateFirst": "Generer lyden først, før du downloader.",
      "downloadFailed": "Kunne ikke forberede lyd til download."
    }
  },
  "localHelp": {
    "title": "Find Lokal Støtte",
    "description": "Find terapeuter, juridisk hjælp og støttecentre i nærheden af dig. Din placering bruges kun til denne søgning og gemmes ikke.",
    "findHelpButton": "Find Hjælp Nær Mig",
    "viewOnMap": "Vis på kort",
    "initialMessage": "Klik på knappen for at søge efter lokale støttetjenester.",
    "errors": {
      "findFailed": "Beklager, der opstod en fejl ved søgning efter lokale hjælperessourcer.",
      "locationDenied": "Kunne ikke hente din placering. Aktiver venligst placeringstjenester i din browser."
    }
  },
  "chatWidget": {
    "initialMessage": "Hej! Spørg mig om alt vedrørende forhold, kommunikation eller grænsesætning.",
    "title": "Hurtig Chat",
    "placeholder": "Stil et spørgsmål...",
    "errorMessage": "Beklager, jeg stødte på en fejl. Prøv venligst igen.",
    "apiKeyError": "Chat er ikke tilgængelig. Miljøvariablen `{variableName}` er ikke konfigureret korrekt."
  },
  "patternDetector": {
    "title": "Mønsterdetektor",
    "description": "Opdag følelsesmæssige mønstre og kommunikationsadvarsler på tværs af dine tidligere analyser.",
    "noAnalysesTitle": "Ingen Analyser Endnu",
    "noAnalysesText": "Dine tidligere analyser vil blive vist her, når du begynder at analysere situationer.",
    "historyTitle": "Analysehistorik",
    "downloadAllButton": "Download Alle",
    "deleteAllButton": "Slet Alle",
    "downloadOneTooltip": "Download denne analyse",
    "deleteOneTooltip": "Slet denne analyse",
    "patternsTitle": "Gentagne Mønstre",
    "patternsCount": "{count, plural, one {# gang} other {# gange}}",
    "patternsInsight": "Du bliver mere opmærksom på dine grænser. Bliv ved med at observere disse mønstre og stol på dine instinkter.",
    "patternsEmpty": "Dine gentagne mønstre vil blive opsummeret her, efterhånden som du tilføjer flere analyser.",
    "confirmDeleteOne": "Er du sikker på, at du vil slette denne analyse permanent?",
    "confirmDeleteAll": "Er du sikker på, at du vil slette ALLE analyser permanent? Denne handling kan ikke fortrydes."
  },
  "personalizedAudios": {
    "title": "Personlige 8D-lydfiler",
    "description": "Opret en personlig 8D-meditation til din nuværende situation.",
    "howToTitle": "Sådan Bruger Du Denne Sektion",
    "howToStep1": "Personliggør: Indtast dit navn, så meditationen kan tale direkte til dig.",
    "howToStep2": "Sæt Stemningen: Vælg en baggrundslyd og tryk på dens afspilningsknap. Du kan justere lydstyrken uafhængigt. Hovedtelefoner anbefales kraftigt!",
    "howToStep3": "Vælg Dit Emne: Vælg en færdiglavet meditation fra rullelisten til almindelige behov.",
    "howToStep4": "Generer & Slap Af: Klik på 'Generer & Afspil Stemme'. AI'en vil oprette og starte din unikke 8D-lyd. Vær tålmodig, da dette kan tage et øjeblik.",
    "headphonesRecommended": "For den bedste oplevelse anbefaler vi stærkt at bruge hovedtelefoner.",
    "step1Label": "1. Indtast dit navn",
    "step1Placeholder": "Dette gør meditationen personlig for dig",
    "step2Label": "2. Vælg en baggrundslyd",
    "step3Label": "3. Vælg et meditationsemne",
    "generateAndPlayButton": "Generer & Afspil Stemme",
    "generatingVoiceButton": "Genererer Stemme...",
    "customTitle": "Eller, Opret en Tilpasset Meditation",
    "customDescription": "Hvis du har et specifikt behov, beskriv det her. Jo flere detaljer du giver, jo mere skræddersyet vil din meditation være.",
    "customExamplesTitle": "Eksempelprompter:",
    "customExample1": "\"En 5-minutters meditation til at berolige mine nerver før et svært telefonopkald.\"",
    "customExample2": "\"Hjælp mig med at give slip på følelser af nag over for et familiemedlem.\"",
    "customExample3": "\"En lyd til at hjælpe mig med at falde i søvn, når mine tanker myldrer.\"",
    "customRequestLabel": "Din tilpassede anmodning:",
    "customPlaceholder": "F.eks. 'Hjælp mig med at opbygge selvtillid før en svær samtale...'",
    "generateCustomButton": "Generer Tilpasset Meditation",
    "generatingMessage": "Genererer lyd, vent venligst et øjeblik... dette kan tage 1 til 2 minutter.",
    "errors": {
      "noName": "Indtast venligst dit navn.",
      "noCustomPrompt": "Beskriv venligst den meditation, du ønsker.",
      "generationFailed": "Kunne ikke generere lyd. Prøv venligst igen.",
      "downloadGenerateFirst": "Generer venligst lyden først."
    },
    "meditationOptions": {
      "anxiety": "Slip Angst & Find Indre Ro",
      "healing": "Heling af Tidligere Følelsesmæssige Sår",
      "confidence": "Aktivering af Selvtillid & Selvkærlighed",
      "cleanse": "Energirensning & Mental Nulstilling",
      "morning": "Morgen Empowerment Meditation"
    },
    "backgroundSounds": {
      "rain": "Regn",
      "forest": "Skovbæk",
      "ocean": "Havbølger",
      "birds": "Skovfugle"
    }
  },
  "sosCalmDown": {
    "title": "SOS Ro På",
    "description": "Øjeblikkelig lindring, når du føler dig overvældet. Fokuser på dit åndedræt og lad disse ord guide dig tilbage til centrum.",
    "initialAffirmation": "Fokuser på cirklen og træk vejret.",
    "enableBinaural": "Aktiver Binaural Tone",
    "binauralDescription": "Skaber en afslappende 432Hz brummen.",
    "binauralVolumeQuiet": "Stille",
    "binauralVolumeLoud": "Høj",
    "binauralHeadphones": "Hovedtelefoner er påkrævet for den binaurale effekt.",
    "startSessionButton": "Start Session",
    "tryAgainButton": "Prøv Igen",
    "generatingMessage": "Genererer din beroligende lyd, vent venligst...",
    "whyItWorksTitle": "Hvorfor det virker",
    "whyItWorksText": "Kontrolleret vejrtrækning beroliger dit nervesystem og reducerer \"kæmp-eller-flygt\"-responsen. Positive affirmationer hjælper med at afbryde cyklusser af ængstelige tanker, minder dig om din styrke og forankrer dig i nuet.",
    "error": "Kunne ikke starte beroligelsessessionen. Prøv venligst igen.",
    "breathing": {
      "in": "Indånd",
      "hold": "Hold",
      "out": "Udånd"
    }
  },
  "recommendations": {
    "title": "Automatiske Anbefalinger",
    "description": "Din personlige køreplan for heling og vækst, baseret på din historik.",
    "refreshButton": "Opdater Anbefalinger",
    "loading": "Analyserer dine mønstre og genererer personlige anbefalinger...",
    "error": "Beklager, vi kunne ikke generere personlige anbefalinger på nuværende tidspunkt. Prøv venligst igen senere.",
    "emptyTitle": "Dine Anbefalinger Vil Vises Her",
    "emptyText": "Når du analyserer situationer, vil denne sektion automatisk blive fyldt med personlige råd, færdighedsopbyggende øvelser og helingsstrategier baseret på dine unikke mønstre.",
    "genericError": "Kunne ikke generere anbefalinger baseret på den aktuelle historik."
  },
  "upgrade": {
    "modalTitle": "Opgrader til NarciFY Premium",
    "modalDescription": "Lås op for det fulde værktøjssæt til klarhed, heling og empowerment.",
    "feature1Title": "Mønsterdetektor",
    "feature2Title": "Personlige 8D-lydfiler",
    "feature3Title": "Automatiske Anbefalinger",
    "feature4Title": "Ubegrænset Lydanalyse",
    "monthly": "Månedlig",
    "quarterly": "Kvartalsvis",
    "lifetime": "Livstid",
    "monthlyPrice": "/ måned",
    "per3Months": "/ 3 måneder",
    "oneTime": "Engangsbetaling",
    "limitedOffer": "50% RABAT",
    "mostPopular": "Mest Populær",
    "bestValue": "Bedste Værdi",
    "upgradeButton": "Få Premium Adgang",
    "startTrialButton": "Prøv Gratis i 7 Dage",
    "securePayment": "Sikker Betaling",
    "cancelAnytime": "Annuller når som helst",
    "clickbankDisclaimer": "ClickBank er forhandler af produkter på dette websted. CLICKBANK® er et registreret varemærke tilhørende Click Sales, Inc., et Delaware-selskab beliggende på 1444 S. Entertainment Ave., Suite 410 Boise, ID 83709, USA og brugt med tilladelse. ClickBanks rolle som forhandler udgør ikke en godkendelse eller gennemgang af disse produkter eller nogen påstand, erklæring eller mening, der bruges i markedsføringen af disse produkter.",
    "teaserPatternDetectorTitle": "Lås Op for Mønsterdetektoren",
    "teaserPatternDetectorDesc": "Se det store billede. Mønsterdetektoren analyserer hele din historik for at afsløre gentagne manipulationstaktikker og følelsesmæssige tendenser, hvilket hjælper dig med at forstå langsigtede dynamikker og bryte fri fra skadelige cyklusser.",
    "teaserAudiosTitle": "Lås Op for Personlige 8D-lydfiler",
    "teaserAudiosDesc": "Oplev dyb heling med fordybende 8D-lydmeditationer skræddersyet lige til dig. Generer brugerdefinerede scripts til dine specifikke behov, fra at berolige angst til at opbygge selvtillid, og lad 8D-lydlandskabet guide dig til et sted med fred.",
    "teaserRecommendationsTitle": "Lås Op for Automatiske Anbefalinger",
    "teaserRecommendationsDesc": "Få en personlig køreplan til heling. Vores AI analyserer din historik for at give skræddersyede råd, færdighedsopbyggende øvelser og helingsstrategier designet til at imødegå de specifikke mønstre, du står overfor.",
    "simulatePayment": "Simuler Vellykket Betaling (Dev)"
  },
  "trialBanner": {
    "title": "Lås op for alle funktioner med en gratis 7-dages prøveperiode!",
    "description": "Oplev den fulde kraft af NarciFY Premium, herunder Mønsterdetektoren og Personlige Lydfiler. Intet kreditkort påkrævet.",
    "ctaButton": "Start Gratis Prøveperiode"
  }
};

export const nordicResources = {
  sv,
  no,
  fi,
  da
};
