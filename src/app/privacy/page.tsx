'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, RefreshCw, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <Eye className="w-6 h-6 text-mint" />,
      title: "1. Information We Collect",
      content: "When you use Zander, we collect the content you provide, including notes, voice memos, and text inputs. We also collect basic usage data to improve our services and ensure the app functions properly. For account management, we store your email address and authentication details."
    },
    {
      icon: <Server className="w-6 h-6 text-sage" />,
      title: "2. How We Use Your Data",
      content: "Your data is primarily used to provide you with the core functionality of Zander—processing and organizing your notes. We use advanced AI models to synthesize and summarize your data locally and securely. We do not sell your personal information to third parties."
    },
    {
      icon: <Lock className="w-6 h-6 text-lime" />,
      title: "3. Data Security",
      content: "We implement industry-standard security measures to protect your data during transmission and at rest. Your notes are stored securely using encrypted cloud databases, ensuring only authorized access through your authenticated account."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-mint" />,
      title: "4. Data Retention & Deletion",
      content: "You retain full control over your data. You can request to delete your account and all associated data at any time from within the app settings. Upon deletion, all your personal notes, voice data, and account information will be permanently removed from our active servers."
    },
    {
      icon: <Shield className="w-6 h-6 text-sage" />,
      title: "5. Third-Party Services",
      content: "We use trusted third-party services for database hosting and authentication, and specific AI providers to process note summaries. These services are bound by strict confidentiality and data protection agreements."
    },
    {
      icon: <Mail className="w-6 h-6 text-lime" />,
      title: "6. Contact Us",
      content: "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us. We are committed to resolving your inquiries promptly."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-mint/30 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-dark-green text-white pb-32 pt-20 px-6 sm:px-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-mint via-dark-green to-dark-green"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                <Shield className="w-8 h-8 text-mint" />
              </div>
              <h2 className="text-mint font-semibold tracking-wider uppercase text-sm letter-spacing-widest">Zander App</h2>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-neutral-300 max-w-2xl leading-relaxed font-light">
              We believe your data is yours alone. Our privacy practices are designed to be transparent, secure, and focused entirely on providing you with the best experience.
            </p>
            <div className="mt-10 flex items-center gap-4 text-sm text-neutral-400">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm font-medium">
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 -mt-20 relative z-20 pb-24">
        <motion.div 
          className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8 md:p-12 lg:p-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-600 text-lg md:text-xl leading-relaxed mb-12 font-light">
              Welcome to Zander. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="flex-shrink-0 p-4 rounded-2xl bg-neutral-50 group-hover:bg-mint/10 border border-neutral-100 group-hover:border-mint/20 transition-all duration-500 shadow-sm group-hover:shadow-md">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-dark-green mb-4 group-hover:text-mint transition-colors duration-300">{section.title}</h3>
                      <p className="text-neutral-600 leading-relaxed text-lg font-light">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <hr className="my-16 border-neutral-100" />

            <div className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl p-8 md:p-10 border border-neutral-100 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold text-dark-green mb-3">Still have questions?</h3>
                <p className="text-neutral-600 mb-8 text-lg font-light max-w-md mx-auto">
                  We're here to help you understand how your data is handled.
                </p>
                <a href="mailto:support@zander.app" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-dark-green text-white font-medium rounded-2xl hover:bg-mint hover:text-dark-green transition-all duration-300 shadow-lg hover:shadow-mint/20 transform hover:-translate-y-1">
                  <Mail className="w-5 h-5" />
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-10 text-center text-neutral-500 font-light">
        <p>© {new Date().getFullYear()} Zander. All rights reserved.</p>
      </footer>
    </div>
  );
}
