import { useState } from "react";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { Lock, Mail, ChevronRight } from "lucide-react";
import ccosLogo from "@/assets/CCOS_Logo.png";

export default function Login() {
  const { setRole, setIsAuthenticated } = useRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("111111");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Step 1: Validate credentials
    setTimeout(() => {
      // Simulate credential check
      if (email && password) {
        setStep("otp");
      } else {
        setError("Please enter both email and password");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Step 2: Verify OTP
    setTimeout(() => {
      // Demo logic to map email to roles
      let assignedRole: UserRole = "consultant";
      const emailLower = email.toLowerCase();
      
      if (emailLower.includes("admin")) assignedRole = "admin";
      else if (emailLower.includes("manager")) assignedRole = "manager";
      else if (emailLower.includes("consultant")) assignedRole = "consultant";
      
      // For demo, any 6-digit number works, but let's say '123456' is preferred
      if (otp.length === 6) {
        setRole(assignedRole);
        setIsAuthenticated(true);
      } else {
        setError("Invalid OTP. Please enter a 6-digit code.");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-sidebar-accent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3" />
      
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="mb-6">
              <img src={ccosLogo} alt="CCOS Logo" className="h-24 w-auto mx-auto object-contain" />
            </div>
            {step === "otp" && (
              <p className="text-muted-foreground mb-4">
                Verify your identity with MFA
              </p>
            )}
          </div>

          {step === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="text-sm bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className=" ">
                <label className="text-sm font-medium">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="name@company.com" 
                  />
                </div>
              </div>

              <div className=" ">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <button type="button" className="text-xs text-primary hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center group disabled:opacity-70"
              >
                {isLoading ? "Checking credentials..." : "Sign in"}
                {!isLoading && <ChevronRight className="h-4 w-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {error && (
                <div className="text-sm bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="text-center space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  A verification code has been sent to <br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className=" ">
                <label className="text-sm font-medium">One-Time Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    autoFocus
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-background border rounded-lg pl-10 pr-4 py-2.5 text-sm tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="000000" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center group disabled:opacity-70"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
                {!isLoading && <ChevronRight className="h-4 w-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />}
              </button>

              <button 
                type="button"
                onClick={() => setStep("credentials")}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Use a different account
              </button>
            </form>
          )}
          
          <div className="  text-center border-t pt-6 mt-6">
            <p className="text-xs text-muted-foreground mb-3">Demo Accounts</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span onClick={() => {setEmail('consultant@demo.com'); setPassword('password'); setStep('credentials');}} className="cursor-pointer text-[10px] bg-secondary px-2 py-1 rounded-md text-foreground font-medium hover:bg-secondary/80">Consultant</span>
              <span onClick={() => {setEmail('manager@demo.com'); setPassword('password'); setStep('credentials');}} className="cursor-pointer text-[10px] bg-secondary px-2 py-1 rounded-md text-foreground font-medium hover:bg-secondary/80">Manager</span>
              <span onClick={() => {setEmail('admin@demo.com'); setPassword('password'); setStep('credentials');}} className="cursor-pointer text-[10px] bg-secondary px-2 py-1 rounded-md text-foreground font-medium hover:bg-secondary/80">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
