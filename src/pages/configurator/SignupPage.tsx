import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { SignupForm } from "@/components/configurator/auth/SignupForm";
import { useAuth } from "@/components/configurator/auth/AuthProvider";

export default function SignupPage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <Helmet>
        <title>Create account · Hudson Turansky</title>
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-16 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Two minutes from now you'll have a draft saved.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm shadow-sm p-6">
              <SignupForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
