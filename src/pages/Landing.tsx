import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Sparkles, 
  Rocket, 
  Brain, 
  Zap, 
  Shield, 
  BookOpen,
  FileText,
  FlaskConical,
  ClipboardList,
  ArrowRight,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 bg-card/50 backdrop-blur">
    <CardHeader>
      <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center space-y-2 animate-fade-in">
    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      {number}
    </div>
    <div className="text-muted-foreground font-medium">{label}</div>
  </div>
);

const DocumentTypeCard = ({ 
  icon: Icon, 
  label, 
  count 
}: { 
  icon: React.ElementType; 
  label: string; 
  count: string;
}) => (
  <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <div className="font-semibold">{label}</div>
      <div className="text-sm text-muted-foreground">{count} available</div>
    </div>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 backdrop-blur rounded-full border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">
              Powered by Google Gemini AI
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              VTU MITRA
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your AI-powered study companion for VTU. Access 10,000+ study materials 
            instantly with natural language search. Just ask, and MITRA delivers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                <Rocket className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-primary" />}
            title="AI-Powered Search"
            description="Ask in plain English: 'Show me Data Structures notes for 3rd sem CSE' - MITRA understands you perfectly."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-primary" />}
            title="Instant Access"
            description="Download any document in seconds. No more searching through WhatsApp groups or Google Drive links."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-primary" />}
            title="Quality Assured"
            description="All materials reviewed by admins before publishing. Only the best content makes it through."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card/50 backdrop-blur py-20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCard number="10,000+" label="Study Materials" />
            <StatCard number="5,000+" label="Active Students" />
            <StatCard number="50+" label="Subjects Covered" />
            <StatCard number="99.9%" label="Uptime" />
          </div>
        </div>
      </section>

      {/* Document Types Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">What You'll Find</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to ace your VTU exams, all in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <DocumentTypeCard
            icon={BookOpen}
            label="Notes"
            count="5,000+"
          />
          <DocumentTypeCard
            icon={FileText}
            label="Previous Year Questions"
            count="2,500+"
          />
          <DocumentTypeCard
            icon={FlaskConical}
            label="Lab Programs"
            count="1,800+"
          />
          <DocumentTypeCard
            icon={ClipboardList}
            label="Question Banks"
            count="700+"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-card/50 backdrop-blur py-20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple, fast, and powerful</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Ask MITRA</h3>
              <p className="text-muted-foreground">
                Type your question in natural language - no need for complex search queries
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">AI Finds It</h3>
              <p className="text-muted-foreground">
                Powered by Google Gemini, MITRA understands context and finds exactly what you need
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Download & Study</h3>
              <p className="text-muted-foreground">
                Get instant access to high-quality materials. Download and start studying right away
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-0 shadow-2xl">
          <CardContent className="text-center space-y-8 py-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Studies?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of VTU students who are already studying smarter with MITRA.
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-12 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 VTU MITRA. Built with ❤️ for VTU students.</p>
          <p className="mt-2 text-sm">Powered by Google Gemini AI & Lovable Cloud</p>
        </div>
      </footer>
    </div>
  );
}
