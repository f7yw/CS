"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  BookOpen,
  Heart,
  ExternalLink,
  Briefcase,
  GraduationCap,
} from "lucide-react";

// -------------------- Career Data --------------------
const careerData = [
  {
    id: 1,
    title: "Software Engineer",
    category: "Technology",
    industry: "Technology",
    description: "Design, develop, and maintain software applications and systems.",
    salary: "$75,000 - $150,000",
    growth: "22%",
    education: "Bachelor's Degree",
    experience: "Entry to Senior Level",
    skills: ["Programming", "Problem Solving", "Teamwork", "Communication"],
    trending: true,
    remote: true,
    companies: ["Google", "Microsoft", "Apple", "Meta"],
    location: "Global",
  },
  {
    id: 2,
    title: "Data Scientist",
    category: "Technology",
    industry: "Technology",
    description: "Analyze complex data to help organizations make informed decisions.",
    salary: "$80,000 - $160,000",
    growth: "31%",
    education: "Master's Degree",
    experience: "Mid to Senior Level",
    skills: ["Python", "Statistics", "Machine Learning", "Data Visualization"],
    trending: true,
    remote: true,
    companies: ["Netflix", "Uber", "Airbnb", "LinkedIn"],
    location: "Major Cities",
  },
  {
    id: 3,
    title: "Digital Marketing Manager",
    category: "Marketing",
    industry: "Marketing",
    description: "Develop and execute digital marketing strategies across multiple channels.",
    salary: "$50,000 - $100,000",
    growth: "10%",
    education: "Bachelor's Degree",
    experience: "Mid Level",
    skills: ["SEO", "Social Media", "Analytics", "Content Strategy"],
    trending: false,
    remote: true,
    companies: ["HubSpot", "Salesforce", "Adobe", "Shopify"],
    location: "Flexible",
  },
  {
    id: 4,
    title: "Registered Nurse",
    category: "Healthcare",
    industry: "Healthcare",
    description: "Provide patient care and support in various healthcare settings.",
    salary: "$60,000 - $90,000",
    growth: "7%",
    education: "Associate/Bachelor's Degree",
    experience: "Entry to Senior Level",
    skills: ["Patient Care", "Medical Knowledge", "Communication", "Empathy"],
    trending: false,
    remote: false,
    companies: ["Mayo Clinic", "Johns Hopkins", "Kaiser Permanente", "Cleveland Clinic"],
    location: "Healthcare Facilities",
  },
  {
    id: 5,
    title: "Financial Analyst",
    category: "Finance",
    industry: "Finance",
    description: "Analyze financial data and trends to guide investment decisions.",
    salary: "$55,000 - $110,000",
    growth: "5%",
    education: "Bachelor's Degree",
    experience: "Entry to Mid Level",
    skills: ["Financial Modeling", "Excel", "Analysis", "Reporting"],
    trending: false,
    remote: true,
    companies: ["Goldman Sachs", "JPMorgan", "Morgan Stanley", "BlackRock"],
    location: "Financial Centers",
  },
];

// -------------------- Filters --------------------
const industries = ["All", "Technology", "Healthcare", "Finance", "Marketing", "Education", "Engineering"];
const experienceLevels = ["All", "Entry Level", "Mid Level", "Senior Level"];
const educationLevels = ["All", "High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD"];

