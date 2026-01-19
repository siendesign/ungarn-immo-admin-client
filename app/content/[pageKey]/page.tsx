"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Languages,
  AlertCircle,
} from "lucide-react";
import {
  useGetPageConfigByKeyQuery,
  useGetPageContentQuery,
  useBulkUpdatePageContentMutation,
} from "@/state/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { PageSection } from "@/types/index.t";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "hu", label: "Magyar", flag: "🇭🇺" },
];

// Static translations from web/messages/*.json for auto-fill
// Only AboutPage as requested
const STATIC_TRANSLATIONS: Record<string, Record<string, Record<string, string>>> = {
  AboutPage: {
    en: {
      title: "About Us",
      OurStory_subtitle: "Our Vision",
      OurStory_title: "Transparency Meets Community",
      OurStory_p1_part1: "We aren't just another real estate portal;",
      OurStory_p1_bold: "we are your neighbors in Hungary",
      OurStory_p1_part2: "Many of you already know us through",
      OurStory_p1_part3: "where we've built a reputation for providing honest and reliable information to the expat community.",
      OurStory_p2: "Ungarn-Immo was born out of a shared frustration: the traditional real estate market in Hungary often lacks the transparency that international buyers desperately need. We've seen too many \"polished\" photos that hide serious defects and too many buyers left alone with complex legal processes.",
      OurStory_stat1_value: "1%",
      OurStory_stat1_label: "Total Fair-Share Donation",
      OurStory_stat2_value: "100%",
      OurStory_stat2_label: "Unedited Video Tours",
      OurStory_stat3_label: "AI Translation",
      HowWeWork_subtitle: "How We Work",
      HowWeWork_title: "How We Are Different",
      FairShare_title: "Fair-Share Principle",
      FairShare_p1: "We decided to flip the script. Instead of high brokerage commissions that often reach 3-5% plus VAT, we operate on a Fair-Share Principle.",
      FairShare_p2: "We do not charge traditional commissions. Instead, both the buyer and seller contribute a 0.5% donation (1% total), but covered by a maximum, to a local Hungarian social project. This ensures that every transaction leaves a positive footprint in your new home.",
      RadicalHonesty_title: "Radical Honesty as a Standard",
      RadicalHonesty_p1: "We believe that a new life in a new country must start with the truth. That's why we require every seller to provide unedited video tours of the house and the surrounding village.",
      RadicalHonesty_p2: "Our platform uses AI to translate communication in real-time, bridging the gap between local sellers and international buyers. We don't just sell houses; we provide the context of the village—the social structure, the infrastructure, and the feeling of the community.",
      SeeAllProperties_btn: "See All Properties",
      OurSupport_subtitle: "Our Support",
      OurSupport_title: "A Technical Companion for Your Move",
      TechMeetsHuman_title: "Technology Meets Human Experience",
      TechMeetsHuman_p1: "By combining human experience with advanced technology, we ensure your move is safe. From AI-driven document preparation to a vetted network of partners, we are here to support you every step of the way.",
      TechMeetsHuman_p2: "We are the \"helpful team from next door,\" using modern tools to bring people together fairly.",
      UneditedTours_title: "Unedited Video Tours",
      UneditedTours_description: "Every property includes authentic video tours showing the house and surrounding village exactly as they are.",
      AITranslation_title: "Real-Time AI Translation",
      AITranslation_description: "Our platform breaks down language barriers, connecting international buyers with local sellers seamlessly.",
      VillageContext_title: "Complete Village Context",
      VillageContext_description: "We provide insights into the social structure, infrastructure, and community feeling of each location.",
      ContactUs_btn: "Contact Us",
    },
    de: {
      title: "Über uns",
      OurStory_subtitle: "Unsere Vision",
      OurStory_title: "Transparenz trifft Gemeinschaft",
      OurStory_p1_part1: "Wir sind nicht nur ein weiteres Immobilienportal;",
      OurStory_p1_bold: "wir sind Ihre Nachbarn in Ungarn",
      OurStory_p1_part2: "Viele von Ihnen kennen uns bereits durch",
      OurStory_p1_part3: "wo wir uns einen Ruf dafür aufgebaut haben, der Expat-Community ehrliche und zuverlässige Informationen zu bieten.",
      OurStory_p2: "Ungarn-Immo entstand aus einer gemeinsamen Frustration: Dem traditionellen Immobilienmarkt in Ungarn fehlt oft die Transparenz, die internationale Käufer dringend benötigen. Wir haben zu viele \"polierte\" Fotos gesehen, die ernsthafte Mängel verbergen, und zu viele Käufer, die mit komplexen rechtlichen Prozessen allein gelassen wurden.",
      OurStory_stat1_value: "1%",
      OurStory_stat1_label: "Gesamte Fair-Share-Spende",
      OurStory_stat2_value: "100%",
      OurStory_stat2_label: "Unbearbeitete Video-Touren",
      OurStory_stat3_label: "KI-Übersetzung",
      HowWeWork_subtitle: "Wie wir arbeiten",
      HowWeWork_title: "Wie wir uns unterscheiden",
      FairShare_title: "Fair-Share-Prinzip",
      FairShare_p1: "Wir haben beschlossen, das Drehbuch umzudrehen. Anstelle hoher Maklerprovisionen, die oft 3-5% plus MwSt. erreichen, arbeiten wir nach dem Fair-Share-Prinzip.",
      FairShare_p2: "Wir erheben keine traditionellen Provisionen. Stattdessen leisten sowohl Käufer als auch Verkäufer eine Spende von 0,5% (insgesamt 1%), aber gedeckelt durch ein Maximum, an ein lokales ungarisches Sozialprojekt. Dies stellt sicher, dass jede Transaktion einen positiven Fußabdruck in Ihrem neuen Zuhause hinterlässt.",
      RadicalHonesty_title: "Radikale Ehrlichkeit als Standard",
      RadicalHonesty_p1: "Wir glauben, dass ein neues Leben in einem neuen Land mit der Wahrheit beginnen muss. Deshalb verlangen wir von jedem Verkäufer, unbearbeitete Video-Touren des Hauses und des umliegenden Dorfes bereitzustellen.",
      RadicalHonesty_p2: "Unsere Plattform nutzt KI, um die Kommunikation in Echtzeit zu übersetzen und die Lücke zwischen lokalen Verkäufern und internationalen Käufern zu schließen. Wir verkaufen nicht nur Häuser; wir bieten den Kontext des Dorfes—die soziale Struktur, die Infrastruktur und das Gemeinschaftsgefühl.",
      SeeAllProperties_btn: "Alle Immobilien ansehen",
      OurSupport_subtitle: "Unsere Unterstützung",
      OurSupport_title: "Ein technischer Begleiter für Ihren Umzug",
      TechMeetsHuman_title: "Technologie trifft menschliche Erfahrung",
      TechMeetsHuman_p1: "Durch die Kombination von menschlicher Erfahrung mit fortschrittlicher Technologie stellen wir sicher, dass Ihr Umzug sicher ist. Von KI-gesteuerter Dokumentenvorbereitung bis zu einem geprüften Partnernetzwerk sind wir hier, um Sie bei jedem Schritt zu unterstützen.",
      TechMeetsHuman_p2: "Wir sind das \"hilfreiche Team von nebenan\", das moderne Tools nutzt, um Menschen fair zusammenzubringen.",
      UneditedTours_title: "Unbearbeitete Video-Touren",
      UneditedTours_description: "Jede Immobilie enthält authentische Video-Touren, die das Haus und das umliegende Dorf genau so zeigen, wie sie sind.",
      AITranslation_title: "Echtzeit-KI-Übersetzung",
      AITranslation_description: "Unsere Plattform überwindet Sprachbarrieren und verbindet internationale Käufer nahtlos mit lokalen Verkäufern.",
      VillageContext_title: "Vollständiger Dorfkontext",
      VillageContext_description: "Wir bieten Einblicke in die soziale Struktur, Infrastruktur und das Gemeinschaftsgefühl jedes Standorts.",
      ContactUs_btn: "Kontaktieren Sie uns",
    },
    hu: {
      title: "Rólunk",
      OurStory_subtitle: "Víziónk",
      OurStory_title: "Átláthatóság találkozik a közösséggel",
      OurStory_p1_part1: "Nem csak egy újabb ingatlanportál vagyunk;",
      OurStory_p1_bold: "a szomszédaitok vagyunk Magyarországon",
      OurStory_p1_part2: "Sokan már ismernek minket a",
      OurStory_p1_part3: "oldalról, ahol hírnevet szereztünk azzal, hogy őszinte és megbízható információkat nyújtunk a bevándorló közösségnek.",
      OurStory_p2: "Az Ungarn-Immo egy közös frusztrációból született: a hagyományos magyar ingatlenpiac gyakran nélkülözi azt az átláthatóságot, amire a nemzetközi vásárlóknak égető szükségük van. Túl sok \"csiszolt\" fotót láttunk, amelyek komoly hibákat rejtenek, és túl sok vásárlót hagytak magára bonyolult jogi folyamatokkal.",
      OurStory_stat1_value: "1%",
      OurStory_stat1_label: "Teljes tisztességes részesedés adomány",
      OurStory_stat2_value: "100%",
      OurStory_stat2_label: "Szerkesztetlen videó túrák",
      OurStory_stat3_label: "AI fordítás",
      HowWeWork_subtitle: "Hogyan dolgozunk",
      HowWeWork_title: "Miben különbözünk",
      FairShare_title: "Tisztességes részesedés elve",
      FairShare_p1: "Úgy döntöttünk, hogy megfordítjuk a forgatókönyvet. A 3-5% + ÁFA közvetítői jutalékok helyett a Tisztességes Részesedés Elve szerint működünk.",
      FairShare_p2: "Nem számítunk fel hagyományos jutalékot. Ehelyett a vevő és az eladó egyaránt 0,5% adományt ad (összesen 1%), de maximálisan korlátozott összeggel, egy helyi magyar szociális projektnek. Ez biztosítja, hogy minden tranzakció pozitív nyomot hagy az új otthonodban.",
      RadicalHonesty_title: "Radikális őszinteség, mint szabvány",
      RadicalHonesty_p1: "Hisszük, hogy egy új élet egy új országban az igazsággal kell, hogy kezdődjön. Ezért minden eladótól megköveteljük, hogy szerkesztetlen videó túrákat készítsen a házról és a környező faluról.",
      RadicalHonesty_p2: "Platformunk mesterséges intelligenciát használ a valós idejű kommunikáció fordítására, áthidalva a szakadékot a helyi eladók és a nemzetközi vevők között. Nem csak házakat adunk el; biztosítjuk a falu kontextusát is—a társadalmi struktúrát, az infrastruktúrát és a közösség érzését.",
      SeeAllProperties_btn: "Összes ingatlan megtekintése",
      OurSupport_subtitle: "Támogatásunk",
      OurSupport_title: "Technikai társ a költözésedhez",
      TechMeetsHuman_title: "Technológia találkozik az emberi tapasztalattal",
      TechMeetsHuman_p1: "Az emberi tapasztalat és a fejlett technológia kombinálásával biztosítjuk, hogy a költözésed biztonságos legyen. Az AI-vezérelt dokumentum-előkészítéstől a megbízható partnerhálózatig, itt vagyunk, hogy támogassunk minden lépésnél.",
      TechMeetsHuman_p2: "Mi vagyunk a \"segítőkész szomszéd csapat\", modern eszközöket használva, hogy tisztességesen hozzuk össze az embereket.",
      UneditedTours_title: "Szerkesztetlen videó túrák",
      UneditedTours_description: "Minden ingatlan tartalmaz autentikus videó túrákat, amelyek pontosan úgy mutatják be a házat és a környező falut, ahogy vannak.",
      AITranslation_title: "Valós idejű AI fordítás",
      AITranslation_description: "Platformunk lebontja a nyelvi akadályokat, zökkenőmentesen összekapcsolva a nemzetközi vevőket a helyi eladókkal.",
      VillageContext_title: "Teljes falu kontextus",
      VillageContext_description: "Betekintést nyújtunk a társadalmi struktúrába, infrastruktúrába és az egyes helyszínek közösségi érzésébe.",
      ContactUs_btn: "Lépj kapcsolatba velünk",
    },
  },
};

