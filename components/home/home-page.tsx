"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Heart,
  Users,
  Shield,
  Award,
  Languages,
  UserPlus,
  Search,
  FileCheck,
  Stethoscope,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
  LifeBuoy,
  UserCheck,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getRedirectPath } from "@/lib/auth-utils"

export function HomePage() {
  const { language, setLanguage, t } = useLanguage()
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  // Navigate to login/signup pages
  const handleNavigate = (page: "login" | "signup") => {
    router.push(`/${page}`)
  }

  const howItWorksSteps = [
    {
      icon: UserPlus,
      title: language === "en" ? "Register & Create Profile" : "पंजीकरण और प्रोफ़ाइल बनाएं",
      description:
        language === "en"
          ? "Sign up as a donor or recipient and complete your detailed medical profile with accurate information."
          : "दाता या प्राप्तकर्ता के रूप में साइन अप करें और सटीक जानकारी के साथ अपनी विस्तृत चिकित्सा प्रोफ़ाइल पूरी करें।",
      step: "01",
    },
    {
      icon: FileCheck,
      title: language === "en" ? "Document Verification" : "दस्तावेज़ सत्यापन",
      description:
        language === "en"
          ? "Upload required documents (ID proof, medical reports) for verification by our medical team."
          : "हमारी चिकित्सा टीम द्वारा सत्यापन के लिए आवश्यक दस्तावेज़ (आईडी प्रूफ, मेडिकल रिपोर्ट) अपलोड करें।",
      step: "02",
    },
    {
      icon: Stethoscope,
      title: language === "en" ? "Medical Review" : "चिकित्सा समीक्षा",
      description:
        language === "en"
          ? "Qualified doctors review and verify your profile to ensure medical compatibility and authenticity."
          : "योग्य डॉक्टर चिकित्सा संगतता और प्रामाणिकता सुनिश्चित करने के लिए आपकी प्रोफ़ाइल की समीक्षा और सत्यापन करते हैं।",
      step: "03",
    },
    {
      icon: Search,
      title: language === "en" ? "Smart Matching" : "स्मार्ट मैचिंग",
      description:
        language === "en"
          ? "Our algorithm matches donors and recipients based on blood type, organ compatibility, location, and urgency."
          : "हमारा एल्गोरिदम रक्त प्रकार, अंग संगतता, स्थान और तात्कालिकता के आधार पर दाताओं और प्राप्तकर्ताओं का मिलान करता है।",
      step: "04",
    },
    {
      icon: Heart,
      title: language === "en" ? "Life-Saving Connection" : "जीवन रक्षक संपर्क",
      description:
        language === "en"
          ? "When a match is found, both parties are connected through our secure platform with medical team coordination."
          : "जब कोई मैच मिलता है, तो दोनों पक्षों को चिकित्सा टीम के समन्वय के साथ हमारे सुरक्षित प्लेटफॉर्म के माध्यम से जोड़ा जाता है।",
      step: "05",
    },
  ]

  const whyNeededStats = [
    {
      icon: AlertTriangle,
      title: language === "en" ? "Critical Shortage" : "गंभीर कमी",
      description:
        language === "en"
          ? "Over 500,000 people in India are waiting for organ transplants, but only 0.01% of the population are registered donors."
          : "भारत में 5 लाख से अधिक लोग अंग प्रत्यारोपण की प्रतीक्षा कर रहे हैं, लेकिन केवल 0.01% जनसंख्या पंजीकृत दाता हैं।",
    },
    {
      icon: Clock,
      title: language === "en" ? "Time is Critical" : "समय महत्वपूर्ण है",
      description:
        language === "en"
          ? "Every day, 20 people die in India due to lack of organ availability. Early registration and matching can save lives."
          : "अंगों की अनुपलब्धता के कारण भारत में हर दिन 20 लोगों की मृत्यु हो जाती है। जल्दी पंजीकरण और मैचिंग जीवन बचा सकती है।",
    },
    {
      icon: LifeBuoy,
      title: language === "en" ? "Life-Changing Impact" : "जीवन बदलने वाला प्रभाव",
      description:
        language === "en"
          ? "One organ donor can save up to 8 lives and enhance the lives of 50+ people through tissue donation."
          : "एक अंगदाता 8 जीवन बचा सकता है और ऊतक दान के माध्यम से 50+ लोगों के जीवन को बेहतर बना सकता है।",
    },
  ]

  const features = [
    {
      icon: Shield,
      title: language === "en" ? "Medical Grade Security" : "चिकित्सा ग्रेड सुरक्षा",
      description:
        language === "en"
          ? "Your medical data is protected with hospital-level security standards and encryption."
          : "आपका चिकित्सा डेटा अस्पताल-स्तरीय सुरक्षा मानकों और एन्क्रिप्शन के साथ सुरक्षित है।",
    },
    {
      icon: UserCheck,
      title: language === "en" ? "Expert Medical Team" : "विशेषज्ञ चिकित्सा टीम",
      description:
        language === "en"
          ? "All profiles are verified by qualified doctors and medical professionals."
          : "सभी प्रोफाइल योग्य डॉक्टरों और चिकित्सा पेशेवरों द्वारा सत्यापित हैं।",
    },
    {
      icon: Award,
      title: language === "en" ? "Trusted Platform" : "विश्वसनीय मंच",
      description:
        language === "en"
          ? "Certified and compliant with Indian medical regulations and data protection laws."
          : "भारतीय चिकित्सा नियमों और डेटा सुरक्षा कानूनों के साथ प्रमाणित और अनुपालित।",
    },
  ]

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: language === "en" ? "What is Jeevan Setu?" : "जीवन सेतु क्या है?",
          answer:
            language === "en"
              ? "Jeevan Setu is a secure digital platform that connects organ donors and recipients across India. We use advanced matching algorithms and medical verification to facilitate life-saving organ transplants."
              : "जीवन सेतु एक सुरक्षित डिजिटल प्लेटफॉर्म है जो भारत भर में अंगदाताओं और प्राप्तकर्ताओं को जोड़ता है। हम जीवन रक्षक अंग प्रत्यारोपण की सुविधा के लिए उन्नत मैचिंग एल्गोरिदम और चिकित्सा सत्यापन का उपयोग करते हैं।",
        },
        {
          question: language === "en" ? "Who can use this platform?" : "इस प्लेटफॉर्म का उपयोग कौन कर सकता है?",
          answer:
            language === "en"
              ? "Anyone above 18 years can register as an organ donor. Recipients of any age can register with proper medical documentation. Medical professionals can also join to assist with verification."
              : "18 वर्ष से अधिक आयु का कोई भी व्यक्ति अंगदाता के रूप में पंजीकरण कर सकता है। किसी भी आयु के प्राप्तकर्ता उचित चिकित्सा दस्तावेज के साथ पंजीकरण कर सकते हैं। चिकित्सा पेशेवर भी सत्यापन में सहायता के लिए शामिल हो सकते हैं।",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: language === "en" ? "How is my personal data protected?" : "मेरा व्यक्तिगत डेटा कैसे सुरक्षित है?",
          answer:
            language === "en"
              ? "We use bank-level encryption and follow strict medical data protection protocols. Your information is only shared with verified medical professionals and matched parties with your consent."
              : "हम बैंक-स्तरीय एन्क्रिप्शन का उपयोग करते हैं और सख्त चिकित्सा डेटा सुरक्षा प्रोटोकॉल का पालन करते हैं। आपकी जानकारी केवल आपकी सहमति से सत्यापित चिकित्सा पेशेवरों और मैच किए गए पक्षों के साथ साझा की जाती है।",
        },
        {
          question:
            language === "en"
              ? "Can I control who sees my information?"
              : "क्या मैं नियंत्रित कर सकता हूं कि मेरी जानकारी कौन देखता है?",
          answer:
            language === "en"
              ? "Yes, you have complete control over your privacy settings. You can choose what information to share and with whom. All data sharing requires your explicit consent."
              : "हां, आपका अपनी गोपनीयता सेटिंग्स पर पूरा नियंत्रण है। आप चुन सकते हैं कि कौन सी जानकारी साझा करनी है और किसके साथ। सभी डेटा साझाकरण के लिए आपकी स्पष्ट सहमति की आवश्यकता होती है।",
        },
      ],
    },
    {
      category: "Medical Process",
      questions: [
        {
          question: language === "en" ? "How does the matching process work?" : "मैचिंग प्रक्रिया कैसे काम करती है?",
          answer:
            language === "en"
              ? "Our algorithm considers blood type compatibility, organ type, age group, geographical proximity, and medical urgency. All matches are reviewed by medical professionals before notification."
              : "हमारा एल्गोरिदम रक्त प्रकार संगतता, अंग प्रकार, आयु समूह, भौगोलिक निकटता और चिकित्सा तात्कालिकता पर विचार करता है। अधिसूचना से पहले सभी मैचों की चिकित्सा पेशेवरों द्वारा समीक्षा की जाती है।",
        },
        {
          question: language === "en" ? "What documents do I need to provide?" : "मुझे कौन से दस्तावेज़ प्रदान करने होंगे?",
          answer:
            language === "en"
              ? "You'll need government-issued ID proof (Aadhaar/PAN/Passport), blood group report, and relevant medical reports. Recipients may need additional medical documentation from their treating physician."
              : "आपको सरकारी आईडी प्रूफ (आधार/पैन/पासपोर्ट), ब्लड ग्रुप रिपोर्ट और संबंधित मेडिकल रिपोर्ट की आवश्यकता होगी। प्राप्तकर्ताओं को अपने इलाज करने वाले चिकित्सक से अतिरिक्त चिकित्सा दस्तावेज की आवश्यकता हो सकती है।",
        },
      ],
    },
  ]

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 scroll-smooth">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-full mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t("home.title")}</h1>
                <p className="text-xs text-gray-500">{t("home.subtitle")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-gray-500" />
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className="h-8 px-3"
                >
                  EN
                </Button>
                <Button
                  variant={language === "hi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("hi")}
                  className="h-8 px-3"
                >
                  हिं
                </Button>
              </div>

              {/* Auth Buttons */}
              {!user ? (
                <>
                  <Button onClick={() => handleNavigate("login")} variant="outline">
                    {t("nav.login")}
                  </Button>
                  <Button onClick={() => handleNavigate("signup")} className="bg-blue-600 hover:bg-blue-700">
                    {t("nav.signup")}
                  </Button>
                </>
              ) : (
                <Button onClick={() => router.push(getRedirectPath(profile))} className="bg-blue-600 hover:bg-blue-700">
                  {t("nav.dashboard")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-6">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">{t("home.title")}</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2 font-medium">{t("home.subtitle")}</p>
            <p className="text-lg text-gray-600 mb-8">{t("home.tagline")}</p>
          </div>

          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">{t("home.description")}</p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={() => handleNavigate("signup")}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out transform"
            >
              <Heart className="h-5 w-5 mr-2" />
              {t("home.cta.donor")}
            </Button>
            <Button
              onClick={() => handleNavigate("signup")}
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out transform font-medium"
            >
              <Users className="h-5 w-5 mr-2" />
              {t("home.cta.recipient")}
            </Button>
          </div>
        </div>
      </section>

      {/* How Jeevan Setu Works Section */}
      <section className="py-20 bg-white animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === "en" ? "How Jeevan Setu Works" : "जीवन सेतु कैसे काम करता है"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === "en"
                ? "Our platform simplifies the organ donation process through a secure, step-by-step approach that prioritizes safety and compatibility."
                : "हमारा प्लेटफॉर्म एक सुरक्षित, चरणबद्ध दृष्टिकोण के माध्यम से अंगदान प्रक्रिया को सरल बनाता है जो सुरक्षा और संगतता को प्राथमिकता देता है।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <Card
                key={index}
                className="relative overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <CardHeader className="text-center pb-4">
                  <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full mb-4 mx-auto">
                    <step.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Jeevan Setu is Needed Section */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-orange-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Why Jeevan Setu is Needed" : "जीवन सेतु की आवश्यकता क्यों है"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === "en"
                ? "India faces a critical organ shortage crisis. Every day, lives are lost due to the lack of available organs and inefficient matching systems."
                : "भारत एक गंभीर अंग की कमी के संकट का सामना कर रहा है। उपलब्ध अंगों की कमी और अक्षम मैचिंग सिस्टम के कारण हर दिन जीवन खो जाते हैं।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {whyNeededStats.map((stat, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out border-l-4 border-red-500"
              >
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
                    <stat.icon className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-lg text-red-800">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700">{stat.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Impact Statement */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center">
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "en" ? "The Power of One Decision" : "एक निर्णय की शक्ति"}
              </h3>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                {language === "en"
                  ? "Your decision to become an organ donor can transform multiple lives. Through Jeevan Setu, we're building a bridge between hope and healing, connecting those who can give with those who desperately need."
                  : "अंगदाता बनने का आपका निर्णय कई जीवन को बदल सकता है। जीवन सेतु के माध्यम से, हम आशा और उपचार के बीच एक पुल का निर्माण कर रहे हैं, जो दे सकते हैं उन्हें उनसे जोड़ रहे हैं जिन्हें बेहद जरूरत है।"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Why Choose Jeevan Setu?" : "जीवन सेतु क्यों चुनें?"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === "en"
                ? "Our platform combines cutting-edge technology with compassionate care to create meaningful connections."
                : "हमारा प्लेटफॉर्म अर्थपूर्ण संपर्क बनाने के लिए अत्याधुनिक तकनीक को दयालु देखभाल के साथ जोड़ता है।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 mx-auto">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Organ Donation Education Videos Section */}
      <section className="py-20 bg-blue-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Check these videos once to know about organ donation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {/* Sample text: Replace with your own description */}
              Learn more about the importance, process, and impact of organ donation through these informative videos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map((num) => (
              <div key={num} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                <div className="aspect-w-16 aspect-h-9 w-full">
                  {/* Replace src with actual video links */}
                  <iframe
                    src="https://www.youtube.com/embed/sample_video_link"
                    title={`Sample Video Title ${num}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-48 md:h-56 lg:h-64"
                  ></iframe>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-semibold mb-2">Sample Video Title {num}</h3>
                  <p className="text-gray-600 text-sm mb-2">Sample description for video {num}. Replace with actual content about organ donation.</p>
                  <a
                    href="https://www.youtube.com/watch?v=sample_video_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Frequently Asked Questions" : "अक्सर पूछे जाने वाले प्रश्न"}
            </h2>
            <p className="text-xl text-gray-600">
              {language === "en"
                ? "Find answers to common questions about organ donation and our platform."
                : "अंगदान और हमारे प्लेटफॉर्म के बारे में सामान्य प्रश्नों के उत्तर खोजें।"}
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  {category.category}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
                    >
                      <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                        <span className="font-medium text-gray-900">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Heart className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === "en" ? "Ready to Save Lives?" : "जीवन बचाने के लिए तैयार हैं?"}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {language === "en"
              ? "Join thousands of Indians who are making a difference through organ donation. Every registration brings hope to someone in need."
              : "हजारों भारतीयों में शामिल हों जो अंगदान के माध्यम से बदलाव ला रहे हैं। हर पंजीकरण किसी जरूरतमंद के लिए आशा लाता है।"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleNavigate("signup")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform"
            >
              {language === "en" ? "Register as Donor" : "दाता के रूप में पंजीकरण करें"}
            </Button>
            <Button
              onClick={() => handleNavigate("signup")}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 hover:scale-105 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform"
            >
              {language === "en" ? "Find a Match" : "मैच खोजें"}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-900 text-white animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Phone className="h-8 w-8 mx-auto mb-4 text-blue-400" />
              <h3 className="font-semibold mb-2">{language === "en" ? "24/7 Support" : "24/7 सहायता"}</h3>
              <p className="text-gray-400">+91 1800-XXX-XXXX</p>
            </div>
            <div className="text-center">
              <Mail className="h-8 w-8 mx-auto mb-4 text-blue-400" />
              <h3 className="font-semibold mb-2">{language === "en" ? "Email Support" : "ईमेल सहायता"}</h3>
              <p className="text-gray-400">support@jeevansetu.org</p>
            </div>
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-4 text-blue-400" />
              <h3 className="font-semibold mb-2">{language === "en" ? "Nationwide Service" : "राष्ट्रव्यापी सेवा"}</h3>
              <p className="text-gray-400">{language === "en" ? "All States & UTs" : "सभी राज्य और केंद्र शासित प्रदेश"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-full mr-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t("home.title")}</h3>
                  <p className="text-gray-400 text-sm">{t("home.subtitle")}</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                {language === "en"
                  ? "Connecting lives through organ donation across India with compassion, security, and medical excellence."
                  : "दया, सुरक्षा और चिकित्सा उत्कृष्टता के साथ भारत भर में अंगदान के माध्यम से जीवन जोड़ना।"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{language === "en" ? "Quick Links" : "त्वरित लिंक"}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "About Us" : "हमारे बारे में"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "How It Works" : "यह कैसे काम करता है"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "Success Stories" : "सफलता की कहानियां"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "Contact" : "संपर्क"}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{language === "en" ? "Support" : "सहायता"}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "Help Center" : "सहायता केंद्र"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "Privacy Policy" : "गोपनीयता नीति"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "Terms of Service" : "सेवा की शर्तें"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {language === "en" ? "Medical Terms" : "चिकित्सा शर्तें"}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Jeevan Setu. {language === "en" ? "All rights reserved." : "सभी अधिकार सुरक्षित।"}</p>
          </div>
        </div>
      </footer>


    </div>
  )
}
