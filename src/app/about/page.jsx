'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaTiktok, FaSnapchatGhost, FaInstagram, FaYoutube, FaWhatsapp, FaArrowLeft } from 'react-icons/fa'

export default function AboutPage() {
  const socialLinks = [
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@drmahasehli?_t=ZS-8zoS33seLHU&_r=1',
      icon: FaTiktok,
      color: 'hover:text-black'
    },
    {
      name: 'Snapchat', 
      url: 'https://snapchat.com/t/7WXntdsQ',
      icon: FaSnapchatGhost,
      color: 'hover:text-yellow-400'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/drmahasehli?igsh=ZWRmdDdwM3ZoYmM3',
      icon: FaInstagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@dr_maha_se7ly?si=WRebrJJrgAg8ke72',
      icon: FaYoutube,
      color: 'hover:text-red-500'
    }
  ]

  const courseContent = [
    {
      title: "الفصل الأول والثاني",
      topics: [
        "تجهيز السيرة الذاتية وكيفية نشرها",
        "طرق البحث عن وظيفة",
        "اختبار المقابلة الشخصية والأسئلة الشائعة",
        "العمل كمساعد طبيب أسنان",
        "الامتيازات السريرية",
        "الفرق بين العيادات الخاصة والحكومية",
        "شركات التأمين في عيادات الأسنان",
        "العقد الوظيفي ما المتوقع؟ - معنى النسبة % في العقد",
        "ماهو التارجت في العيادة وما أهميته؟",
        "التفاتيش الصحية الدورية"
      ]
    },
    {
      title: "الفصل الثالث (عملي)",
      topics: [
        "الكشف والتشخيص لكل الحالات الشائعة وكيفية حلها والتعامل مع المرضى في العيادات الخاصة مع جداول تسهيلية وواضحة",
        "تجهيزات وتحضيرات العيادة بالتفصيل Armamentariums وكل ماتحتاج تطلبه شهريًا للعيادة",
        "Local Anaesthesia and Rubber dam",
        "الدنتال سيلنت والفلورايد كيف ومتى؟ Sealants & Fluoride",
        "علاج حشوات تجميلية لكلاس 2,3,4,5 وأهم الأمور التي تتبعها",
        "علاج العصب بجهاز الروتاري بالتفصيل",
        "علاج التهابات اللثة (التنظيف) / التبييض",
        "تحويل المرضى",
        "الوصفات الطبية"
      ]
    },
    {
      title: "الفصل الرابع",
      topics: [
        "متراوح أسعار الخدمات العلاجية في العيادات الخاصة",
        "الأخطاء الشائعة بين المستجدين!",
        "التأمين ضد الأخطاء المهنية!",
        "الرخصة المهنية وتجديدها وتطويرها!"
      ]
    }
  ]

  const cases = [
    { name: 'case1', title: 'Case 1' },
    { name: 'case2', title: 'Case 2' },
    { name: 'case3', title: 'Case 3' },
    { name: 'case4', title: 'Case 4' },
    { name: 'case5', title: 'Case 5' },
    { name: 'case6', title: 'Case 6' },
    { name: 'case7', title: 'Case 7' },
    { name: 'case8', title: 'Case 8' }
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#E4B8AE] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link 
            href="/"
            className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
          >
            <FaArrowLeft className="text-lg" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* About Me Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-[#e4b8ae] mb-8">About Dr. Maha</h1>
            
            {/* About Me Image */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-3xl">
                <Image 
                  src="/aboutme.jpeg" 
                  alt="About Dr. Maha"
                  width={800}
                  height={600}
                  className="rounded-lg shadow-lg w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Course Content Sections */}
          <div className="space-y-12 mb-16">
            {courseContent.map((section, index) => (
              <div key={index} className="bg-[#F7CCC5] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6 text-center" dir="rtl">
                  {section.title}
                </h2>
                <ul className="space-y-3" dir="rtl">
                  {section.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-start gap-3 text-white">
                      <span className="text-[#e4b8ae] text-lg">•</span>
                      <span className="leading-relaxed">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Clinical Cases Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#e4b8ae] text-center mb-8">
              Some of Dr. Maha's Clinical Cases
            </h2>
            
            {/* Cases Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {cases.map((caseItem, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-full h-48 mb-4 bg-[#E4B8AE] rounded-lg flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <Image 
                      src={`/${caseItem.name}.png`}
                      alt={caseItem.title}
                      width={200}
                      height={192}
                      className="rounded object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback for missing images */}
                    <div className="hidden w-full h-full bg-[#E4B8AE] rounded-lg items-center justify-center">
                      <span className="text-white text-3xl">🦷</span>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-800">{caseItem.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#E4B8AE] border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            
            {/* Brand & About */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">DrMaha</h3>
              <Link 
                href="/about"
                className="text-sm text-white hover:text-gray-200 underline transition-colors"
              >
                About Me
              </Link>
            </div>

            {/* WhatsApp Contact */}
            <div className="text-center">
              <a 
                href="https://wa.me/966542164943"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
              >
                <FaWhatsapp className="text-lg" />
                <span className="font-medium">+966 54 216 4943</span>
              </a>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-700 ${social.color} transition-all duration-200 shadow-sm hover:shadow-md`}
                  >
                    <IconComponent className="text-base" />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-white">
                © {new Date().getFullYear()} DrMaha
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}