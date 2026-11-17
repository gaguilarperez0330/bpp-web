// One-off import of the images and PDFs from the Squarespace site (www.beatrizperezphotography.com).
// Run once with `node scripts/import-squarespace.mjs`. Files that already exist are skipped.
// Names are kept short on purpose: long paths broke git checkouts on Windows in the ART from HEART site.
import fs from "node:fs";
import path from "node:path";

const CDN = "https://images.squarespace-cdn.com/content/v1/5f09b2f34219c6086e8200d5/";
const SITE = "https://www.beatrizperezphotography.com";
const OUT = "src";

// [destination, source path on the CDN, width]
const images = [
  // home and about
  ["images/home/merienda.jpg", "d4ec0833-55d4-4313-aacf-faf438155a70/three-generations-la-merienda-spain-beatriz-perez.jpg", 2000],
  ["images/about/portrait.jpg", "73afd09c-4344-478b-a268-8dbfc9b01bcf/beatriz-perez-artist-portrait.jpg", 1500],
  ["images/about/contact.jpg", "09f8eae1-01a1-435d-b6e9-879fe7b1d9b0/contact-page-beatriz-perez-photography.jpg", 1500],
  ["images/home/work.jpg", "1603189395002-D683LW732GL34NR8UARO/work-photography-projects-beatriz-perez.jpg", 1500],
  ["images/prints/hero.jpg", "f9bc019d-ced6-4f2b-9b58-15567164da72/fine-art-photographic-prints-beatriz-perez.jpg", 1500],

  // Cuerpo Vestido, Alma Desnuda
  ["images/cvad/rosary-land.jpg", "87c4ac78-0ec5-4334-b40a-84420aeefa57/rosary-hands-cuerpo-vestido-alma-desnuda-landscape-beatriz-perez.jpg", 2000],
  ["images/cvad/q-mirror.jpg", "8dd92818-ae43-45ab-bae4-26efcec42622/la-quincea%C3%B1era-mirror-reflection-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/q-tiara.jpg", "85042670-07d4-4ef4-9ef4-c0abfc0e4a12/la-quincea%C3%B1era-portrait-tiara-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/q-wings.jpg", "8b267e5e-c745-413b-b605-55fcf8f2c5de/la-quincea%C3%B1era-open-wings-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/q-back.jpg", "acf4db0f-5023-4f10-8acc-111a791bb6ed/la-quincea%C3%B1era-back-wings-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/q-candle.jpg", "d215c2ae-9f9b-41e9-a744-2f09d0c3d6df/la-quincea%C3%B1era-candle-ceremony-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/n-flowers.jpg", "2bdd3257-9fb2-4dfe-a631-b2cdc9067fa2/la-novia-introspective-portrait-flowers-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/n-halo.jpg", "4af6ee9b-0c13-4ba3-9f3a-87a997ab296b/la-novia-madonna-halo-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/n-veil.jpg", "77755b87-62fb-452b-8387-acbcc160d38e/la-novia-veil-pearls-across-face-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/n-apple.jpg", "120ddf16-2ba8-4623-b047-9be46dc8f2f0/la-novia-biting-apple-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/n-bouquet.jpg", "5a86088e-f35c-43de-b285-415293841bb1/la-novia-holding-apple-bouquet-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/n-rosary.jpg", "3d50bd60-6e3b-4be7-b04b-08e9dce1f34a/rosary-hands-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/d-portrait.jpg", "673c681b-4eb2-4a62-8a59-2590134907a1/la-do%C3%B1a-portrait-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/d-necklace.jpg", "5e1f7632-319a-419c-812b-9c2e44420119/la-do%C3%B1a-pearl-necklace-teasing-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/d-pearls.jpg", "08462c1f-a6fc-41ac-a654-114531b9ef0e/la-do%C3%B1a-floating-pearls-across-face-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/d-plantain.jpg", "4dfb8e82-0afa-400c-a43e-7a45a74d6af0/la-do%C3%B1a-plantain-symbolic-gesture-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/d-holding.jpg", "4e6884b1-de55-4021-9d91-af99bba4ab89/la-do%C3%B1a-holding-plantain-symbolic-gesture-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/a-scarf.jpg", "8553d6a6-8c65-478a-b52d-1a992e036f72/la-abuela-standing-scarf-glasses-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/a-chair.jpg", "4fa6914e-0aff-48c3-b2af-7fd94ba19dfd/la-abuela-standing-with-chair-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/a-phone.jpg", "856ad6a4-4cbe-4b16-92d1-6aa6b603062f/la-abuela-mobile-phone-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/a-seated.jpg", "ae66b38c-2fcd-4353-ae45-d641c46b145b/la-abuela-seated-liqui-liqui-reflecting-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],
  ["images/cvad/dress.jpg", "1cd22e68-2d39-4774-b99c-5e38d29be059/dress-on-floor-final-image-cuerpo-vestido-alma-desnuda-beatriz-perez.jpg", 1500],

  // MISShapes
  ["images/mis/body.jpg", "5fbbd768-8868-4c64-8aca-42a9145a1068/misshapes-full-body-abstraction-beatriz-perez.jpg", 1500],
  ["images/mis/fishnet-wide.jpg", "7cffe306-f698-4f91-9f76-f99a30e136c5/fishnet-legs-stilettos-wide-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/gluteal.jpg", "4e0a47f1-9b75-42d1-b512-285ad4eef8e3/fishnet-buttocks-abstraction-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/red-legs.jpg", "50ae2388-f628-4559-9267-11d0477917cc/red-legs-abstraction-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/torso-2.jpg", "d94d86e1-5d5f-4322-82db-e260249b2473/female-torso-abstraction-2-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/torso-1.jpg", "66ef3fa7-99cc-4aa1-b1ea-d900c9b38662/female-torso-abstraction-1-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/red-body.jpg", "1774441681238-9HAWAODG05YGLPCCHLAI/red-body-abstraction-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/red-blue.jpg", "a13d6bf7-19d0-48f5-9160-9b51552045fc/red-blue-legs-abstraction-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/ribcage.jpg", "50711faf-c684-4a0f-bbac-0f68d9f8faf1/ribcage-side-abstraction-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/collarbone.jpg", "a0608679-52b3-42aa-afd8-08c7726c8ab7/female-collarbone-study-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/clavicle.jpg", "b9728893-8e6e-4b61-bc65-9b6abb79cc6d/female-clavicle-study-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/face.jpg", "a756f927-969b-4377-aa2c-ee6aebd4a246/red-side-portrait-face-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/fishnet-close.jpg", "5a0ed32c-00c7-4121-b155-aad0f8b7821e/fishnet-legs-stilettos-close-misshapes-beatriz-perez.jpg", 1500],
  ["images/mis/x-ambika-1.jpg", "d40aaabc-3205-40a7-8677-a092255ecbc7/beatriz-perez-misshapes-ambika-p3-maps-degree-show-01.jpg", 1200],
  ["images/mis/x-ambika-2.jpg", "4d1df0a1-4d77-40a7-b59f-2d6d74340c47/beatriz-perez-misshapes-ambika-p3-maps-degree-show-02.jpg", 1200],
  ["images/mis/x-ambika-3.jpg", "9f0c65e8-c947-4763-b59c-5d4be4ed454c/beatriz-perez-misshapes-ambika-p3-maps-degree-show-03.jpg", 1200],
  ["images/mis/x-colour-1.jpg", "1596298180995-UT2R0S15ZRXGPQRC0JVC/IMG_0418_web_cropped.jpg", 1200],
  ["images/mis/x-colour-2.jpg", "1596298014023-GJUF1TP0CUOGXU7RRTWJ/IMG_5741_web_1.JPG", 1200],
  ["images/mis/x-branches.jpg", "7cd518f0-f318-4b72-8cd0-5a94c20d2f5d/ExhibitionIntro-Branches-ECOFF2024.jpg", 1200],

  // The Weeping Woman
  ["images/weep/tear.jpg", "ccc8844e-07fa-4435-aa78-d5d302796c68/tear-close-up-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/arepa.jpg", "297d2b2d-feff-4b13-9d71-1d74548642f1/arepa-hunger-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/flag.jpg", "fcfd25e7-04e9-43e5-a39d-5ecf3232676e/honour-silence-venezuelan-flag-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/alone.jpg", "f91157d2-1320-402a-97ad-661f1be8e3a4/3_Alone-Together_Beatriz_Perez.jpg", 1500],
  ["images/weep/shirt.jpg", "f98911e7-a514-4093-b348-a54c776d601a/blood-stained-shirt-portrait-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/chest.jpg", "a79e85d5-e67f-4226-b5cd-f792aeb3abb5/blood-stained-shirt-close-chest-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/arms.jpg", "9cb2eaa2-1900-44a0-9168-e774d2c6b92f/arms-crossed-tears-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/phone-bw.jpg", "40dd4654-3187-4314-8a02-f44726e03033/mobile-phone-portrait-black-and-white-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/phone.jpg", "6ab51831-136e-4ada-8eaa-8565a1b194bd/mobile-phone-portrait-low-light-weeping-woman-beatriz-perez.jpg", 1500],
  ["images/weep/x-leaflet.jpg", "1596296090243-DZENZ971T78Y328SK5UI/far_away_art_pav_folded_leaflet+2_Page_1.jpg", 1200],
  ["images/weep/x-pav-1.jpg", "6f1ab5a9-51d1-4fe3-ae7b-e813b267817a/IMG_1532.jpg", 1200],
  ["images/weep/x-pav-2.jpg", "314a16b6-f7b0-460b-b9c2-fcde4bb5bacc/IMG_8578.jpg", 1200],
  ["images/weep/x-pav-3.jpg", "c9f5da7b-a6c3-4cdc-a5e1-17f536b0b6d0/IMG_3109.jpg", 1200],
  ["images/weep/x-bad-1.jpg", "159b5f2b-acc5-4067-a06d-83f646f748a5/Opening_3.jpg", 1200],
  ["images/weep/x-bad-2.jpg", "5dd442cc-b338-42d1-928e-072222650032/Opening_15.jpg", 1200],
  ["images/weep/x-bad-3.jpg", "f82b6da1-c57f-479d-9c8e-6cd2d4bb2e8c/Opening_19.jpg", 1200],
  ["images/weep/x-bad-4.jpg", "1774347408462-FVVDM2OCAA8RWZ3OEWI3/Opening_82.jpg", 1200],

  // exhibitions (posters and invitations)
  ["images/exh/mujeres.webp", "1758719149639-IZCPE5BDQKQJWO2B5KX1/Imagenation-photography-exhibition-paris-2025-1.WEBP", 1200],
  ["images/exh/shape.jpg", "1751976990130-I8IDH5W0VGACS3ISTYEQ/Shape-Exhibition-Beatriz-Perez-glasgowgalleryofphotography-2025.jpg", 1200],
  ["images/exh/branches.jpg", "1700656127752-AG87CO6K6WEJIGFK7Y9G/ECOFeminism-exhibition-branches-2024-art-from-heart.jpg", 1200],
  ["images/exh/terra.jpg", "1658359715291-3Z4VO1UMENKU40LG95V6/Terra_Opencall_Exhibition_ArtfromHeartuk.jpeg", 1200],
  ["images/exh/divine.jpg", "1639410476481-RWFMPY6ARCYRWI3JWRUY/DF_opencall_homepage2.jpg", 1200],
  ["images/exh/utopia.jpg", "1605633495074-REALYC8S8ORXSVQD7LTO/EFF_FB_OPENING_2021.jpg", 1200],
  ["images/exh/voices.jpg", "1625324994259-080GWYYRXI2XTPEO8CXV/Proudly+Presents+Voices+of+Earth.jpg", 1200],
  ["images/exh/wgitf.png", "1700663440619-L6817DSAGGU6N7P03KY7/Screenshot+2023-11-22+at+14.28.06.png", 1200],
  ["images/exh/leytonstone.png", "1596647780679-NCYAVSI51W22JZHVKOCS/Screenshot+2020-07-10+at+11.36.31.png", 1200],
  ["images/exh/fernen.jpg", "1700661782853-4UYA7TBCD29O8RZUCLU1/in-einem-fernen-fernen-land-social-media-deutsch_2.jpg", 1200],
  ["images/exh/far-away.jpg", "1597695856345-9MVN36VJKUZJR32NJEQI/country_far_away_catalogue_cover_low_res_20180228-1.jpg", 1200],
  ["images/exh/colour.jpg", "1597695127975-H91836X1H70IYTJ2P4LP/colourassembly1.jpg", 1200],
  ["images/exh/testbed.jpg", "1597936437435-MEHVK5YN1TLIGR5FFCQU/TB2016_IMG_1.jpg", 1200],
  ["images/exh/maps.jpg", "1596906370203-2H3BHV6ZYAX5L3SGIW2D/MAPS+E-VITE+image.jpg", 1200],
  ["images/exh/renaissance.jpg", "1596640700622-FL1MZSBETNUL8A0BGYYA/Renaissance+Photog+Prize+2012.jpg", 1200],

  // press tearsheets
  ["images/press/docu.jpg", "0bb7bd0c-b3e4-498c-8d2c-77b68be283a7/DOCU-Magazine-Special-Edition-Beatriz-Perez.jpg", 1200],
  ["images/press/simone.jpg", "dc9fde01-3906-4582-936a-1ce174cf5f14/simone-awards-chateau-de-pommard-art-from-heart-2025.jpg", 1200],
  ["images/press/wuam.jpg", "884416a5-6f6b-4bea-a01e-e83fdb196d02/women-united-art-magazine-autumn-2025-art-from-heart-feature.jpg", 1200],
  ["images/press/prestige.jpg", "d430afc0-9610-4146-bb7b-351b9582d2ff/prestige-awards-art-from-heart-arts-organisation-of-the-year-2023-2024.jpg", 1200],
  ["images/press/artistank.jpg", "1597678049409-4ABFV2XIPE68USZK1T7R/Tearsheet_AbeledosStreet3.jpg", 1200],
  ["images/press/ilovetalent.jpg", "1597686688188-ROXDFDGIFVDDXCZ0Z5RA/Tearsheet_IloveTalent2.jpg", 1200],
  ["images/press/source.jpg", "1596209846392-WS88L5UC5280L7U197KX/Source_+Graduate+Photography+Online+-+2013+-+University+of+Westminster+-+MA+Photographic+Studies.jpg", 1200],
  ["images/press/art-mag.jpg", "483ad512-a904-4268-b32f-78ea9794f4a8/A.R.T.-Magazine-Tearsheet.jpg", 1200],
  ["images/press/zine.jpg", "1752770087689-PBLI3MTVBJP5LU9JAFWR/Zine.jpg", 1200],
  ["images/press/cat-terra.jpg", "1752773840255-DHDWUHYRQRPR133Z0YQM/Untitled-1.jpg", 1200],
  ["images/press/cat-utopia.jpg", "1752769094973-2908NFNWLMSR9SZXWXH9/Utopia%2BCatalogue.jpg", 1200],
  ["images/press/cat-wgitf.jpg", "1597669732159-Z82QRY15Z4QTE20F5AXS/Untitled-1.jpg", 1200],
  ["images/press/cat-faraway.jpg", "1597671468266-6GKJBQFRHLVQSO6237WK/Tearsheet_WeepingWoman1.jpg", 1200],
  ["images/press/cat-fernen.jpg", "1597671466870-363MA9DSMKZBZ9CFCB12/Tearsheets_weepingwoman3.jpg", 1200],
  ["images/press/cat-maps.jpg", "1597661046578-25G4V7RPM8295PXMYELV/Tearsheets_Misshapes2.jpg", 1200],
  ["images/press/cat-renaissance.jpg", "1597661370637-7ITAE2QNDIT401E7AUKR/Tearsheet_Fragmented_Zones1.jpg", 1200],
  ["images/press/ticketpass.jpg", "67756790-2033-4e0f-a34b-37c5d8e29249/Ticketpass-Blog-feature-Beatriz-Perez.jpg", 1200],
  ["images/press/spiegel.jpg", "1597677479039-A2FA0SG5WD1XTRZ00GFK/Tearsheet_NewLondoners2.jpg", 1200],
  ["images/press/magnum.jpg", "1597677137731-NZ4HOFOEPE7AMNWQFDJP/screencapture-thenewlondoners-portfolio-spain-venezuela-2020-08-16-12_25_50.jpg", 1200],
  ["images/press/westfalen-1.jpg", "1597675686273-Z2KOB1L2RP3XGVSBME7W/screencapture-m-westfalen-blatt-de-OWL-Kreis-Minden-Luebbecke-Bad-Oeynhausen-3276044-Ausstellung-im-Maerchen-und-Wesersagenmuseum-Bad-Oeynhausen-vereint-Kulturen-Volkslied-erzaehlt-von-Sklaverei-2020-08-17-15_34_55.jpg", 1200],
  ["images/press/westfalen-2.jpg", "1597671461336-SXNDD0S8EBQNU9LF1842/Tearsheets_weepingwoman4.jpg", 1200],
  ["images/press/westfalen-3.jpg", "1597671460880-7KKKZ4IMJPZR2O32F2LT/Tearsheets_weepingwoman5.jpg", 1200],
  ["images/press/whitechapel.jpg", "1597671464885-2CE2ZYR8R4E9CPOMKQ7W/Tearsheet_WeepingWoman2.jpg", 1200],
  ["images/press/towerhamlets.jpg", "1597671456023-TGQERWT1M5JFN8VBJVHM/screencapture2-towerhamletsarts-org-uk-2020-08-16-12_39_28.jpg", 1200],
  ["images/press/camden-radio.jpg", "1597661051278-0ATWDP28S4RAZ0XVS1AZ/Tearsheets_Misshapes4.jpg", 1200],
  ["images/press/kentishtowner.jpg", "1596289122190-P26FMZMBPTV3NI9OARAN/Untitled-1.jpg", 1200],
  ["images/press/hamhigh.jpg", "1597687085621-0YLT7IM9RGE5X7IMHJVP/Tearsheets_Misshapes3.jpg", 1200],
  ["images/press/lovecamden.jpg", "1596289420134-SYYSSBFR3UDR4ZZAIR05/Screen+Shot+2017-01-05+at+16.32.04.jpg", 1200],
  ["images/press/wherevent.jpg", "1597667089994-VNC2AVTA0PKT5ZJWCQEZ/Tearsheet_testbed2.jpg", 1200],
  ["images/press/lovecamden-2.png", "1596630814207-47KQ4DXDPSPNLTEPBI8N/Screen+Shot+2016-11-25+at+14.43.46.png", 1200],
  ["images/press/testbed.jpg", "1597676757635-SKIFW9NHOV31JFWP9YD4/Testbed_+Market+to+Market.jpg", 1200],
];

const files = [
  ["files/beatriz-perez-cv-2026.pdf", `${SITE}/s/2026-Beatriz-Perez-Artist-CV.pdf`],
  ["files/women-in-the-arts-2025.pdf", `${SITE}/s/Women-In-The-Arts-ART-from-HEART-CIC.pdf`],
];

const jobs = [
  ...images.map(([dest, src, w]) => [dest, `${CDN}${src}?format=${w}w`]),
  ...files,
];

let done = 0, skipped = 0, failed = 0;
for (const [dest, url] of jobs) {
  const out = path.join(OUT, dest);
  if (fs.existsSync(out)) { skipped++; continue; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  try {
    // Squarespace sends WebP to clients that accept it; ask for the real JPEG/PNG so the file matches its name
    const res = await fetch(url, { headers: { Accept: "image/jpeg,image/png;q=0.9,*/*;q=0.1" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
    done++;
  } catch (e) {
    failed++;
    console.log(`FAILED ${dest}: ${e.message}`);
  }
}
console.log(`downloaded ${done}, already there ${skipped}, failed ${failed}, of ${jobs.length}`);
