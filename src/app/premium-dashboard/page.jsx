'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipForward, 
  SkipBack,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  MessageCircle
} from 'lucide-react';

export default function PremiumDashboard() {
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Comments states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const { currentUser, userDoc, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    if (!userDoc?.isPremium) {
      router.push('/course-details');
      return;
    }
    
    fetchCourses();
  }, [currentUser, userDoc, router]);

  async function fetchCourses() {
    try {
      console.log('Fetching courses for premium user...');
      const querySnapshot = await getDocs(collection(db, 'Course1'));
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by order field
      coursesData.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }
        return a.id.localeCompare(b.id);
      });
      
      setCourses(coursesData);
      
      // Set first course as default
      if (coursesData.length > 0) {
        await loadVideo(coursesData[0]);
      }
    } catch (error) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadVideo(course) {
    if (!course.url) {
      setError('Video URL not found for this course');
      console.error('Course missing URL:', course);
      return;
    }
    
    console.log('Loading video for course:', course.title, 'URL:', course.url);
    setVideoLoading(true);
    setCurrentCourse(course);
    setIsPlaying(false);
    setError('');
    
    try {
      let finalUrl = course.url;
      
      // If it's a Firebase Storage path, get the download URL
      if (course.url.includes('firebasestorage.googleapis.com') || course.url.startsWith('gs://')) {
        console.log('Getting Firebase Storage download URL...');
        const videoRef = ref(storage, course.url);
        finalUrl = await getDownloadURL(videoRef);
        console.log('Download URL obtained:', finalUrl);
      }
      
      setVideoUrl(finalUrl);
      setCurrentTime(0);
      
      // Load comments for this video
      loadComments(course.id);
    } catch (error) {
      console.error('Error loading video:', error);
      setError('Failed to load video: ' + error.message);
    } finally {
      setVideoLoading(false);
    }
  }

  // Comments functions
  function loadComments(courseId) {
    if (!courseId) return;
    
    setCommentsLoading(true);
    
    // Create real-time listener for comments
    const commentsQuery = query(
      collection(db, 'VideoComments'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
      setCommentsLoading(false);
    }, (error) => {
      console.error('Error loading comments:', error);
      setCommentsLoading(false);
    });
    
    // Store unsubscribe function to clean up later
    return unsubscribe;
  }

  async function submitComment() {
    if (!newComment.trim() || !currentCourse || !currentUser || !userDoc) return;
    
    setSubmittingComment(true);
    
    try {
      await addDoc(collection(db, 'VideoComments'), {
        courseId: currentCourse.id,
        userId: currentUser.uid,
        userName: userDoc.firstName + ' ' + userDoc.lastName,
        userEmail: currentUser.email,
        comment: newComment.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  }

  function formatCommentDate(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  function handlePlayPause() {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  }

  function handleSeek(e) {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  }

  function handleVolumeChange(e) {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }

  function toggleMute() {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  }

  function skipForward() {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
  }

  function skipBackward() {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function handleLogout() {
    try {
      await logout();
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ccc5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7ccc5] flex flex-col md:flex-row">
      {/* Sidebar - Course List */}
      <div className={`${showSidebar ? 'block' : 'hidden'} w-full md:w-80 bg-[#e4b8ae] border-b md:border-r border-[#d4a89e] flex flex-col md:relative absolute top-0 left-0 right-0 bottom-0 z-20`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#d4a89e] flex items-center justify-between">
          <h2 className="text-white font-semibold">Course Episodes</h2>
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden p-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-white hover:text-gray-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Course List */}
        <div className="flex-1 overflow-y-auto">
          {courses.map((course, index) => (
            <div
              key={course.id}
              onClick={() => {
                loadVideo(course);
                // Close sidebar on mobile after selecting video
                if (window.innerWidth < 768) {
                  setShowSidebar(false);
                }
              }}
              className={`p-3 md:p-4 border-b border-[#d4a89e] cursor-pointer hover:bg-[#d4a89e] transition-colors ${
                currentCourse?.id === course.id ? 'bg-[#d4a89e] border-l-4 border-l-white' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-16 md:w-20 h-10 md:h-12 bg-[#c49289] rounded overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-4 md:w-5 h-4 md:h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium mb-1 line-clamp-2">
                    {course.order ? `${course.order}. ` : `${index + 1}. `}
                    {course.title}
                  </h3>
                  <p className="text-gray-100 text-xs mb-1 line-clamp-2 hidden md:block">
                    {course.description}
                  </p>
                  <span className="text-gray-200 text-xs">
                    {course.duration || '00:00'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="bg-[#e4b8ae] p-4 flex items-center justify-between border-b border-[#d4a89e]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {showSidebar ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
            <h1 className="text-white font-medium text-sm md:text-base truncate">
              {currentCourse ? currentCourse.title : 'Select a course'}
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-white hover:text-gray-200 transition-colors md:hidden"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-black relative aspect-video" ref={containerRef}>
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center text-white p-4">
                <p className="mb-2">Error loading video</p>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            </div>
          )}
          
          {currentCourse && videoUrl && !error ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onLoadedMetadata={handleTimeUpdate}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                playsInline
                preload="metadata"
              />
              
              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4">
                {/* Progress Bar */}
                <div className="mb-2 md:mb-4">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #e4b8ae ${(currentTime / duration) * 100 || 0}%, #4b5563 ${(currentTime / duration) * 100 || 0}%)`
                    }}
                  />
                  <div className="flex justify-between text-white text-xs md:text-sm mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2 md:gap-4">
                    <button
                      onClick={skipBackward}
                      className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <SkipBack className="w-4 md:w-6 h-4 md:h-6" />
                    </button>
                    
                    <button
                      onClick={handlePlayPause}
                      className="p-2 md:p-3 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 md:w-8 h-6 md:h-8" /> : <Play className="w-6 md:w-8 h-6 md:h-8" />}
                    </button>
                    
                    <button
                      onClick={skipForward}
                      className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <SkipForward className="w-4 md:w-6 h-4 md:h-6" />
                    </button>
                    
                    <button
                      onClick={toggleMute}
                      className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 md:w-6 h-4 md:h-6" /> : <Volume2 className="w-4 md:w-6 h-4 md:h-6" />}
                    </button>
                    
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-12 md:w-20"
                    />
                  </div>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors hidden md:block"
                  >
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-4">
                {videoLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 md:h-12 w-8 md:w-12 border-b-2 border-[#e4b8ae] mx-auto mb-4"></div>
                    <p className="text-white text-sm md:text-base">Loading video...</p>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm md:text-base">Select a course from the sidebar to start watching</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Video Details and Comments Section */}
        {currentCourse && (
          <div className="bg-[#f7ccc5] p-4 md:p-6 flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
              {/* Video Details */}
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {currentCourse.title}
                </h2>
                
                <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {currentCourse.duration || '00:00'}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {currentCourse.description || 'No description available for this episode.'}
                </p>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Comments Header */}
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-[#e4b8ae]" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Comments ({comments.length})
                    </h3>
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-3 bg-gray-50 p-3 md:p-4 rounded-lg">
                    <div className="w-8 md:w-10 h-8 md:h-10 bg-[#e4b8ae] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xs md:text-sm">
                        {userDoc?.firstName?.charAt(0)}{userDoc?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e4b8ae] focus:border-transparent text-gray-900 placeholder-gray-500 bg-white shadow-sm text-sm md:text-base"
                        onKeyPress={(e) => e.key === 'Enter' && submitComment()}
                      />
                      <button
                        onClick={submitComment}
                        disabled={!newComment.trim() || submittingComment}
                        className="px-4 md:px-6 py-2 md:py-3 bg-[#e4b8ae] text-white rounded-lg hover:bg-[#d4a89e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm md:text-base"
                      >
                        {submittingComment ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span className="font-medium">Post</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="max-h-64 md:max-h-96 overflow-y-auto">
                  {commentsLoading ? (
                    <div className="p-4 md:p-6 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e4b8ae] mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading comments...</p>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4 p-4 md:p-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-6 md:w-8 h-6 md:h-8 bg-[#e4b8ae] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium text-xs">
                              {comment.userName?.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {comment.userName}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {formatCommentDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {comment.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 md:p-6 text-center">
                      <MessageCircle className="w-8 md:w-12 h-8 md:h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2 text-sm md:text-base">No comments yet</p>
                      <p className="text-gray-400 text-xs md:text-sm">Be the first to share your thoughts on this episode!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}