"use client"

import { Target, Heart, Lightbulb, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Rodriguez",
      role: "Founder & Lead Career Counselor",
      bio: "With over 15 years of experience in career counseling and educational psychology, Dr. Rodriguez founded NextStep Navigator to make career guidance accessible to everyone.",
      expertise: ["Career Psychology", "Educational Guidance", "Leadership Development"],
      initials: "SR",
    },
    {
      name: "Michael Johnson",
      role: "Industry Relations Specialist",
      bio: "Michael brings 12 years of corporate experience across tech, healthcare, and finance industries, providing real-world insights into career opportunities.",
      expertise: ["Industry Trends", "Corporate Relations", "Professional Development"],
      initials: "MJ",
    },
    {
      name: "Dr. Priya Patel",
      role: "Educational Pathways Advisor",
      bio: "Former university admissions director with expertise in international education and study abroad programs.",
      expertise: ["Higher Education", "Study Abroad", "Academic Planning"],
      initials: "PP",
    },
    {
      name: "James Chen",
      role: "Technology & Innovation Lead",
      bio: "Software engineer turned career coach, specializing in tech careers and the future of work in digital industries.",
      expertise: ["Tech Careers", "Digital Skills", "Innovation"],
      initials: "JC",
    },
  ]

  const values = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Personalized Guidance",
      description:
        "Every individual has unique strengths and aspirations. We provide tailored career advice that fits your personal journey.",
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Accessible to All",
      description:
        "Career guidance shouldn't be a privilege. Our platform is designed to be accessible to students and professionals worldwide.",
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Evidence-Based Approach",
      description:
        "Our recommendations are backed by research, industry data, and real-world success stories from diverse career paths.",
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Empowerment Through Knowledge",
      description:
        "We believe that informed decisions lead to fulfilling careers. We provide the knowledge and tools for confident career choices.",
    },
  ]

  const milestones = [
    { year: "2020", event: "NextStep Navigator founded with a vision to democratize career guidance" },
    { year: "2021", event: "Launched comprehensive career assessment tools and resource library" },
    { year: "2022", event: "Reached 10,000+ users across 25 countries" },
    { year: "2023", event: "Partnered with leading universities and corporations for real-world insights" },
    { year: "2024", event: "Expanded to include AI-powered career matching and personalized learning paths" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About NextStep Navigator</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto">
            Empowering individuals to make informed career decisions through comprehensive guidance, personalized
            assessments, and real-world insights from industry experts.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                To provide accessible, comprehensive, and personalized career guidance that empowers individuals at
                every stage of their professional journey. We bridge the gap between academic learning and real-world
                career opportunities through innovative tools and expert insights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-6 w-6 text-secondary" />
                <span>Our Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                A world where every individual has access to the guidance and resources needed to pursue fulfilling
                careers aligned with their passions, skills, and values. We envision a future where career decisions are
                made with confidence and clarity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Story</CardTitle>
              <CardDescription>How NextStep Navigator came to be</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="leading-relaxed text-muted-foreground">
                NextStep Navigator was born from a simple observation: too many talented individuals struggle to find
                their ideal career path due to lack of accessible, comprehensive guidance. Our founder, Dr. Sarah
                Rodriguez, witnessed countless students and professionals making career decisions based on limited
                information or societal pressure rather than their true interests and potential.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                In 2020, during a time when the job market was rapidly evolving, we launched NextStep Navigator with a
                mission to democratize career guidance. We combined evidence-based career counseling principles with
                modern technology to create a platform that serves users regardless of their location, background, or
                economic situation.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Today, we're proud to have helped thousands of individuals discover fulfilling career paths, from high
                school students choosing their first major to experienced professionals making strategic career
                transitions. Our platform continues to evolve, incorporating the latest research in career development
                and feedback from our global community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">{milestone.year}</span>
                </div>
                <div className="flex-1 bg-card rounded-lg p-4 shadow-sm">
                  <p className="text-muted-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">{member.initials}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 leading-relaxed text-muted-foreground">{member.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">25,000+</div>
              <p className="text-muted-foreground">Users Guided</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Career Profiles</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Countries Reached</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <p className="text-muted-foreground">User Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
