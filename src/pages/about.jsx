import React from 'react';
import { 
  BookOpen, 
  Target, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Award 
} from 'lucide-react';

const AboutPage = () => {
  // Distribution process steps
  const distributionSteps = [
    {
      title: "Application Review",
      description: "All applications are reviewed based on academic performance, financial need, and other relevant criteria.",
      icon: <CheckCircle className="text-blue-600 w-12 h-12" />
    },
    {
      title: "Eligibility Verification",
      description: "Applicants are verified for eligibility according to the scholarship guidelines.",
      icon: <Users className="text-blue-600 w-12 h-12" />
    },
    {
      title: "Award Notification",
      description: "Successful candidates are notified of their scholarship award.",
      icon: <Award className="text-blue-600 w-12 h-12" />
    },
    {
      title: "Fund Disbursement",
      description: "Scholarships are disbursed directly to educational institutions or students.",
      icon: <DollarSign className="text-blue-600 w-12 h-12" />
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            Prime Minister's Special Scholarship Scheme (PMSS)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering Students, Transforming Futures
          </p>
        </header>

        {/* Welcome Section */}
        <section className="bg-white shadow-lg rounded-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <BookOpen className="w-12 h-12 text-blue-600 mr-4" />
            <h2 className="text-2xl font-semibold text-blue-800">Welcome to PMSS</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Prime Minister's Special Scholarship Scheme (PMSS) Portal is dedicated to empowering deserving students 
            across the country by providing financial assistance for higher education. We are committed to breaking 
            down financial barriers and enabling talented students to pursue their academic dreams.
          </p>
        </section>

        {/* Vision and Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Target className="w-10 h-10 text-blue-600 mr-4" />
              <h3 className="text-2xl font-semibold text-blue-800">Our Vision</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To be a leading initiative in providing accessible, transparent, and impactful scholarship 
              opportunities, helping students from diverse backgrounds achieve their academic goals and 
              contribute to national development.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-10 h-10 text-blue-600 mr-4" />
              <h3 className="text-2xl font-semibold text-blue-800">Our Mission</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To identify, support, and nurture talented students through scholarships, helping them 
              gain access to quality education and empowering them to become future leaders and 
              professionals in various fields.
            </p>
          </div>
        </div>

        {/* Why Choose PMSS */}
        <section className="bg-white shadow-lg rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
            Why Choose PMSS?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <DollarSign className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">Financial Assistance</h3>
              <p className="text-gray-700">
                Scholarships cover tuition, living expenses, and other necessary educational costs.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <CheckCircle className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">Transparency</h3>
              <p className="text-gray-700">
                A clear and easy-to-follow process for applying and receiving scholarships.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">Diversity</h3>
              <p className="text-gray-700">
                Scholarships available for a wide range of students from various backgrounds and disciplines.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Award className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">Supportive Community</h3>
              <p className="text-gray-700">
                A network of students, educators, and professionals committed to your academic success.
              </p>
            </div>
          </div>
        </section>

        {/* Distribution Process */}
        <section className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-8 text-center">
            Funds Distribution Process
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {distributionSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h3 className="font-semibold text-blue-800 mb-2">{step.title}</h3>
                <p className="text-gray-700 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;