const ContentEditorPage = () => {
  const params = useParams();
  const router = useRouter();
  const pageKey = params.pageKey as string;

  const [activeLanguage, setActiveLanguage] = useState("en");
  const [editedContent, setEditedContent] = useState<
    Record<string, Record<string, string>>
  >({});
  const [hasChanges, setHasChanges] = useState(false);

  const {
    data: pageConfig,
    isLoading: configLoading,
    error: configError,
  } = useGetPageConfigByKeyQuery(pageKey);

  const {
    data: contentData,
    isLoading: contentLoading,
    refetch,
  } = useGetPageContentQuery({ pageKey });

  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdatePageContentMutation();

  // Initialize edited content from fetched data, with static translations as defaults
  useEffect(() => {
    // Get static translations for this page (if available)
    const staticContent = STATIC_TRANSLATIONS[pageKey] || {};

    // Merge: static translations as base, CMS content overwrites
    const mergedContent: Record<string, Record<string, string>> = {};

    // First, add all static translations
    for (const [lang, translations] of Object.entries(staticContent)) {
      mergedContent[lang] = { ...translations };
    }

    // Then, overwrite with CMS content (if any)
    if (contentData?.content) {
      for (const [lang, translations] of Object.entries(contentData.content)) {
        mergedContent[lang] = {
          ...(mergedContent[lang] || {}),
          ...translations,
        };
      }
    }

    setEditedContent(mergedContent);
    setHasChanges(false);
  }, [contentData, pageKey]);

  // Get sections from config
  const sections: PageSection[] = useMemo(() => {
    if (!pageConfig?.sections) return [];
    return Array.isArray(pageConfig.sections) ? pageConfig.sections : [];
  }, [pageConfig]);

  // Handle content change
  const handleContentChange = (
    language: string,
    sectionKey: string,
    value: string
  ) => {
    setEditedContent((prev) => ({
      ...prev,
      [language]: {
        ...(prev[language] || {}),
        [sectionKey]: value,
      },
    }));
    setHasChanges(true);
  };

  // Get content value
  const getContentValue = (language: string, sectionKey: string): string => {
    return editedContent[language]?.[sectionKey] || "";
  };

  // Check if section has content in all languages
  const getSectionStatus = (sectionKey: string) => {
    const hasEn = !!editedContent.en?.[sectionKey];
    const hasDe = !!editedContent.de?.[sectionKey];
    const hasHu = !!editedContent.hu?.[sectionKey];
    return { hasEn, hasDe, hasHu, complete: hasEn && hasDe && hasHu };
  };

  // Save all changes
  const handleSave = async () => {
    const contents: Array<{ sectionKey: string; language: string; content: string }> = [];

    // Collect all content changes
    for (const [language, sections] of Object.entries(editedContent)) {
      for (const [sectionKey, content] of Object.entries(sections)) {
        contents.push({ sectionKey, language, content });
      }
    }

    try {
      await bulkUpdate({ pageKey, contents }).unwrap();
      setHasChanges(false);
      refetch();
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  if (configLoading || contentLoading) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex items-center justify-center h-full">
                <div className="text-lg text-muted-foreground">Loading...</div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  if (configError || !pageConfig) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <h2 className="text-xl font-semibold">Page not found</h2>
                <Button onClick={() => router.push("/content")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Content
                </Button>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* Header Section */}
              <div className="flex flex-col gap-4">
                <div className="flex md:items-center flex-col gap-4 md:flex-row justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/content")}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        {pageConfig.pageName}
                      </h1>
                      <p className="text-muted-foreground">
                        {pageConfig.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save All Changes"}
                    </Button>
                  </div>
                </div>

                {hasChanges && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      You have unsaved changes
                    </span>
                  </div>
                )}
              </div>

              {/* Language Tabs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Edit Content
                      </CardTitle>
                      <CardDescription>
                        Edit content for each language. All fields support plain text.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {sections.length} sections
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={activeLanguage}
                    onValueChange={setActiveLanguage}
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      {LANGUAGES.map((lang) => (
                        <TabsTrigger
                          key={lang.code}
                          value={lang.code}
                          className="flex items-center gap-2"
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {LANGUAGES.map((lang) => (
                      <TabsContent key={lang.code} value={lang.code}>
                        <div className="space-y-6">
                          {sections.map((section, index) => {
                            const status = getSectionStatus(section.key);
                            return (
                              <div key={section.key}>
                                {index > 0 && <Separator className="mb-6" />}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label
                                      htmlFor={`${lang.code}-${section.key}`}
                                      className="text-sm font-medium"
                                    >
                                      {section.label}
                                    </Label>
                                    <div className="flex items-center gap-1">
                                      <Badge
                                        variant={status.hasEn ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        EN
                                      </Badge>
                                      <Badge
                                        variant={status.hasDe ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        DE
                                      </Badge>
                                      <Badge
                                        variant={status.hasHu ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        HU
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Key: {section.key}
                                  </p>
                                  {section.type === "textarea" ? (
                                    <Textarea
                                      id={`${lang.code}-${section.key}`}
                                      value={getContentValue(lang.code, section.key)}
                                      onChange={(e) =>
                                        handleContentChange(
                                          lang.code,
                                          section.key,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Enter ${section.label} in ${lang.label}...`}
                                      rows={4}
                                      className="resize-y"
                                    />
                                  ) : (
                                    <Input
                                      id={`${lang.code}-${section.key}`}
                                      value={getContentValue(lang.code, section.key)}
                                      onChange={(e) =>
                                        handleContentChange(
                                          lang.code,
                                          section.key,
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Enter ${section.label} in ${lang.label}...`}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Section Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Translation Coverage</CardTitle>
                  <CardDescription>
                    Overview of content completion across all languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {sections.map((section) => {
                      const status = getSectionStatus(section.key);
                      return (
                        <div
                          key={section.key}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm font-medium">
                            {section.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                status.hasEn ? "bg-green-500" : "bg-gray-300"
                              }`}
                              title="English"
                            />
                            <div
                              className={`w-3 h-3 rounded-full ${
                                status.hasDe ? "bg-green-500" : "bg-gray-300"
                              }`}
                              title="German"
                            />
                            <div
                              className={`w-3 h-3 rounded-full ${
                                status.hasHu ? "bg-green-500" : "bg-gray-300"
                              }`}
                              title="Hungarian"
                            />
                            {status.complete && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Complete
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ContentEditorPage;
