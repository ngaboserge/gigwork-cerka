import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';

export function IndependentWorkerDisclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Independent Worker Disclaimer</h1>
          <p className="text-gray-600 mt-2">Last Updated: February 11, 2026</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h2 className="text-lg font-bold text-yellow-900 mb-2">Important Notice</h2>
              <p className="text-yellow-800 leading-relaxed">
                This disclaimer is a critical legal document that defines the relationship between workers, businesses, and Cerka. Please read it carefully before using our gig work services.
              </p>
            </div>
          </div>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Nature of the Platform</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cerka is a technology platform that connects independent workers with businesses seeking temporary, short-term, or project-based services. We provide the marketplace infrastructure but do not employ workers or provide employment services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cerka operates as an intermediary platform under the laws of the Republic of Rwanda and does not create, establish, or maintain any employment relationship with workers who use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Independent Contractor Status</h2>
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">Workers Are Independent Contractors</h3>
              <p className="text-blue-800 leading-relaxed">
                All workers using Cerka to find and perform work are independent contractors, not employees of Cerka or the businesses that hire them through the platform.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700 font-semibold">This means:</p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Workers have complete control over when, where, and how much they work</li>
                <li>Workers can accept or decline any job opportunity without penalty</li>
                <li>Workers are free to work for multiple businesses simultaneously</li>
                <li>Workers provide their own tools, equipment, and transportation</li>
                <li>Workers determine their own work methods and processes</li>
                <li>Workers bear the risk of profit or loss from their work</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. No Employment Relationship</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 With Cerka</h3>
                <p className="text-gray-700 mb-2">
                  Cerka does not employ workers. We do not:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Provide employee benefits (health insurance, pension, paid leave)</li>
                  <li>Withhold income tax or social security contributions</li>
                  <li>Provide workers' compensation insurance</li>
                  <li>Control work schedules or methods</li>
                  <li>Guarantee minimum hours or income</li>
                  <li>Provide training or supervision</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 With Businesses</h3>
                <p className="text-gray-700">
                  The relationship between workers and businesses is that of independent contractor and client. Each engagement is a separate contractual arrangement. Businesses hiring through Cerka are responsible for determining whether an employment relationship exists under Rwandan law based on the specific circumstances of each engagement.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Worker Responsibilities</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.1 Tax Obligations</h3>
                <p className="text-gray-700 mb-2">
                  As independent contractors, workers are responsible for:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Registering with Rwanda Revenue Authority (RRA) if required</li>
                  <li>Declaring all income earned through the platform</li>
                  <li>Paying income tax on earnings</li>
                  <li>Making social security contributions (if applicable)</li>
                  <li>Maintaining accurate financial records</li>
                  <li>Filing tax returns as required by Rwandan law</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.2 Insurance and Liability</h3>
                <p className="text-gray-700 mb-2">
                  Workers are responsible for:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Obtaining appropriate insurance coverage (health, liability, etc.)</li>
                  <li>Covering medical expenses from work-related injuries</li>
                  <li>Liability for damages caused during work performance</li>
                  <li>Personal safety and workplace safety compliance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.3 Business Operations</h3>
                <p className="text-gray-700 mb-2">
                  Workers must:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Provide their own equipment and tools</li>
                  <li>Cover their own transportation costs</li>
                  <li>Manage their own schedule and availability</li>
                  <li>Maintain professional standards and quality of work</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Business Responsibilities</h2>
            
            <p className="text-gray-700 mb-3">
              Businesses using Cerka to hire workers must:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Understand that workers are independent contractors, not employees</li>
              <li>Not exercise control that would create an employment relationship</li>
              <li>Comply with Rwanda Labour Law regarding worker classification</li>
              <li>Pay agreed rates promptly and in full</li>
              <li>Provide a safe working environment</li>
              <li>Not require exclusivity or restrict workers' ability to work elsewhere</li>
              <li>Issue appropriate documentation for tax purposes if required</li>
              <li>Obtain necessary insurance coverage for their business operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cerka's Role and Limitations</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6.1 Platform Services</h3>
                <p className="text-gray-700">
                  Cerka provides technology services including job posting, worker profiles, matching, messaging, time tracking tools, and payment facilitation. We do not supervise, direct, or control the work performed.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6.2 No Guarantees</h3>
                <p className="text-gray-700 mb-2">
                  Cerka does not guarantee:
                </p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Work availability or income for workers</li>
                  <li>Quality of work performed by workers</li>
                  <li>Worker reliability or attendance</li>
                  <li>Resolution of disputes between workers and businesses</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">6.3 Liability Limitations</h3>
                <p className="text-gray-700">
                  Cerka is not liable for workplace injuries, employment disputes, tax issues, insurance claims, or any damages arising from work performed through the platform.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Compliance with Rwanda Labour Law</h2>
            
            <p className="text-gray-700 mb-4">
              This disclaimer is designed to comply with the Rwanda Labour Law and regulations governing independent contractor relationships. However, the determination of whether a worker is an employee or independent contractor depends on the specific facts and circumstances of each engagement.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <p className="text-gray-700 font-semibold mb-2">Factors Considered Under Rwandan Law:</p>
              <ul className="list-disc ml-6 space-y-1 text-gray-700 text-sm">
                <li>Degree of control over work performance</li>
                <li>Worker's investment in equipment and materials</li>
                <li>Opportunity for profit or loss</li>
                <li>Permanency of the relationship</li>
                <li>Integration into business operations</li>
                <li>Provision of benefits</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Dispute Resolution</h2>
            
            <p className="text-gray-700 mb-3">
              Disputes regarding worker classification or employment status should be resolved:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Directly between the worker and the business</li>
              <li>Through mediation or arbitration as agreed</li>
              <li>Through appropriate Rwandan labor authorities</li>
              <li>Through Rwandan courts with jurisdiction</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Cerka may provide platform data to assist in dispute resolution but is not a party to employment disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Right to Modify Classification</h2>
            
            <p className="text-gray-700">
              If Rwandan authorities or courts determine that a worker should be classified as an employee rather than an independent contractor, that determination applies only to the specific worker-business relationship in question and does not affect Cerka's status as a technology platform provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Acknowledgment and Acceptance</h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                By using Cerka's gig work services, you acknowledge and agree that:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>You have read and understood this Independent Worker Disclaimer</li>
                <li>You understand that workers are independent contractors, not employees</li>
                <li>You accept the responsibilities and limitations described herein</li>
                <li>You will comply with all applicable Rwandan laws and regulations</li>
                <li>You understand that Cerka is a technology platform, not an employer or employment agency</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Questions and Legal Advice</h2>
            
            <p className="text-gray-700 mb-4">
              If you have questions about your status as an independent contractor or employee, or about your rights and obligations under Rwandan law, we recommend consulting with:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>A qualified Rwandan employment lawyer</li>
              <li>Rwanda Revenue Authority (RRA) for tax questions</li>
              <li>Ministry of Public Service and Labour</li>
              <li>A tax advisor or accountant</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            
            <p className="text-gray-700 mb-3">
              For questions about this disclaimer:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
              <p className="font-semibold">Cerka Platform</p>
              <p>Email: legal@cerka.rw</p>
              <p>Support: support@cerka.rw</p>
              <p>Location: Kigali, Rwanda</p>
            </div>
          </section>

          <section className="border-t pt-6">
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
              <p className="text-sm text-red-800 font-semibold mb-2">
                Legal Disclaimer:
              </p>
              <p className="text-sm text-red-700">
                This document does not constitute legal advice. The classification of workers as employees or independent contractors is a legal determination that depends on specific facts and circumstances. When in doubt, seek professional legal counsel.
              </p>
            </div>
          </section>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center gap-6">
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </div>
          <Link to="/" className="text-blue-600 hover:text-blue-700 block">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
