import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createQuery } from "@/api/query.api";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import CircularLoader from "@/components/ui/CircularLoader";
import { spacing } from "@/utils/spacing";

export default function ContactUs() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    subject: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.subject || !formData.description) {
      error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await createQuery(formData);
      success("Your message has been sent successfully!");
      setFormData({ 
        email: user?.email || "", 
        subject: "", 
        description: "" 
      });
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className={`${spacing.navbar.offset} ${spacing.navbar.gapBottom} flex-1`}>
        <section className={`w-full ${spacing.section.gap}`}>
          <div className="max-w-[1232px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className={spacing.container.paddingXLarge}>
              <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl p-8">
                {/* Left: Form */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 theme-heading">You have any query!</h2>
                  <p className="text-gray-600 mb-6">Fill the form to send us.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter here"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--theme-primary)";
                          e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Enter here"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--theme-primary)";
                          e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter here"
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none resize-none text-gray-900"
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--theme-primary)";
                          e.currentTarget.style.boxShadow = "0 0 0 2px var(--theme-primary)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 h-12 text-white rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: "var(--theme-primary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = "var(--theme-dark)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = "var(--theme-primary)";
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularLoader size={20} color="white" />
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </form>
                </div>

                {/* Right: Logo Image - Hidden on small screens */}
                <div className="hidden md:flex items-center justify-center min-h-[400px]">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/logo.png";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <section className={`w-full ${spacing.footer.gapTop}`} style={{ marginBottom: 0, paddingBottom: 0, position: 'relative', zIndex: 10 }}>
        <Footer />
      </section>
    </div>
  );
}
