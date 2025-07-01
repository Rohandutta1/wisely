import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 flex-1">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bounce-slow">
              Master English with Fun! 🚀
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Take free English tests, find your dream college, and connect with amazing teachers!
            </p>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 card-hover">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Free English Tests</h3>
                <p className="opacity-80">Practice with AI-generated questions across all levels</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 card-hover">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold mb-2">College Search</h3>
                <p className="opacity-80">Find and apply to top colleges in India</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 card-hover">
                <div className="text-4xl mb-4">👨‍🏫</div>
                <h3 className="text-xl font-semibold mb-2">Expert Teachers</h3>
                <p className="opacity-80">Book sessions with qualified English teachers</p>
              </div>
            </div>
            
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="mt-12 px-8 py-4 bg-accent text-white text-xl font-semibold rounded-2xl hover:bg-yellow-500 transform hover:scale-105 transition-all shadow-2xl"
            >
              Start Your English Journey! 🌟
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
