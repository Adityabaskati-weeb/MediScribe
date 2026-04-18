export type AppLanguage = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Bengali';

type TranslationKey =
  | 'offlineReady'
  | 'heroTitle'
  | 'heroCopy'
  | 'startConsultation'
  | 'patientsToday'
  | 'urgentAlerts'
  | 'needsAttention'
  | 'childAlert'
  | 'pregnancyAlert'
  | 'voiceIntake'
  | 'records'
  | 'settings'
  | 'syncSettings'
  | 'offlineStatus'
  | 'offlineStatusCopy'
  | 'queuedRecords'
  | 'language'
  | 'modelStatus'
  | 'modelCached'
  | 'guidelinesCached'
  | 'sqliteReady'
  | 'returnHome'
  | 'back'
  | 'step1'
  | 'registerPatient'
  | 'registerCopy'
  | 'patientProfile'
  | 'patientName'
  | 'age'
  | 'gender'
  | 'phone'
  | 'address'
  | 'emergencyContact'
  | 'conditions'
  | 'allergies'
  | 'medications'
  | 'pregnancyWeeks'
  | 'postpartumDays'
  | 'registerContinue'
  | 'step2'
  | 'describeSymptoms'
  | 'voiceScreenCopy'
  | 'dictateSymptoms'
  | 'demoMode'
  | 'nativeMic'
  | 'useDemoOrType'
  | 'listening'
  | 'demoDictation'
  | 'startSpeaking'
  | 'demoVoice'
  | 'transcriptPlaceholder'
  | 'analyzeTyped'
  | 'speechSupport';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  English: {
    offlineReady: 'Offline Ready',
    heroTitle: 'Fast clinical help for rural health workers',
    heroCopy: 'Speak symptoms, scan notes, spot danger signs, and decide the next safe step.',
    startConsultation: 'Start Consultation',
    patientsToday: 'patients today',
    urgentAlerts: 'urgent alerts',
    needsAttention: 'Needs attention',
    childAlert: 'Child fever with low oxygen: review before next queue.',
    pregnancyAlert: 'Pregnancy headache and high BP: referral check.',
    voiceIntake: 'Voice Intake',
    records: 'Records',
    settings: 'Settings',
    syncSettings: 'Sync and settings',
    offlineStatus: 'Offline status',
    offlineStatusCopy: 'Clinic mode active. Patient data is saved on device.',
    queuedRecords: 'Queued records: 4 - Last sync: demo clinic morning round',
    language: 'Language',
    modelStatus: 'Model status',
    modelCached: 'Gemma medical assistant: cached for offline triage',
    guidelinesCached: 'Guidelines pack: WHO-style danger signs cached',
    sqliteReady: 'SQLite: local storage ready',
    returnHome: 'Return Home',
    back: 'Back',
    step1: 'Step 1 of 5',
    registerPatient: 'Register patient',
    registerCopy: 'Only the essential details are needed to start. More can be added after triage.',
    patientProfile: 'Patient profile',
    patientName: 'Patient name',
    age: 'Age',
    gender: 'Gender: female, male, other, unknown',
    phone: 'Phone number',
    address: 'Village / address',
    emergencyContact: 'Emergency contact',
    conditions: 'Known conditions, comma separated',
    allergies: 'Allergies, comma separated',
    medications: 'Current medications, comma separated',
    pregnancyWeeks: 'Pregnancy weeks, if applicable',
    postpartumDays: 'Postpartum days, if applicable',
    registerContinue: 'Register and Continue',
    step2: 'Step 2 of 5',
    describeSymptoms: 'Describe symptoms',
    voiceScreenCopy: 'Use voice first. Add chart scan or typed notes when the clinic is noisy.',
    dictateSymptoms: 'Dictate symptoms',
    demoMode: 'Demo mode',
    nativeMic: 'Native mic',
    useDemoOrType: 'Use demo voice capture or type the dictated symptoms.',
    listening: 'Listening with native speech...',
    demoDictation: 'Using demo dictation...',
    startSpeaking: 'Start speaking',
    demoVoice: 'Demo voice',
    transcriptPlaceholder: 'Dictated transcript appears here. You can edit it before analysis.',
    analyzeTyped: 'Analyze Typed Transcript',
    speechSupport: 'Browser and Expo Go use demo dictation. Use the custom native build for real microphone speech recognition.'
  },
  Hindi: {
    offlineReady: 'ऑफलाइन तैयार',
    heroTitle: 'ग्रामीण स्वास्थ्य कर्मियों के लिए तेज क्लिनिकल मदद',
    heroCopy: 'लक्षण बोलें, नोट स्कैन करें, खतरे के संकेत देखें, और अगला सुरक्षित कदम चुनें.',
    startConsultation: 'परामर्श शुरू करें',
    patientsToday: 'आज के मरीज',
    urgentAlerts: 'तत्काल अलर्ट',
    needsAttention: 'ध्यान जरूरी',
    childAlert: 'बच्चे को बुखार और ऑक्सीजन कम: अगली कतार से पहले देखें.',
    pregnancyAlert: 'गर्भावस्था में सिरदर्द और BP अधिक: रेफरल जांचें.',
    voiceIntake: 'आवाज इनपुट',
    records: 'रिकॉर्ड',
    settings: 'सेटिंग्स',
    syncSettings: 'सिंक और सेटिंग्स',
    offlineStatus: 'ऑफलाइन स्थिति',
    offlineStatusCopy: 'क्लिनिक मोड चालू है. मरीज का डेटा डिवाइस पर सुरक्षित है.',
    queuedRecords: 'कतार रिकॉर्ड: 4 - अंतिम सिंक: सुबह का क्लिनिक राउंड',
    language: 'भाषा',
    modelStatus: 'मॉडल स्थिति',
    modelCached: 'Gemma मेडिकल असिस्टेंट: ऑफलाइन ट्रायेज के लिए कैश्ड',
    guidelinesCached: 'गाइडलाइन पैक: WHO-style खतरे के संकेत कैश्ड',
    sqliteReady: 'SQLite: स्थानीय स्टोरेज तैयार',
    returnHome: 'होम पर जाएं',
    back: 'वापस',
    step1: 'चरण 1 / 5',
    registerPatient: 'मरीज पंजीकरण',
    registerCopy: 'शुरू करने के लिए जरूरी जानकारी भरें. बाकी ट्रायेज के बाद जोड़ सकते हैं.',
    patientProfile: 'मरीज प्रोफाइल',
    patientName: 'मरीज का नाम',
    age: 'उम्र',
    gender: 'लिंग: महिला, पुरुष, अन्य, अज्ञात',
    phone: 'फोन नंबर',
    address: 'गांव / पता',
    emergencyContact: 'आपात संपर्क',
    conditions: 'पहले की बीमारी, comma से अलग',
    allergies: 'एलर्जी, comma से अलग',
    medications: 'चल रही दवाएं, comma से अलग',
    pregnancyWeeks: 'गर्भावस्था सप्ताह, यदि लागू',
    postpartumDays: 'प्रसव के बाद दिन, यदि लागू',
    registerContinue: 'पंजीकरण और आगे बढ़ें',
    step2: 'चरण 2 / 5',
    describeSymptoms: 'लक्षण बताएं',
    voiceScreenCopy: 'पहले आवाज का उपयोग करें. शोर हो तो स्कैन या टाइप करें.',
    dictateSymptoms: 'लक्षण बोलें',
    demoMode: 'डेमो मोड',
    nativeMic: 'नेटिव माइक',
    useDemoOrType: 'डेमो आवाज लें या लक्षण टाइप करें.',
    listening: 'नेटिव स्पीच सुन रहा है...',
    demoDictation: 'डेमो dictation उपयोग हो रहा है...',
    startSpeaking: 'बोलना शुरू करें',
    demoVoice: 'डेमो आवाज',
    transcriptPlaceholder: 'Dictation text यहां दिखेगा. जांच से पहले आप इसे सुधार सकते हैं.',
    analyzeTyped: 'लिखे हुए लक्षण जांचें',
    speechSupport: 'Browser और Expo Go डेमो dictation इस्तेमाल करते हैं. असली microphone के लिए native dev build चाहिए.'
  },
  Tamil: {
    offlineReady: 'ஆஃப்லைன் தயார்',
    heroTitle: 'கிராம சுகாதார பணியாளர்களுக்கு விரைவு மருத்துவ உதவி',
    heroCopy: 'அறிகுறிகளை பேசுங்கள், குறிப்புகளை scan செய்யுங்கள், ஆபத்து அறிகுறிகளை கண்டறியுங்கள்.',
    startConsultation: 'ஆலோசனை தொடங்கு',
    patientsToday: 'இன்றைய நோயாளிகள்',
    urgentAlerts: 'அவசர எச்சரிக்கை',
    needsAttention: 'கவனம் தேவை',
    childAlert: 'குழந்தைக்கு காய்ச்சல் மற்றும் ஆக்சிஜன் குறைவு: உடனே பாருங்கள்.',
    pregnancyAlert: 'கர்ப்பத்தில் தலைவலி மற்றும் BP அதிகம்: referral பார்க்கவும்.',
    voiceIntake: 'குரல் பதிவு',
    records: 'பதிவுகள்',
    settings: 'அமைப்புகள்',
    syncSettings: 'Sync மற்றும் அமைப்புகள்',
    offlineStatus: 'ஆஃப்லைன் நிலை',
    offlineStatusCopy: 'Clinic mode செயலில் உள்ளது. நோயாளர் தரவு device-ல் சேமிக்கப்படுகிறது.',
    queuedRecords: 'Queue records: 4 - கடைசி sync: காலை clinic round',
    language: 'மொழி',
    modelStatus: 'Model நிலை',
    modelCached: 'Gemma medical assistant: offline triage க்கு cached',
    guidelinesCached: 'Guidelines pack: WHO-style danger signs cached',
    sqliteReady: 'SQLite: local storage ready',
    returnHome: 'Home திரும்பு',
    back: 'பின்',
    step1: 'படி 1 / 5',
    registerPatient: 'நோயாளர் பதிவு',
    registerCopy: 'தொடங்க தேவையான விவரங்கள் மட்டும் போதும். பிறகு மேலும் சேர்க்கலாம்.',
    patientProfile: 'நோயாளர் profile',
    patientName: 'நோயாளர் பெயர்',
    age: 'வயது',
    gender: 'பாலினம்: பெண், ஆண், மற்றவை, தெரியாது',
    phone: 'Phone number',
    address: 'கிராமம் / முகவரி',
    emergencyContact: 'அவசர தொடர்பு',
    conditions: 'முன் நோய்கள், comma separated',
    allergies: 'Allergies, comma separated',
    medications: 'தற்போதைய மருந்துகள், comma separated',
    pregnancyWeeks: 'கர்ப்ப வாரங்கள், இருந்தால்',
    postpartumDays: 'பிரசவத்துக்கு பின் நாட்கள், இருந்தால்',
    registerContinue: 'பதிவு செய்து தொடரவும்',
    step2: 'படி 2 / 5',
    describeSymptoms: 'அறிகுறிகளை சொல்லுங்கள்',
    voiceScreenCopy: 'முதலில் குரல் பயன்படுத்தவும். சத்தம் இருந்தால் scan அல்லது type செய்யவும்.',
    dictateSymptoms: 'அறிகுறிகள் பேசுங்கள்',
    demoMode: 'Demo mode',
    nativeMic: 'Native mic',
    useDemoOrType: 'Demo voice அல்லது symptoms type செய்யவும்.',
    listening: 'Native speech கேட்கிறது...',
    demoDictation: 'Demo dictation பயன்படுத்துகிறது...',
    startSpeaking: 'பேச தொடங்கு',
    demoVoice: 'Demo voice',
    transcriptPlaceholder: 'Dictation text இங்கே வரும். Analysis முன் திருத்தலாம்.',
    analyzeTyped: 'Typed transcript analyze செய்',
    speechSupport: 'Browser மற்றும் Expo Go demo dictation பயன்படுத்தும். Real microphone க்கு native dev build தேவை.'
  },
  Telugu: {
    offlineReady: 'ఆఫ్లైన్ సిద్ధం',
    heroTitle: 'గ్రామీణ ఆరోగ్య సిబ్బందికి వేగమైన వైద్య సహాయం',
    heroCopy: 'లక్షణాలు చెప్పండి, notes scan చేయండి, ప్రమాద సూచనలు గుర్తించి సురక్షిత నిర్ణయం తీసుకోండి.',
    startConsultation: 'కన్సల్టేషన్ ప్రారంభించండి',
    patientsToday: 'ఈరోజు రోగులు',
    urgentAlerts: 'అత్యవసర అలర్ట్స్',
    needsAttention: 'శ్రద్ధ అవసరం',
    childAlert: 'పిల్లకు జ్వరం, oxygen తక్కువ: వెంటనే review చేయండి.',
    pregnancyAlert: 'గర్భధారణలో headache మరియు BP ఎక్కువ: referral చూడండి.',
    voiceIntake: 'వాయిస్ ఇన్పుట్',
    records: 'రికార్డులు',
    settings: 'సెట్టింగ్స్',
    syncSettings: 'Sync మరియు settings',
    offlineStatus: 'ఆఫ్లైన్ స్థితి',
    offlineStatusCopy: 'Clinic mode active. Patient data device లో save అవుతుంది.',
    queuedRecords: 'Queued records: 4 - Last sync: morning clinic round',
    language: 'భాష',
    modelStatus: 'Model status',
    modelCached: 'Gemma medical assistant: offline triage కోసం cached',
    guidelinesCached: 'Guidelines pack: WHO-style danger signs cached',
    sqliteReady: 'SQLite: local storage ready',
    returnHome: 'Home కి వెళ్ళండి',
    back: 'వెనక్కి',
    step1: 'Step 1 / 5',
    registerPatient: 'Patient registration',
    registerCopy: 'ప్రారంభానికి అవసరమైన వివరాలు మాత్రమే. Triage తర్వాత మరిన్ని జోడించవచ్చు.',
    patientProfile: 'Patient profile',
    patientName: 'Patient name',
    age: 'వయసు',
    gender: 'Gender: female, male, other, unknown',
    phone: 'Phone number',
    address: 'గ్రామం / address',
    emergencyContact: 'Emergency contact',
    conditions: 'Known conditions, comma separated',
    allergies: 'Allergies, comma separated',
    medications: 'Current medicines, comma separated',
    pregnancyWeeks: 'Pregnancy weeks, if applicable',
    postpartumDays: 'Postpartum days, if applicable',
    registerContinue: 'Register చేసి continue',
    step2: 'Step 2 / 5',
    describeSymptoms: 'లక్షణాలు చెప్పండి',
    voiceScreenCopy: 'ముందు voice ఉపయోగించండి. Noise ఉంటే scan లేదా type చేయండి.',
    dictateSymptoms: 'లక్షణాలు dictate చేయండి',
    demoMode: 'Demo mode',
    nativeMic: 'Native mic',
    useDemoOrType: 'Demo voice లేదా symptoms type చేయండి.',
    listening: 'Native speech listening...',
    demoDictation: 'Demo dictation ఉపయోగిస్తోంది...',
    startSpeaking: 'మాట్లాడటం ప్రారంభించండి',
    demoVoice: 'Demo voice',
    transcriptPlaceholder: 'Dictated transcript ఇక్కడ కనిపిస్తుంది. Analysis ముందు edit చేయండి.',
    analyzeTyped: 'Typed transcript analyze',
    speechSupport: 'Browser మరియు Expo Go demo dictation వాడతాయి. Real microphone కోసం native dev build అవసరం.'
  },
  Bengali: {
    offlineReady: 'অফলাইন প্রস্তুত',
    heroTitle: 'গ্রামীণ স্বাস্থ্যকর্মীদের জন্য দ্রুত ক্লিনিকাল সহায়তা',
    heroCopy: 'লক্ষণ বলুন, নোট scan করুন, ঝুঁকির সংকেত দেখুন, নিরাপদ পরবর্তী পদক্ষেপ নিন.',
    startConsultation: 'পরামর্শ শুরু করুন',
    patientsToday: 'আজকের রোগী',
    urgentAlerts: 'জরুরি সতর্কতা',
    needsAttention: 'মনোযোগ দরকার',
    childAlert: 'শিশুর জ্বর ও অক্সিজেন কম: পরের queue-র আগে দেখুন.',
    pregnancyAlert: 'গর্ভাবস্থায় মাথাব্যথা ও BP বেশি: referral পরীক্ষা করুন.',
    voiceIntake: 'ভয়েস ইনপুট',
    records: 'রেকর্ড',
    settings: 'সেটিংস',
    syncSettings: 'Sync এবং settings',
    offlineStatus: 'অফলাইন অবস্থা',
    offlineStatusCopy: 'Clinic mode active. Patient data device-এ save হচ্ছে.',
    queuedRecords: 'Queued records: 4 - Last sync: morning clinic round',
    language: 'ভাষা',
    modelStatus: 'Model status',
    modelCached: 'Gemma medical assistant: offline triage এর জন্য cached',
    guidelinesCached: 'Guidelines pack: WHO-style danger signs cached',
    sqliteReady: 'SQLite: local storage ready',
    returnHome: 'Home-এ ফিরুন',
    back: 'পিছনে',
    step1: 'Step 1 / 5',
    registerPatient: 'রোগী নিবন্ধন',
    registerCopy: 'শুরু করতে শুধু প্রয়োজনীয় তথ্য দিন. Triage-এর পরে আরও যোগ করা যাবে.',
    patientProfile: 'Patient profile',
    patientName: 'রোগীর নাম',
    age: 'বয়স',
    gender: 'Gender: female, male, other, unknown',
    phone: 'Phone number',
    address: 'গ্রাম / address',
    emergencyContact: 'Emergency contact',
    conditions: 'Known conditions, comma separated',
    allergies: 'Allergies, comma separated',
    medications: 'Current medicines, comma separated',
    pregnancyWeeks: 'Pregnancy weeks, if applicable',
    postpartumDays: 'Postpartum days, if applicable',
    registerContinue: 'Register করে continue',
    step2: 'Step 2 / 5',
    describeSymptoms: 'লক্ষণ বলুন',
    voiceScreenCopy: 'আগে voice ব্যবহার করুন. শব্দ হলে scan বা type করুন.',
    dictateSymptoms: 'লক্ষণ dictate করুন',
    demoMode: 'Demo mode',
    nativeMic: 'Native mic',
    useDemoOrType: 'Demo voice বা symptoms type করুন.',
    listening: 'Native speech listening...',
    demoDictation: 'Demo dictation ব্যবহার হচ্ছে...',
    startSpeaking: 'কথা বলা শুরু করুন',
    demoVoice: 'Demo voice',
    transcriptPlaceholder: 'Dictated transcript এখানে আসবে. Analysis-এর আগে edit করুন.',
    analyzeTyped: 'Typed transcript analyze',
    speechSupport: 'Browser এবং Expo Go demo dictation ব্যবহার করে. Real microphone-এর জন্য native dev build দরকার.'
  }
};

export const appLanguages = Object.keys(translations) as AppLanguage[];

export function t(language: string | undefined, key: TranslationKey) {
  const selected = normalizeLanguage(language);
  return translations[selected][key] || translations.English[key];
}

export function normalizeLanguage(language: string | undefined): AppLanguage {
  return appLanguages.includes(language as AppLanguage) ? language as AppLanguage : 'English';
}
