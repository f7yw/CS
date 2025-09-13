"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Target, Award, Heart, Globe, Star, ArrowRight, Lightbulb, Shield, Zap } from "lucide-react"

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("mission")

  const stats = [
    { icon: Users, number: "50,000+", label: "Students Guided" },
    { icon: Award, number: "500+", label: "Career Paths" },
    { icon: Star, number: "95%", label: "Success Rate" },
    { icon: Globe, number: "25+", label: "Countries" },
  ]

  const values = [
    {
      icon: Target,
      title: "Personalized Guidance",
      description:
        "Every career journey is unique. We provide tailored advice based on individual interests, skills, and goals.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We leverage cutting-edge technology and data insights to deliver the most relevant career guidance.",
    },
    {
      icon: Shield,
      title: "Trust & Privacy",
      description:
        "Your personal information and career aspirations are protected with the highest security standards.",
    },
    {
      icon: Heart,
      title: "Empowerment",
      description: "We believe in empowering individuals to make informed decisions about their professional future.",
    },
  ]

  const team = [
    {
      name: "Dr. Sarah Ahmed",
      role: "Founder & CEO",
      bio: "Former career counselor with 15+ years experience helping students and professionals find their path.",
      image: "/professional-woman-headshot.png",
    },
    {
      name: "Michael Chen",
      role: "Head of Technology",
      bio: "Tech industry veteran passionate about using AI to democratize career guidance worldwide.",
      image: "/professional-man-headshot.png",
    },
    {
      name: "Dr. Fatima Al-Rashid",
      role: "Chief Learning Officer",
      bio: "Educational psychologist specializing in career development and student success strategies.",
      image: "/professional-woman-headshot.png",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-6">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 gradient-text">About NextStep Navigator</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Empowering the next generation of professionals with personalized career guidance, comprehensive resources,
            and expert insights to navigate their professional journey with confidence.
          </p>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <Card key={idx} className="text-center border-border bg-card/50 backdrop-blur-sm card-hover">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission & Vision Tabs */}
        <section className="mb-16">
          <div className="flex justify-center mb-8">
            <div className="flex bg-muted rounded-lg p-1">
              {[
                { id: "mission", label: "Our Mission" },
                { id: "vision", label: "Our Vision" },
                { id: "story", label: "Our Story" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-6 py-2"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          <Card className="max-w-4xl mx-auto border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              {activeTab === "mission" && (
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To democratize access to quality career guidance by providing personalized, data-driven insights
                    that help individuals make informed decisions about their professional future. We believe everyone
                    deserves the opportunity to discover and pursue a fulfilling career path.
                  </p>
                </div>
              )}

              {activeTab === "vision" && (
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To become the world's leading platform for career discovery and professional development, where
                    every individual can access the tools, resources, and guidance they need to build a successful and
                    meaningful career, regardless of their background or circumstances.
                  </p>
                </div>
              )}

              {activeTab === "story" && (
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold mb-4">Our Story</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Founded in 2020 by a team of career counselors and technology experts, NextStep Navigator was born
                    from the recognition that traditional career guidance was often inaccessible, outdated, or
                    one-size-fits-all. We set out to create a platform that combines human expertise with cutting-edge
                    technology to provide personalized, actionable career guidance at scale.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and shape our commitment to your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, idx) => (
              <Card key={idx} className="border-border bg-card/50 backdrop-blur-sm card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold">{value.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate experts dedicated to helping you achieve your career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <Card key={idx} className="text-center border-border bg-card/50 backdrop-blur-sm card-hover">
                <CardContent className="p-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-heading text-xl font-semibold mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-4">
                    {member.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto py-12 px-8 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
            <CardContent className="space-y-6">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Ready to Start Your Journey?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students and professionals who have discovered their ideal career path with NextStep
                Navigator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Contact Our Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
