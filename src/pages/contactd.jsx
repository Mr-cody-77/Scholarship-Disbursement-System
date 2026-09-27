import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contactd = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden max-w-md w-full">
        <div className="bg-blue-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="mt-2 text-blue-100">We're here to help</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
            <Mail className="text-blue-600 h-8 w-8" />
            <div>
              <h3 className="font-semibold text-gray-800">Email</h3>
              <a 
                href="mailto:support@example.com" 
                className="text-gray-600 hover:text-blue-700 transition-colors"
              >
                support@example.com
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
            <Phone className="text-blue-600 h-8 w-8" />
            <div>
              <h3 className="font-semibold text-gray-800">Phone</h3>
              <a 
                href="tel:+11234567890" 
                className="text-gray-600 hover:text-blue-700 transition-colors"
              >
                (123) 456-7890
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
            <MapPin className="text-blue-600 h-8 w-8" />
            <div>
              <h3 className="font-semibold text-gray-800">Address</h3>
              <p className="text-gray-600">
                1234 Business St., Suite 100
                <br />
                City, State, ZIP
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
            <Clock className="text-blue-600 h-8 w-8" />
            <div>
              <h3 className="font-semibold text-gray-800">Business Hours</h3>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-200 p-4 text-center">
          <p className="text-gray-700 text-sm">
            We strive to respond to all inquiries within 1 business day
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contactd;