import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Help & Support</CardTitle>
            <div className="text-blue-700 text-lg font-medium mb-2">C-Resume AI Resume Parser</div>
            <div className="text-gray-600">Find answers to common questions and learn how to get the most out of C-Resume.</div>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">What is C-Resume?</h2>
              <p>C-Resume is an AI-powered resume parser that helps you quickly extract, categorize, and analyze information from resumes, making your hiring process faster and more efficient.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">How do I upload and parse resumes?</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Go to the Dashboard and click the <b>Upload</b> button.</li>
                <li>Select one or more resume files (PDF, DOC, DOCX, or TXT).</li>
                <li>Wait for the upload and parsing to complete. Parsed resumes will appear in the Recent Resumes list.</li>
                <li>Click on any resume to view detailed parsed information.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">What file formats are supported?</h2>
              <p>C-Resume supports PDF, DOC, DOCX, and TXT files. For best results, use clear and well-formatted resumes.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Is my data secure?</h2>
              <p>Yes! C-Resume uses enterprise-grade security and complies with GDPR and other data protection standards. Your data is never shared with third parties.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Can I export parsed data?</h2>
              <p>Yes, you can export parsed resume data in CSV or JSON format from the Dashboard.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Need more help?</h2>
              <p>Contact our support team at <a href="mailto:support@c-resume.com" className="text-blue-600 underline">support@c-resume.com</a> or use the Help Center link in the Dashboard for personalized assistance.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 