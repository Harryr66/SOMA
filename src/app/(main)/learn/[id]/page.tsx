'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  Users, 
  Clock, 
  Play, 
  Award, 
  BookOpen, 
  MessageCircle, 
  Heart, 
  Share2, 
  Download,
  CheckCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Facebook
} from 'lucide-react';
import Link from 'next/link';
import { usePlaceholder } from '@/hooks/use-placeholder';

// Mock course data - in real app, this would come from API
const mockCourse = {
  id: '1',
  title: 'Master Oil Painting Techniques',
  instructor: {
    id: 'instructor-1',
    name: 'Elena Petrova',
    avatar: '',
    bio: 'Professional oil painter with 15+ years of experience. Elena has exhibited in galleries across Europe and North America, with her work featured in prestigious art publications.',
    rating: 4.9,
    students: 2847,
    courses: 12,
    verified: true,
    location: 'Paris, France',
    website: 'https://elenapetrova.com',
    socialLinks: {
      instagram: '@elenapetrova_art',
      twitter: '@elenapetrova',
      youtube: 'Elena Petrova Art',
      facebook: 'Elena Petrova Artist'
    }
  },
  description: 'Learn advanced oil painting techniques from a professional artist with 15+ years of experience. This comprehensive course covers everything from color theory to brush techniques, composition, and lighting.',
  longDescription: `This comprehensive oil painting masterclass is designed for intermediate to advanced artists who want to refine their techniques and develop their own artistic voice. 

You'll learn:
• Advanced color theory and mixing techniques
• Professional brush handling and stroke techniques
• Composition principles for compelling artworks
• Lighting and shadow techniques
• Texture creation and surface effects
• Varnishing and finishing techniques
• Building a cohesive body of work

The course includes live demonstrations, step-by-step tutorials, and personalized feedback on your work.`,
  thumbnail: '',
  price: 89.99,
  originalPrice: 120.00,
  currency: 'USD',
  rating: 4.8,
  reviewCount: 324,
  category: 'Painting',
  subcategory: 'Oil Painting',
  difficulty: 'Intermediate',
  duration: '8 weeks',
  format: 'Self-Paced',
  students: 1247,
  lessons: 24,
  isOnSale: true,
  isNew: false,
  isFeatured: true,
  tags: ['oil-painting', 'techniques', 'masterclass'],
  skills: ['Color Theory', 'Brush Techniques', 'Composition', 'Lighting'],
  curriculum: [
    {
      week: 1,
      title: 'Introduction to Oil Painting',
      lessons: [
        { id: 1, title: 'Materials and Setup', duration: '15 min', type: 'video' },
        { id: 2, title: 'Color Theory Basics', duration: '25 min', type: 'video' },
        { id: 3, title: 'First Brush Strokes', duration: '30 min', type: 'video' },
        { id: 4, title: 'Assignment: Color Wheel', duration: '45 min', type: 'assignment' }
      ]
    },
    {
      week: 2,
      title: 'Brush Techniques',
      lessons: [
        { id: 5, title: 'Brush Types and Uses', duration: '20 min', type: 'video' },
        { id: 6, title: 'Stroke Techniques', duration: '35 min', type: 'video' },
        { id: 7, title: 'Texture Creation', duration: '40 min', type: 'video' },
        { id: 8, title: 'Assignment: Texture Study', duration: '60 min', type: 'assignment' }
      ]
    },
    {
      week: 3,
      title: 'Composition and Design',
      lessons: [
        { id: 9, title: 'Rule of Thirds', duration: '20 min', type: 'video' },
        { id: 10, title: 'Leading Lines', duration: '25 min', type: 'video' },
        { id: 11, title: 'Balance and Harmony', duration: '30 min', type: 'video' },
        { id: 12, title: 'Assignment: Composition Study', duration: '90 min', type: 'assignment' }
      ]
    }
  ],
  reviews: [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: '',
        verified: true
      },
      rating: 5,
      comment: 'Absolutely fantastic course! Elena\'s teaching style is clear and engaging. I\'ve improved dramatically in just a few weeks.',
      date: '2024-01-15',
      helpful: 23
    },
    {
      id: 2,
      user: {
        name: 'Michael Chen',
        avatar: '',
        verified: false
      },
      rating: 4,
      comment: 'Great content and well-structured lessons. The assignments really help reinforce the concepts.',
      date: '2024-01-10',
      helpful: 15
    }
  ],
  discussions: [
    {
      id: 1,
      user: {
        name: 'Alex Thompson',
        avatar: '',
        verified: true
      },
      title: 'Best brushes for beginners?',
      content: 'I\'m just starting out and wondering what brushes you\'d recommend for someone new to oil painting.',
      date: '2024-01-20',
      replies: 8,
      likes: 12
    },
    {
      id: 2,
      user: {
        name: 'Maria Rodriguez',
        avatar: '',
        verified: false
      },
      title: 'Color mixing tips',
      content: 'Does anyone have tips for achieving more vibrant colors? I feel like my mixes are coming out muddy.',
      date: '2024-01-18',
      replies: 15,
      likes: 22
    }
  ]
};

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  
  const { generatePlaceholderUrl, generateAvatarPlaceholderUrl } = usePlaceholder();
  const placeholderUrl = generatePlaceholderUrl(800, 450);
  const avatarPlaceholder = generateAvatarPlaceholderUrl(60, 60);

  const course = {
    ...mockCourse,
    thumbnail: placeholderUrl,
    instructor: {
      ...mockCourse.instructor,
      avatar: avatarPlaceholder
    },
    reviews: mockCourse.reviews.map(review => ({
      ...review,
      user: {
        ...review.user,
        avatar: avatarPlaceholder
      }
    })),
    discussions: mockCourse.discussions.map(discussion => ({
      ...discussion,
      user: {
        ...discussion.user,
        avatar: avatarPlaceholder
      }
    }))
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    // In real app, this would handle payment and enrollment
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // In real app, this would submit to API
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  const handleSubmitDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDiscussion.title.trim() && newDiscussion.content.trim()) {
      // In real app, this would submit to API
      console.log('New discussion:', newDiscussion);
      setNewDiscussion({ title: '', content: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/marketplace">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
            <Badge variant="outline">{course.category}</Badge>
            <Badge variant="outline">{course.difficulty}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                      <span>({course.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Course Thumbnail */}
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button size="lg" className="gradient-button">
                    <Play className="h-5 w-5 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{course.longDescription}</p>
                    
                    <div>
                      <h4 className="font-semibold mb-2">What You'll Learn</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Course Requirements</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Basic understanding of drawing fundamentals</li>
                        <li>Oil painting materials (list provided)</li>
                        <li>Dedication to practice and complete assignments</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Instructor */}
                <Card>
                  <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                        <AvatarFallback>{course.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                          {course.instructor.verified && (
                            <Award className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{course.instructor.bio}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.instructor.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.instructor.students.toLocaleString()} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.instructor.courses} courses</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{course.instructor.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <a href={course.instructor.website} className="hover:text-primary">Website</a>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Instagram className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Twitter className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Youtube className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Facebook className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.curriculum.map((week, weekIndex) => (
                        <div key={weekIndex} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">{week.title}</h4>
                          <div className="space-y-2">
                            {week.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                <div className="flex items-center gap-3">
                                  {lesson.type === 'video' ? (
                                    <Play className="h-4 w-4 text-primary" />
                                  ) : (
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                  )}
                                  <span className="text-sm">{lesson.title}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage src={review.user.avatar} alt={review.user.name} />
                              <AvatarFallback>{review.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{review.user.name}</span>
                                {review.user.verified && (
                                  <Award className="h-3 w-3 text-primary" />
                                )}
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Heart className="h-3 w-3 mr-1" />
                                  Helpful ({review.helpful})
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Discussions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* New Discussion Form */}
                    {isEnrolled && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-lg">Start a Discussion</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleSubmitDiscussion} className="space-y-4">
                            <div>
                              <input
                                type="text"
                                placeholder="Discussion title"
                                value={newDiscussion.title}
                                onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                required
                              />
                            </div>
                            <div>
                              <Textarea
                                placeholder="What would you like to discuss?"
                                value={newDiscussion.content}
                                onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                                className="min-h-[100px]"
                                required
                              />
                            </div>
                            <Button type="submit" className="gradient-button">
                              Post Discussion
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Discussions List */}
                    <div className="space-y-4">
                      {course.discussions.map((discussion) => (
                        <Card key={discussion.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={discussion.user.avatar} alt={discussion.user.name} />
                                <AvatarFallback>{discussion.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{discussion.user.name}</span>
                                  {discussion.user.verified && (
                                    <Award className="h-3 w-3 text-primary" />
                                  )}
                                  <span className="text-xs text-muted-foreground">{discussion.date}</span>
                                </div>
                                <h4 className="font-semibold mb-2">{discussion.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{discussion.content}</p>
                                <div className="flex items-center gap-4">
                                  <Button variant="ghost" size="sm" className="h-6 px-2">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {discussion.replies} replies
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 px-2">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {discussion.likes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">${course.price}</span>
                    {course.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${course.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  {isEnrolled ? (
                    <div className="space-y-3">
                      <Button className="w-full gradient-button" size="lg">
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Materials
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full gradient-button" 
                      size="lg"
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </Button>
                  )}

                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mobile and desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className="font-medium">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">{course.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium">{course.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium">{course.students.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
