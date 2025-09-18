'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { FaTiktok, FaSnapchatGhost, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface HomeImage {
  id: string
  url: string
}

export default function Home() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()
  const [homeImages, setHomeImages] = useState<HomeImage[]>([])
  const [imagesLoading, setImagesLoading] = useState(true)

  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/dashboard')
    }
  }, [currentUser, loading, router])

  // Fetch home screen images from Firestore
  useEffect(() => {
    const fetchHomeImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'HomeScreenImages'))
        const images: HomeImage[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.url) {
            images.push({
              id: doc.id,
              url: data.url
            })
          }
        })
        setHomeImages(images)
      } catch (error) {
        console.error('Error fetching home images:', error)
        // Fallback to empty array - will show default gradients
        setHomeImages([])
      } finally {
        setImagesLoading(false)
      }
    }

    fetchHomeImages()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/logo.png" alt="DrMaha Logo" width={160} height={160} />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#e4b8ae] mb-4">
          Grad To Dentist
        </h1>
        
        <h2 className="text-xl text-[#e4b8ae] mb-8">
          DR.MAHA NIZAR AL SEHLI
        </h2>

        {/* Arabic Description */}
        <div className="max-w-4xl text-center mb-12 px-4">
          <p className="text-gray-700 leading-relaxed text-lg" dir="rtl">
           هذا الكورس مصمم لحديثي التخرج والعاطلين عن العمل لخوض حياة مهنية مليئة بثقة وكفاءة عالية، ابتداءا من صنع السيرة الذاتية الى القبول بالوظيفة ومابعد القبول حيث يجمع بين الجوانب النظرية والعملية في بيئة العمل في القطاع الخاص، كما نقدم تدريبًا عملًيا شاملاً على المهارات السريرية واساسيات التعامل مع المرضى، بالاضافة الى التوعية حول الأخطاء الطبية وأساليب تطوير الذات
          </p>
        </div>

        {/* Dynamic Images from Firebase */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {imagesLoading ? (
            // Loading state for images
            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-48 h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : homeImages.length > 0 ? (
            // Display Firebase images
            homeImages.map((image, index) => (
              <div key={image.id} className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={image.url}
                  alt={`Dental Image ${index + 1}`}
                  width={192}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            // Fallback to original gradient boxes if no Firebase images
            <div className="flex gap-6">
              {[
                'from-blue-200 to-blue-300',
                'from-teal-200 to-teal-300', 
                'from-cyan-200 to-cyan-300'
              ].map((gradient, index) => (
                <div key={index} className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="text-4xl">🦷</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons - Clean and smaller with white text */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/login">
            <button className="w-full bg-[#e4b8ae] text-white font-medium py-3 px-8 rounded-lg text-base hover:bg-[#d4a89e] transition-colors">
              Login
            </button>
          </Link>
          
          <Link href="/signup">
            <button className="w-full bg-[#e4b8ae] text-white font-medium py-3 px-8 rounded-lg text-base hover:bg-[#d4a89e] transition-colors">
              Sign Up
            </button>
          </Link>
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
                className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FaWhatsapp className="text-base" />
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