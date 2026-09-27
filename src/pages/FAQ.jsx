import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      category: "General Information",
      questions: [
        {
          question: "What is the MoTA Scholarship & Fellowship Management System?",
          answer: "It is an integrated digital platform developed for the Ministry of Tribal Affairs (MoTA), Government of India, to streamline end-to-end administration of scholarship and research fellowship schemes for Scheduled Tribe (ST) students across India.",
          highlight: true
        },
        {
          question: "What major schemes are covered under this portal?",
          answer: "This portal manages the major Central Sector schemes implemented by MoTA: (1) National Fellowship for Higher Education of ST Students (NFST) for M.Phil and Ph.D. research programmes in India, (2) National Overseas Scholarship (NOS) for Master's and Ph.D. abroad, and (3) Top Class Education (TCE) Scheme across 259 premier notified institutions.",
          highlight: true
        },
        {
          question: "Who is eligible to apply for these scholarships?",
          answer: "Students belonging to notified Scheduled Tribes (ST) across India who meet the scheme-specific educational qualifications, institution admission, and annual family income criteria specified in the official MoTA guidelines.",
          highlight: true
        },
      ],
    },
    {
      category: "Document Management",
      questions: [
        {
          question: "What does 'Pending Verification' mean under Document Status?",
          answer: "It means your document is under review. You'll be notified once verification is complete.",
          highlight: true
        },
        {
          question: "Why was my document not verified?",
          answer: "This could be due to incorrect or incomplete information. Check the notifications on your dashboard for a specific reason, and reupload the correct document.",
          highlight: true
        },
      ],
    },
    {
      category: "Scholarship Status",
      questions: [
        {
          question: "How can I check my scholarship status?",
          answer: "Your scholarship status is displayed under Scholarship Status on your dashboard.",
          highlight: true
        },
        {
          question: "What does 'Approved' mean in the Scholarship Status section?",
          answer: "It indicates that your application has been verified and approved for disbursement.",
          highlight: true
        },
      ],
    },
    {
      category: "E-KYC and Payment",
      questions: [
        {
          question: "What is the E-KYC Portal for?",
          answer: "The E-KYC Portal ensures that your identity and banking details are verified for scholarship disbursement.",
          highlight: true
        },
        {
          question: "How can I view my payment history?",
          answer: "Use the Payment History option in the left menu to see all scholarship-related transactions.",
          highlight: true
        },
        {
          question: "What should I do if my scholarship payment is delayed?",
          answer: "Check your notifications for updates or contact support for assistance.",
          highlight: true
        },
      ],
    },
    {
      category: "Guidelines",
      questions: [
        {
          question: "Where can I find detailed instructions for applying?",
          answer: "Go to the 'How to Apply' section on the top navigation bar for step-by-step instructions.",
          highlight: true
        },
        {
          question: "What should I do if I need help understanding the guidelines?",
          answer: "Contact support via the Contacts section available on the top menu.",
          highlight: true
        },
      ],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-6 py-8 bg-blue-600 text-white text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center">
            <HelpCircle className="mr-3 w-10 h-10" />
            Frequently Asked Questions
          </h1>
        </div>
        
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border-b last:border-b-0">
            <div className="bg-gray-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">{section.category}</h2>
            </div>
            
            {section.questions.map((faq, faqIndex) => (
              <div 
                key={faqIndex} 
                className={`border-t first:border-t-0 ${faq.highlight ? 'bg-blue-50' : 'bg-white'}`}
              >
                <div
                  className="faq-question flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleFAQ(`${sectionIndex}-${faqIndex}`)}
                >
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  {activeIndex === `${sectionIndex}-${faqIndex}` ? (
                    <ChevronUp className="text-gray-600 w-6 h-6" />
                  ) : (
                    <ChevronDown className="text-gray-600 w-6 h-6" />
                  )}
                </div>
                
                {activeIndex === `${sectionIndex}-${faqIndex}` && (
                  <div className="faq-answer px-6 py-4 bg-gray-50 text-gray-700">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;