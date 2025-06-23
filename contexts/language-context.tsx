"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Logout",

    // Home Page
    "home.title": "Jeevan Setu",
    "home.subtitle": "Bridge of Life",
    "home.tagline": "Connecting lives through organ donation",
    "home.description":
      "A secure platform connecting organ donors and recipients across India, saving lives through compassionate care.",
    "home.cta.donor": "Become a Donor",
    "home.cta.recipient": "Find a Match",
    "home.cta.login": "Login to Continue",

    // Auth
    "auth.login.title": "Welcome Back",
    "auth.login.subtitle": "Sign in to continue your journey of giving life",
    "auth.signup.title": "Join Jeevan Setu",
    "auth.signup.subtitle": "Create your account to start saving lives",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.phone": "Phone Number",
    "auth.role": "I want to be a",
    "auth.role.donor": "Organ Donor",
    "auth.role.recipient": "Organ Recipient",
    "auth.terms": "I agree to the privacy policy and medical terms",
    "auth.signin": "Sign In",
    "auth.signup": "Create Account",
    "auth.toggle.signup": "Don't have an account? Sign up",
    "auth.toggle.login": "Already have an account? Sign in",

    // Profile Form
    "profile.title.donor": "Complete Your Donor Profile",
    "profile.title.recipient": "Complete Your Recipient Profile",
    "profile.organ": "Organ Type",
    "profile.blood": "Blood Group",
    "profile.age": "Age",
    "profile.city": "City",
    "profile.state": "State",
    "profile.pincode": "PIN Code",
    "profile.address": "Address",
    "profile.urgency": "Urgency Level",
    "profile.condition": "Medical Condition",
    "profile.hospital": "Hospital Name",
    "profile.save": "Save Profile",

    // Dashboard
    "dashboard.welcome": "Welcome",
    "dashboard.status": "Profile Status",
    "dashboard.matches": "Matches Found",
    "dashboard.documents": "Documents",
    "dashboard.upload": "Upload Documents",

    // Status
    "status.incomplete": "Incomplete",
    "status.pending": "Pending",
    "status.verified": "Verified",
    "status.matched": "Matched",
    "status.rejected": "Rejected",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.view": "View",
    "common.loading": "Loading...",
    "common.error": "Error occurred",
  },
  hi: {
    // Navigation
    "nav.home": "होम",
    "nav.login": "लॉगिन",
    "nav.signup": "साइन अप",
    "nav.dashboard": "डैशबोर्ड",
    "nav.logout": "लॉगआउट",

    // Home Page
    "home.title": "जीवन सेतु",
    "home.subtitle": "जीवन सेतु - Bridge of Life",
    "home.tagline": "अंगदान के माध्यम से जीवन जोड़ना",
    "home.description": "भारत भर में अंगदाताओं और प्राप्तकर्ताओं को जोड़ने वाला एक सुरक्षित मंच, दयालु देखभाल के माध्यम से जीवन बचाना।",
    "home.cta.donor": "दाता बनें",
    "home.cta.recipient": "मैच खोजें",
    "home.cta.login": "जारी रखने के लिए लॉगिन करें",

    // Auth
    "auth.login.title": "वापस स्वागत है",
    "auth.login.subtitle": "जीवन देने की अपनी यात्रा जारी रखने के लिए साइन इन करें",
    "auth.signup.title": "जीवन सेतु में शामिल हों",
    "auth.signup.subtitle": "जीवन बचाना शुरू करने के लिए अपना खाता बनाएं",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.fullName": "पूरा नाम",
    "auth.phone": "फोन नंबर",
    "auth.role": "मैं बनना चाहता हूं",
    "auth.role.donor": "अंगदाता",
    "auth.role.recipient": "अंग प्राप्तकर्ता",
    "auth.terms": "मैं गोपनीयता नीति और चिकित्सा शर्तों से सहमत हूं",
    "auth.signin": "साइन इन",
    "auth.signup": "खाता बनाएं",
    "auth.toggle.signup": "खाता नहीं है? साइन अप करें",
    "auth.toggle.login": "पहले से खाता है? साइन इन करें",

    // Profile Form
    "profile.title.donor": "अपनी दाता प्रोफ़ाइल पूरी करें",
    "profile.title.recipient": "अपनी प्राप्तकर्ता प्रोफ़ाइल पूरी करें",
    "profile.organ": "अंग प्रकार",
    "profile.blood": "रक्त समूह",
    "profile.age": "आयु",
    "profile.city": "शहर",
    "profile.state": "राज्य",
    "profile.pincode": "पिन कोड",
    "profile.address": "पता",
    "profile.urgency": "तात्कालिकता स्तर",
    "profile.condition": "चिकित्सा स्थिति",
    "profile.hospital": "अस्पताल का नाम",
    "profile.save": "प्रोफ़ाइल सेव करें",

    // Dashboard
    "dashboard.welcome": "स्वागत है",
    "dashboard.status": "प्रोफ़ाइल स्थिति",
    "dashboard.matches": "मैच मिले",
    "dashboard.documents": "दस्तावेज़",
    "dashboard.upload": "दस्तावेज़ अपलोड करें",

    // Status
    "status.incomplete": "अधूरा",
    "status.pending": "लंबित",
    "status.verified": "सत्यापित",
    "status.matched": "मैच",
    "status.rejected": "अस्वीकृत",

    // Common
    "common.save": "सेव करें",
    "common.cancel": "रद्द करें",
    "common.edit": "संपादित करें",
    "common.view": "देखें",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि हुई",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("jeevan-setu-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("jeevan-setu-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
