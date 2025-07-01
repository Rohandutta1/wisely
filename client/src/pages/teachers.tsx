import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Search, Star, Clock, GraduationCap, CalendarPlus } from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  email?: string;
  specializations: string[];
  experience: number;
  qualifications: string[];
  hourlyRate: number;
  rating: number; // stored as integer (45 = 4.5)
  totalReviews: number;
  imageUrl?: string;
  bio?: string;
}

export default function Teachers() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    subject: "",
    minExperience: "",
    maxRate: ""
  });

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.minExperience) params.append("minExperience", filters.minExperience);
      if (filters.maxRate) params.append("maxRate", filters.maxRate);
      
      const response = await fetch(`/api/teachers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch teachers");
      return response.json();
    }
  });

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSearch = () => {
    // Trigger refetch by updating query key
    // The query will automatically refetch when filters change
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Book Expert Teachers 👨‍🏫</h2>
            <p className="text-gray-600">Get personalized English learning sessions</p>
          </div>

          {/* Teacher Filters */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <Select 
                    value={filters.subject} 
                    onValueChange={(value) => setFilters({...filters, subject: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      <SelectItem value="English Grammar">English Grammar</SelectItem>
                      <SelectItem value="Spoken English">Spoken English</SelectItem>
                      <SelectItem value="IELTS Preparation">IELTS Preparation</SelectItem>
                      <SelectItem value="Business English">Business English</SelectItem>
                      <SelectItem value="Academic Writing">Academic Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                  <Select 
                    value={filters.minExperience} 
                    onValueChange={(value) => setFilters({...filters, minExperience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Experience</SelectItem>
                      <SelectItem value="1">1+ years</SelectItem>
                      <SelectItem value="3">3+ years</SelectItem>
                      <SelectItem value="5">5+ years</SelectItem>
                      <SelectItem value="10">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    <Search className="mr-2" size={16} />
                    Find Teachers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Cards */}
          {teachers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">👨‍🏫</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No teachers found</h3>
                <p className="text-gray-500">Try adjusting your search filters to find more teachers.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar className="w-20 h-20 mx-auto mb-3">
                        <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
                        <AvatarFallback className="text-lg font-semibold">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold text-gray-800">{teacher.name}</h3>
                      <p className="text-gray-600">English Language Expert</p>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm">
                        <Star className="text-accent mr-2" size={16} />
                        <span className="font-semibold">{formatRating(teacher.rating)}</span>
                        <span className="text-gray-600 ml-1">({teacher.totalReviews} reviews)</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="text-primary mr-2" size={16} />
                        <span className="text-gray-600">{teacher.experience}+ years experience</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <GraduationCap className="text-success mr-2" size={16} />
                        <span className="text-gray-600">
                          {teacher.qualifications.slice(0, 2).join(", ")}
                          {teacher.qualifications.length > 2 && "..."}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 mb-2">Specializations:</p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {teacher.specializations.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{teacher.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">₹{teacher.hourlyRate}</span>
                      <span className="text-gray-600">/hour</span>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary transform hover:scale-105 transition-all">
                      <CalendarPlus className="mr-2" size={16} />
                      Book Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              onClick={() => setLocation("/")}
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-2xl transform hover:scale-105 transition-all"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
