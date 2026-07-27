const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createKioskI18n,
  formatLocalizedProjectName,
  translations
} = require("../kiosk-i18n");

test("provides the same fixed UI keys for Korean, English, and Arabic", () => {
  const koreanKeys = Object.keys(translations.ko).sort();

  assert.deepEqual(Object.keys(translations.en).sort(), koreanKeys);
  assert.deepEqual(Object.keys(translations.ar).sort(), koreanKeys);
});

test("translates fixed labels and interpolates counts without changing supplied values", () => {
  const i18n = createKioskI18n("en");

  assert.equal(i18n.t("portfolioButton"), "View portfolio");
  assert.equal(
    i18n.t("projectCount", { users: 3, projects: 7 }),
    "3 users / 7 projects displayed"
  );
  assert.equal(
    i18n.t("screenshotAlt", { projectName: "사용자 프로젝트명" }),
    "Screenshot of 사용자 프로젝트명"
  );
});

test("uses right-to-left direction only for Arabic", () => {
  assert.equal(createKioskI18n("ko").direction, "ltr");
  assert.equal(createKioskI18n("en").direction, "ltr");
  assert.equal(createKioskI18n("ar").direction, "rtl");
});

test("falls back to Korean for an unsupported saved language", () => {
  const i18n = createKioskI18n("fr");

  assert.equal(i18n.locale, "ko");
  assert.equal(i18n.t("close"), "닫기");
});

test("keeps an unknown translation key visible for diagnostics", () => {
  const i18n = createKioskI18n("en");

  assert.equal(i18n.t("missingKey"), "missingKey");
});

test("uses a short localized label for prompt tips", () => {
  assert.equal(createKioskI18n("ko").t("projectProcess"), "사용한 프롬프트 팁");
  assert.equal(createKioskI18n("en").t("projectProcess"), "Prompt Tips Used");
  assert.equal(createKioskI18n("ar").t("projectProcess"), "نصائح المطالبات المستخدمة");
});

test("adds a localized title to mapped projects for every user", () => {
  assert.equal(
    formatLocalizedProjectName("kopo05", "호텔예약", "en"),
    "호텔예약 (Hotel Booking)"
  );
  assert.equal(
    formatLocalizedProjectName("kopo05", "호텔예약", "ar"),
    "호텔예약 (حجز الفندق)"
  );
  assert.equal(
    formatLocalizedProjectName("kopo05", "호텔예약", "ko"),
    "호텔예약"
  );
  assert.equal(
    formatLocalizedProjectName("kopo06", "호텔예약", "en"),
    "호텔예약 (Hotel Booking)"
  );
  assert.equal(
    formatLocalizedProjectName("kopo05", "새 프로젝트", "en"),
    "새 프로젝트"
  );
  assert.equal(
    formatLocalizedProjectName("kopo02", "HotelWeb", "en"),
    "HotelWeb"
  );
  assert.equal(
    formatLocalizedProjectName("kopo02", "HotelWeb", "ar"),
    "HotelWeb (موقع الفندق)"
  );
});

test("covers every project name currently registered in the kiosk", () => {
  const registeredProjectNames = [
    "교내 채팅 프로그램",
    "HotelWeb",
    "GameReview",
    "실시간 대기질 현황/전망",
    "호텔예약시스템",
    "맛집리뷰/정보사이트",
    "kiosk",
    "호텔예약",
    "여행지 리뷰",
    "AI할일관리앱",
    "GitReviewer",
    "Gamelogs",
    "편집자 대시보드",
    "호텔 예약",
    "만화 리뷰",
    "DevStudy Toolbox: 개발 공부용 도구모음",
    "학습 게임 플랫폼",
    "호텔 웹사이트",
    "영화 커뮤니티 사이트",
    "Culturelog",
    "호텔 예약 사이트",
    "jobmarketrader",
    "호텔웹",
    "캔버스 스튜디오",
    "hotelweb",
    "음식점",
    "todo",
    "호텔화면",
    "영화목록",
    "내 웹사이트에 사람이 한꺼번에 몰리면?",
    "RUNSHOES-러닝화 스펙·리뷰 아카이브"
  ];

  registeredProjectNames.forEach((projectName) => {
    const englishName = formatLocalizedProjectName("any-user", projectName, "en");
    if (/[가-힣]/.test(projectName)) {
      assert.notEqual(englishName, projectName, `${projectName}의 영어 번역이 필요합니다.`);
    } else {
      assert.equal(englishName, projectName, `${projectName}에는 중복 영어 번역이 없어야 합니다.`);
    }
    assert.notEqual(
      formatLocalizedProjectName("any-user", projectName, "ar"),
      projectName,
      `${projectName}의 아랍어 번역이 필요합니다.`
    );
  });
});
