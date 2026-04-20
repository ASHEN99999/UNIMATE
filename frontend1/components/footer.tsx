import Link from "next/link"
import { GraduationCap } from "lucide-react"

const footerLinks = {
  Services: [
    { label: "Housing", href: "/housing" },
    { label: "Laundry", href: "/laundry" },
    { label: "Food Assistance", href: "/food" },
    { label: "Marketplace", href: "/marketplace" },
  ],
  Account: [
    { label: "Sign Up", href: "/register" },
    { label: "Log In", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">UNIMATE</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your complete university campus services hub. Find housing, book laundry, get food help, and trade second-hand items.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} UNIMATE. Built for university students.
          </p>
          <p className="text-sm text-muted-foreground">
            University Campus Services Hub v1.0.0
          </p>
        </div>
      </div>
    </footer>
  )
}
