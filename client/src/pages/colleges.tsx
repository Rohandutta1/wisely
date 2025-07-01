import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Search, MapPin, DollarSign, GraduationCap } from "lucide-react";

interface College {
  id: number;
  name: string;
  location: string;
  courses: string[];
  fees: number;
  ranking?: number;
  entranceExam?: string;
  description?: string;
  imageUrl?: string;
}

export default function Colleges() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    course: "",
    location: "",
    minFees: "",
    maxFees: ""
  });

  const { data: colleges = [], isLoading } = useQuery<College[]>({
    queryKey: ["/api/colleges", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.course) params.append("course", filters.course);
      if (filters.location) params.append("location", filters.location);
      if (filters.minFees) params.append("minFees", filters.minFees);
      if (filters.maxFees) params.append("maxFees", filters.maxFees);
      
      const response = await fetch(`/api/colleges?${params}`);
      if (!response.ok) throw new Error("Failed to fetch colleges");
      return response.json();
    }
  });

  const formatFees = (fees: number) => {
    if (fees >= 100000) {
      return `₹${(fees / 100000).toFixed(1)} Lakh${fees >= 200000 ? 's' : ''}`;
    }
    return `₹${fees.toLocaleString()}`;
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
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Find Your Dream College 🎓</h2>
            <p className="text-gray-600">Discover top colleges and universities in India</p>
          </div>

          {/* Search Filters */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Course</Label>
                  <Select 
                    value={filters.course} 
                    onValueChange={(value) => setFilters({...filters, course: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courses</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Location</Label>
                  <Select 
                    value={filters.location} 
                    onValueChange={(value) => setFilters({...filters, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All India</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Kolkata">Kolkata</SelectItem>
                      <SelectItem value="Pune">Pune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">Max Fees (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500000"
                    value={filters.maxFees}
                    onChange={(e) => setFilters({...filters, maxFees: e.target.value})}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    <Search className="mr-2" size={16} />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Results */}
          {colleges.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No colleges found</h3>
                <p className="text-gray-500">Try adjusting your search filters to find more colleges.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {colleges.map((college) => (
                <Card key={college.id} className="overflow-hidden card-hover">
                  {college.imageUrl && (
                    <img 
                      src={college.imageUrl} 
                      alt={college.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{college.name}</h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <MapPin size={16} className="mr-1" />
                          {college.location}
                        </p>
                      </div>
                      {college.ranking && (
                        <Badge variant="secondary" className="bg-success text-white">
                          NIRF #{college.ranking}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <DollarSign size={16} className="mr-1" />
                          Fees (Annual)
                        </span>
                        <span className="font-semibold">{formatFees(college.fees)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <GraduationCap size={16} className="mr-1" />
                          Courses
                        </span>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {college.courses.slice(0, 2).map((course, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {course}
                            </Badge>
                          ))}
                          {college.courses.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{college.courses.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {college.entranceExam && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entrance Exam</span>
                          <span className="font-semibold">{college.entranceExam}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-primary">
                        View Details
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Apply Now
                      </Button>
                    </div>
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
