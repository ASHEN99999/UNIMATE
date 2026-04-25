"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceCard } from "@/components/service-card"
import {
  Home,
  Shirt,
  Utensils,
  ShoppingBag,
  Shield,
  Users,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

const services = [
  {
    title: "Housing",
    description: "Find safe, verified boarding places near campus with transparent pricing and amenities.",
    icon: Home,
    href: "/housing",
    colorClass: "bg-[oklch(0.55_0.18_195)]",
    features: [
      "Verified listings",
      "Location-based search",
      "Amenity filters",
      "Direct reservations",
    ],
    stats: { label: "Active Listings", value: "120+" },
  },
  {
    title: "Laundry",
    description: "Book laundry services with multiple providers, transparent pricing, and order tracking.",
    icon: Shirt,
    href: "/laundry",
    colorClass: "bg-[oklch(0.55_0.16_280)]",
    features: [
      "Multiple providers",
      "Auto-calculated pricing",
      "Order tracking",
      "Rating system",
    ],
    stats: { label: "Providers", value: "15+" },
  },
  {
    title: "Food Help",
    description: "Request food delivery from fellow students when you cannot leave campus.",
    icon: Utensils,
    href: "/food",
    colorClass: "bg-[oklch(0.60_0.18_40)]",
    features: [
      "Peer-to-peer delivery",
      "Real-time tracking",
      "Multiple meal types",
      "Helper matching",
    ],
    stats: { label: "Requests Today", value: "45+" },
  },
  {
    title: "Marketplace",
    description: "Buy and sell second-hand items within the campus community safely.",
    icon: ShoppingBag,
    href: "/marketplace",
    colorClass: "bg-[oklch(0.50_0.15_145)]",
    features: [
      "8 categories",
      "Reservation system",
      "Seller verification",
      "Price negotiation",
    ],
    stats: { label: "Items Listed", value: "500+" },
  },
]

const features = [
  {
    icon: Shield,
    title: "University Verified",
    description: "Only students with valid university email can access the platform",
  },
  {
    icon: Users,
    title: "Campus Community",
    description: "Connect with fellow students for housing, services, and trading",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Track your bookings, orders, and requests in real-time",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description: "Make informed decisions with community ratings and feedback",
  },
]

const steps = [
  { step: 1, title: "Sign Up", description: "Register with your university email" },
  { step: 2, title: "Browse Services", description: "Explore housing, laundry, food, or marketplace" },
  { step: 3, title: "Book or Request", description: "Make reservations or place requests" },
  { step: 4, title: "Track & Complete", description: "Follow status updates until completion" },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                University Campus Services Hub
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
                Everything You Need,{" "}
                <span className="text-primary">Right on Campus</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                UNIMATE connects university students with essential campus services. Find housing, book laundry, get food help, and trade items — all in one secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Button size="lg" asChild>
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link href="/register">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Campus Services at Your Fingertips
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Four essential services designed specifically for university students
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.title} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose UNIMATE?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built specifically for university students with security and convenience in mind
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes with our simple process
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((item, index) => (
                <div key={item.step} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-border" />
                  )}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Join thousands of students already using UNIMATE to simplify their campus life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/housing">Browse Listings</Link>
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm opacity-80">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Free to use
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> University verified
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Secure platform
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
