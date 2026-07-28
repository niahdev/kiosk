(function exposeKioskI18n(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.KioskI18n = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function buildKioskI18n() {
  const translations = {
    ko: {
      pageTitle: "키오스크 진행 상황",
      languageSelection: "언어 선택",
      refreshPage: "새로고침",
      heading: "사용자별 프로젝트 현황",
      intro: "사용자를 터치하면 프로젝트 목록이 열리고, 프로젝트를 고르면 상세 화면이 열립니다",
      currentTime: "지금 시간",
      loading: "불러오는 중...",
      userProjects: "사용자 프로젝트",
      projectList: "프로젝트 목록",
      close: "닫기",
      projectPreview: "프로젝트 미리보기",
      screenshot: "스크린샷",
      noScreenshot: "아직 등록된 스크린샷이 없습니다.",
      deployment: "배포판",
      openDeploymentMockup: "배포판 목업 열기",
      githubRepository: "GitHub 저장소",
      openGithubRepository: "GitHub 저장소 열기",
      projectProcess: "사용한 프롬프트 팁",
      comments: "코멘트",
      authorPlaceholder: "작성자 (예: kopo05)",
      commentPlaceholder: "누구나 코멘트를 남길 수 있습니다",
      registerComment: "코멘트 등록",
      closeScreen: "화면닫기",
      deploymentFrameTitle: "프로젝트 배포판 목업",
      noLinkReason: "링크가 없습니다.",
      noLink: "링크 없음",
      unavailable: "접속 불가",
      openNewWindow: "새 창에서 열기",
      portfolioButton: "포트폴리오 보기",
      connectionCheckFailed: "접속 확인 실패",
      checking: "확인 중",
      page404: "404 페이지",
      error: "오류",
      newWindowAvailable: "새 창으로 가능",
      available: "접속 가능",
      viewCount: "조회수 {count}회",
      jsonResponseError: "JSON 응답이 아닙니다.",
      requestFailed: "요청을 처리하지 못했습니다.",
      nameNotRegistered: "이름 미등록",
      screenshotAlt: "{projectName} 스크린샷",
      screenshotPending: "스크린샷 준비 중",
      projectCount: "{users}명 / {projects}개 프로젝트 표시 중",
      noComments: "아직 등록된 코멘트가 없습니다.",
      noAuthor: "작성자 없음",
      commentCount: "코멘트 {count}개",
      portfolioUnavailable: "포트폴리오에 접속할 수 없습니다.",
      iframeOpenedNew: "iframe에서 열리지 않아 새 창으로 열었습니다.",
      iframeCheckFailed: "iframe 확인 실패: {message}",
      deploymentMockupTitle: "{projectName} 배포판 목업",
      errorMessage: "오류: {message}"
    },
    en: {
      pageTitle: "Kiosk Progress",
      languageSelection: "Select language",
      refreshPage: "Refresh page",
      heading: "Projects by User",
      intro: "Tap a user to open their project list, then select a project to view its details.",
      currentTime: "Current time",
      loading: "Loading...",
      userProjects: "User Projects",
      projectList: "Project List",
      close: "Close",
      projectPreview: "Project Preview",
      screenshot: "Screenshot",
      noScreenshot: "No screenshot has been added yet.",
      deployment: "Deployed Version",
      openDeploymentMockup: "Open deployed preview",
      githubRepository: "GitHub Repository",
      openGithubRepository: "Open GitHub repository",
      projectProcess: "Prompt Tips Used",
      comments: "Comments",
      authorPlaceholder: "Author (e.g. kopo05)",
      commentPlaceholder: "Anyone can leave a comment",
      registerComment: "Post comment",
      closeScreen: "Close",
      deploymentFrameTitle: "Project deployment preview",
      noLinkReason: "No link is available.",
      noLink: "No link",
      unavailable: "Unavailable",
      openNewWindow: "Open in new window",
      portfolioButton: "View portfolio",
      connectionCheckFailed: "Connection check failed",
      checking: "Checking",
      page404: "404 page",
      error: "Error",
      newWindowAvailable: "Available in new window",
      available: "Available",
      viewCount: "{count} views",
      jsonResponseError: "The response is not valid JSON.",
      requestFailed: "The request could not be completed.",
      nameNotRegistered: "Name not registered",
      screenshotAlt: "Screenshot of {projectName}",
      screenshotPending: "Screenshot pending",
      projectCount: "{users} users / {projects} projects displayed",
      noComments: "No comments have been added yet.",
      noAuthor: "Anonymous",
      commentCount: "{count} comments",
      portfolioUnavailable: "The portfolio is unavailable.",
      iframeOpenedNew: "It could not open on this page, so it was opened in a new window.",
      iframeCheckFailed: "Preview check failed: {message}",
      deploymentMockupTitle: "Deployed preview of {projectName}",
      errorMessage: "Error: {message}"
    },
    ar: {
      pageTitle: "حالة تقدم الكشك",
      languageSelection: "اختيار اللغة",
      refreshPage: "تحديث الصفحة",
      heading: "حالة المشاريع حسب المستخدم",
      intro: "المس مستخدمًا لفتح قائمة مشاريعه، ثم اختر مشروعًا لعرض التفاصيل.",
      currentTime: "الوقت الحالي",
      loading: "جارٍ التحميل...",
      userProjects: "مشاريع المستخدم",
      projectList: "قائمة المشاريع",
      close: "إغلاق",
      projectPreview: "معاينة المشروع",
      screenshot: "لقطة الشاشة",
      noScreenshot: "لم تُضف لقطة شاشة بعد.",
      deployment: "النسخة المنشورة",
      openDeploymentMockup: "فتح معاينة النسخة المنشورة",
      githubRepository: "مستودع GitHub",
      openGithubRepository: "فتح مستودع GitHub",
      projectProcess: "نصائح المطالبات المستخدمة",
      comments: "التعليقات",
      authorPlaceholder: "الكاتب (مثال: kopo05)",
      commentPlaceholder: "يمكن لأي شخص ترك تعليق",
      registerComment: "إرسال التعليق",
      closeScreen: "إغلاق",
      deploymentFrameTitle: "معاينة النسخة المنشورة للمشروع",
      noLinkReason: "لا يوجد رابط.",
      noLink: "لا يوجد رابط",
      unavailable: "غير متاح",
      openNewWindow: "فتح في نافذة جديدة",
      portfolioButton: "عرض ملف الأعمال",
      connectionCheckFailed: "تعذّر التحقق من الاتصال",
      checking: "جارٍ التحقق",
      page404: "صفحة 404",
      error: "خطأ",
      newWindowAvailable: "متاح في نافذة جديدة",
      available: "متاح",
      viewCount: "{count} مشاهدة",
      jsonResponseError: "الاستجابة ليست بصيغة JSON صالحة.",
      requestFailed: "تعذّر إكمال الطلب.",
      nameNotRegistered: "الاسم غير مسجّل",
      screenshotAlt: "لقطة شاشة لمشروع {projectName}",
      screenshotPending: "لقطة الشاشة قيد الانتظار",
      projectCount: "يتم عرض {users} مستخدمين / {projects} مشاريع",
      noComments: "لم تُضف أي تعليقات بعد.",
      noAuthor: "بدون اسم",
      commentCount: "{count} تعليق",
      portfolioUnavailable: "يتعذّر الوصول إلى ملف الأعمال.",
      iframeOpenedNew: "تعذّر فتحه داخل الصفحة، لذا فُتح في نافذة جديدة.",
      iframeCheckFailed: "فشل التحقق من المعاينة: {message}",
      deploymentMockupTitle: "معاينة النسخة المنشورة لمشروع {projectName}",
      errorMessage: "خطأ: {message}"
    }
  };

  const localizedProjectNames = {
    "교내 채팅 프로그램": {
      en: "Campus Chat Program",
      ar: "برنامج الدردشة داخل الحرم الجامعي"
    },
    HotelWeb: {
      en: "Hotel Website",
      ar: "موقع الفندق"
    },
    GameReview: {
      en: "Game Reviews",
      ar: "مراجعات الألعاب"
    },
    "실시간 대기질 현황/전망": {
      en: "Real-time Air Quality Status/Forecast",
      ar: "حالة وتوقعات جودة الهواء في الوقت الفعلي"
    },
    "호텔예약시스템": {
      en: "Hotel Reservation System",
      ar: "نظام حجز الفنادق"
    },
    "맛집리뷰/정보사이트": {
      en: "Restaurant Reviews/Information Site",
      ar: "موقع مراجعات ومعلومات المطاعم"
    },
    kiosk: {
      en: "Kiosk",
      ar: "كشك"
    },
    "호텔예약": {
      en: "Hotel Booking",
      ar: "حجز الفندق"
    },
    "여행지 리뷰": {
      en: "Travel Destination Reviews",
      ar: "مراجعات وجهات السفر"
    },
    "AI할일관리앱": {
      en: "AI To-do Management App",
      ar: "تطبيق إدارة المهام بالذكاء الاصطناعي"
    },
    GitReviewer: {
      en: "Git Reviewer",
      ar: "مراجع Git"
    },
    Gamelogs: {
      en: "Game Logs",
      ar: "سجلات الألعاب"
    },
    "편집자 대시보드": {
      en: "Editor Dashboard",
      ar: "لوحة تحكم المحرر"
    },
    "호텔 예약": {
      en: "Hotel Booking",
      ar: "حجز الفندق"
    },
    "만화 리뷰": {
      en: "Comic Reviews",
      ar: "مراجعات القصص المصورة"
    },
    "DevStudy Toolbox: 개발 공부용 도구모음": {
      en: "DevStudy Toolbox: Developer Study Tools",
      ar: "صندوق أدوات DevStudy: أدوات لدراسة البرمجة"
    },
    "학습 게임 플랫폼": {
      en: "Learning Game Platform",
      ar: "منصة ألعاب تعليمية"
    },
    "호텔 웹사이트": {
      en: "Hotel Website",
      ar: "موقع الفندق"
    },
    "영화 커뮤니티 사이트": {
      en: "Movie Community Site",
      ar: "موقع مجتمع الأفلام"
    },
    Culturelog: {
      en: "Culture Log",
      ar: "سجل الثقافة"
    },
    "호텔 예약 사이트": {
      en: "Hotel Reservation Site",
      ar: "موقع حجز الفنادق"
    },
    jobmarketrader: {
      en: "Job Market Trader",
      ar: "متداول سوق العمل"
    },
    "호텔웹": {
      en: "Hotel Website",
      ar: "موقع الفندق"
    },
    "캔버스 스튜디오": {
      en: "Canvas Studio",
      ar: "استوديو كانفاس"
    },
    hotelweb: {
      en: "Hotel Website",
      ar: "موقع الفندق"
    },
    "음식점": {
      en: "Restaurant",
      ar: "مطعم"
    },
    todo: {
      en: "To-do",
      ar: "قائمة المهام"
    },
    "호텔화면": {
      en: "Hotel Interface",
      ar: "واجهة الفندق"
    },
    "영화목록": {
      en: "Movie List",
      ar: "قائمة الأفلام"
    },
    "내 웹사이트에 사람이 한꺼번에 몰리면?": {
      en: "What If Many People Visit My Website at Once?",
      ar: "ماذا لو زار كثير من الأشخاص موقعي في الوقت نفسه؟"
    },
    "RUNSHOES-러닝화 스펙·리뷰 아카이브": {
      en: "RUNSHOES - Running Shoe Specs & Review Archive",
      ar: "RUNSHOES - أرشيف مواصفات ومراجعات أحذية الجري"
    }
  };

  function createKioskI18n(requestedLocale) {
    const locale = Object.hasOwn(translations, requestedLocale) ? requestedLocale : "ko";

    return {
      locale,
      direction: locale === "ar" ? "rtl" : "ltr",
      t(key, values = {}) {
        const template = translations[locale][key] || translations.ko[key] || key;

        return template.replace(/\{(\w+)\}/g, (match, name) => (
          Object.hasOwn(values, name) ? String(values[name]) : match
        ));
      }
    };
  }

  function formatLocalizedProjectName(studentId, projectName, requestedLocale) {
    const locale = Object.hasOwn(translations, requestedLocale) ? requestedLocale : "ko";
    const translatedName = localizedProjectNames[projectName]?.[locale];

    if (locale === "en" && !/[가-힣]/.test(projectName)) {
      return projectName;
    }

    return translatedName ? `${projectName} (${translatedName})` : projectName;
  }

  return {
    translations,
    createKioskI18n,
    formatLocalizedProjectName
  };
}));