// -------------------- Component --------------------
export default function CareerBankPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -------------------- States --------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedEducation, setSelectedEducation] = useState("All");
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Sorting state for Ascending/Descending
  const [isAscending, setIsAscending] = useState(true);

  // -------------------- Effects --------------------
  useEffect(() => {
    const search = searchParams.get("search");
    const industry = searchParams.get("industry");
    const trending = searchParams.get("trending");
    if (search) setSearchQuery(search);
    if (industry) setSelectedIndustry(industry);
    if (trending) setShowTrendingOnly(true);
  }, [searchParams]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("ns_career_favorites");
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (error) {
      console.log("Failed to load favorites:", error);
    }
  }, []);

  // -------------------- Filtered Careers --------------------
  const filteredCareers = useMemo(() => {
    return careerData
      .filter((career) => {
        const matchesSearch =
          !searchQuery ||
          career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          career.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          career.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesIndustry = selectedIndustry === "All" || career.industry === selectedIndustry;
        const matchesExperience = selectedExperience === "All" || career.experience.includes(selectedExperience);
        const matchesEducation = selectedEducation === "All" || career.education.includes(selectedEducation);
        const matchesTrending = !showTrendingOnly || career.trending;
        const matchesRemote = !showRemoteOnly || career.remote;

        return matchesSearch && matchesIndustry && matchesExperience && matchesEducation && matchesTrending && matchesRemote;
      })
      .sort((a, b) => (isAscending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
  }, [searchQuery, selectedIndustry, selectedExperience, selectedEducation, showTrendingOnly, showRemoteOnly, isAscending]);

  // -------------------- Favorite Careers --------------------
  const favoriteCareers = careerData.filter((career) => favorites.includes(career.id));

  // -------------------- Handlers --------------------
  const toggleFavorite = (careerId: number) => {
    const newFavorites = favorites.includes(careerId)
      ? favorites.filter((id) => id !== careerId)
      : [...favorites, careerId];

    setFavorites(newFavorites);
    try {
      localStorage.setItem("ns_career_favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.log("Failed to save favorites:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) router.push(`/career-bank?search=${encodeURIComponent(query.trim())}`);
    else router.push("/career-bank");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("All");
    setSelectedExperience("All");
    setSelectedEducation("All");
    setShowTrendingOnly(false);
    setShowRemoteOnly(false);
    router.push("/career-bank");
  };

  // -------------------- JSX --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Career Bank</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore detailed career profiles, salary information, and growth opportunities across various industries.
          </p>
        </div>

        {/* Filters Card */}
        <Card className="mb-8">
          <CardContent className="p-6 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search careers, skills, or companies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEducation} onValueChange={setSelectedEducation}>
                <SelectTrigger>
                  <SelectValue placeholder="Education" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            {/* Trending / Remote / Sort */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant={showTrendingOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTrendingOnly(!showTrendingOnly)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Trending Only
              </Button>

              <Button
                variant={showRemoteOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRemoteOnly(!showRemoteOnly)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Remote Friendly
              </Button>

              {/* Sort Button */}
              <div className="ml-auto">
                <Button
                  size="sm"
                  onClick={() => setIsAscending(!isAscending)}
                  className="flex items-center gap-2"
                >
                  {isAscending ? "Sort: Ascending" : "Sort: Descending"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              All Careers ({filteredCareers.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              My Favorites ({favoriteCareers.length})
            </TabsTrigger>
          </TabsList>

          {/* All Careers Tab */}
          <TabsContent value="all" className="mt-6">
            {filteredCareers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCareers.map((career) => (
                  <Card key={career.id} className="card-hover border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 flex items-center gap-2">
                            {career.title}
                            {career.trending && (
                              <Badge variant="secondary" className="bg-accent/10 text-accent">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">{career.description}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(career.id)}
                          className="p-2 h-auto"
                          aria-label={favorites.includes(career.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.includes(career.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{career.salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span>{career.growth} growth</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          <span>{career.education}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span>{career.experience}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {career.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {career.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{career.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => router.push(`/career-bank/${career.id}`)}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/career-bank/${career.id}/roadmap`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No careers found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search criteria or clearing filters.</p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-6">
            {favoriteCareers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteCareers.map((career) => (
                  <Card key={career.id} className="card-hover border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{career.title}</CardTitle>
                          <CardDescription className="text-sm">{career.description}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(career.id)}
                          className="p-2 h-auto"
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" className="w-full" onClick={() => router.push(`/career-bank/${career.id}`)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-4">Start exploring careers and add them to your favorites!</p>
                  <Button onClick={() => setActiveTab("all")}>Browse Careers</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
