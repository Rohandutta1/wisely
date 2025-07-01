import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated, user } = useAuth();
  const [filters, setFilters] = useState({
    subject: "",
    minExperience: "",
    maxRate: ""
  });

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    duration: "1",
    message: ""
  });
  
  const { toast } = useToast();

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.subject && filters.subject !== "all") params.append("subject", filters.subject);
      if (filters.minExperience && filters.minExperience !== "all") params.append("minExperience", filters.minExperience);
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

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Booking failed");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful!",
        description: "Your session has been booked. The teacher will contact you soon.",
      });
      setSelectedTeacher(null);
      setBookingData({ date: "", time: "", duration: "1", message: "" });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session.",
        variant: "destructive",
      });
      window.location.href = "/api/login";
      return;
    }

    if (!selectedTeacher || !bookingData.date || !bookingData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const totalCost = selectedTeacher.hourlyRate * parseInt(bookingData.duration);
    
    bookingMutation.mutate({
      teacherId: selectedTeacher.id,
      date: bookingData.date,
      time: bookingData.time,
      duration: parseInt(bookingData.duration),
      message: bookingData.message,
      totalCost,
    });
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
                      <SelectItem value="all">All Subjects</SelectItem>
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
                      <SelectItem value="all">Any Experience</SelectItem>
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
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-primary to-secondary transform hover:scale-105 transition-all"
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          <CalendarPlus className="mr-2" size={16} />
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Book Session with {selectedTeacher?.name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="date">Date *</Label>
                            <Input
                              id="date"
                              type="date"
                              value={bookingData.date}
                              onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="time">Time *</Label>
                            <Input
                              id="time"
                              type="time"
                              value={bookingData.time}
                              onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="duration">Duration (hours) *</Label>
                            <Select 
                              value={bookingData.duration} 
                              onValueChange={(value) => setBookingData({...bookingData, duration: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 hour</SelectItem>
                                <SelectItem value="2">2 hours</SelectItem>
                                <SelectItem value="3">3 hours</SelectItem>
                                <SelectItem value="4">4 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="message">Message (optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Any specific requirements or topics to focus on..."
                              value={bookingData.message}
                              onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                            />
                          </div>
                          
                          {selectedTeacher && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">Total Cost:</span>
                                <span className="text-xl font-bold text-primary">
                                  ₹{selectedTeacher.hourlyRate * parseInt(bookingData.duration || "1")}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <Button 
                            onClick={handleBooking}
                            disabled={bookingMutation.isPending}
                            className="w-full"
                          >
                            {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
