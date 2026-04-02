import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';

export function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last Updated: February 11, 2026</p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cerka ("we", "us", or "our") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform operating in the Republic of Rwanda.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We comply with Rwanda's data protection laws and regulations, including any applicable provisions under Rwandan law regarding the protection of personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
                <p className="text-gray-700 mb-2">When you register and use our platform, we collect:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Full name and contact information (email, phone number)</li>
                  <li>National ID number or passport number</li>
                  <li>Date of birth and gender</li>
                  <li>Physical address and location in Rwanda</li>
                  <li>Profile photo or avatar</li>
                  <li>Bank account or mobile money details for payments</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.2 Business Information</h3>
                <p className="text-gray-700 mb-2">For businesses and suppliers:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Business name and registration number (RDB)</li>
                  <li>Tax Identification Number (TIN)</li>
                  <li>Business address and contact details</li>
                  <li>Business licenses and certifications</li>
                  <li>Authorized representative information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.3 Platform Usage Data</h3>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Job applications and shift bookings</li>
                  <li>Marketplace listings and transactions</li>
                  <li>Messages and communications on the platform</li>
                  <li>Reviews, ratings, and feedback</li>
                  <li>Time tracking and work history</li>
                  <li>Search queries and browsing behavior</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.4 Technical Information</h3>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Login times and activity logs</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.5 Location Data</h3>
                <p className="text-gray-700">
                  We collect location data to connect you with nearby opportunities and services. This includes your city, district, and sector within Rwanda.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use your information to:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Create and manage your account</li>
              <li>Connect workers with employers and buyers with suppliers</li>
              <li>Process transactions and payments</li>
              <li>Verify identity and prevent fraud</li>
              <li>Provide customer support</li>
              <li>Send notifications about platform activity</li>
              <li>Improve our services and user experience</li>
              <li>Generate market intelligence and price data</li>
              <li>Comply with legal obligations and tax reporting</li>
              <li>Enforce our Terms of Service</li>
              <li>Communicate updates, promotions, and platform news</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 mb-3">We process your personal data based on:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Your consent when you register and use the platform</li>
              <li>Contractual necessity to provide our services</li>
              <li>Legal obligations under Rwandan law</li>
              <li>Legitimate business interests in operating the platform</li>
              <li>Protection of vital interests (safety and security)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.1 With Other Users</h3>
                <p className="text-gray-700">
                  Your profile information, ratings, and reviews are visible to other users to facilitate connections. Workers' profiles are visible to employers, and supplier listings are visible to buyers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.2 Service Providers</h3>
                <p className="text-gray-700">
                  We share data with trusted third-party service providers who help us operate the platform, including payment processors, cloud hosting, and communication services.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.3 Government Authorities</h3>
                <p className="text-gray-700">
                  We may disclose information to Rwanda Revenue Authority (RRA), law enforcement, or other government agencies when required by law or to comply with legal processes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.4 Business Transfers</h3>
                <p className="text-gray-700">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.5 Aggregated Data</h3>
                <p className="text-gray-700">
                  We may share anonymized, aggregated data for market research, price intelligence, and statistical purposes. This data cannot identify individual users.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700 mb-3">We implement security measures to protect your data:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and monitoring</li>
              <li>Employee training on data protection</li>
              <li>Secure data centers and backup systems</li>
            </ul>
            <p className="text-gray-700 mt-3">
              However, no system is completely secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 mb-3">
              We retain your personal data for as long as necessary to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Provide our services to you</li>
              <li>Comply with legal and tax obligations (minimum 7 years for financial records)</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain business records</li>
            </ul>
            <p className="text-gray-700 mt-3">
              After account deletion, we may retain certain information for legal compliance and legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Request data portability</li>
              <li>Lodge a complaint with relevant authorities</li>
            </ul>
            <p className="text-gray-700 mt-3">
              To exercise these rights, contact us at privacy@cerka.rw
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-3">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage</li>
              <li>Improve user experience</li>
              <li>Provide personalized content</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can control cookies through your browser settings, but this may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700">
              Our platform is not intended for users under 18 years of age. We do not knowingly collect information from children. If we discover we have collected data from a child, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700">
              Your data is primarily stored and processed in Rwanda. If we transfer data outside Rwanda, we ensure appropriate safeguards are in place to protect your information in accordance with Rwandan law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Third-Party Links</h2>
            <p className="text-gray-700">
              Our platform may contain links to third-party websites or services. We are not responsible for their privacy practices. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Marketing Communications</h2>
            <p className="text-gray-700">
              We may send you promotional emails, SMS, or notifications about platform features and opportunities. You can opt out at any time by:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700 mt-3">
              <li>Clicking unsubscribe in emails</li>
              <li>Adjusting notification settings in your account</li>
              <li>Contacting support@cerka.rw</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You cannot opt out of essential service communications (e.g., account security, transaction confirmations).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Data Breach Notification</h2>
            <p className="text-gray-700">
              In the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by Rwandan law, typically within 72 hours of discovery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Significant changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Us</h2>
            <p className="text-gray-700 mb-3">
              For questions, concerns, or requests regarding your privacy and personal data:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 space-y-2">
              <p className="font-semibold">Data Protection Officer</p>
              <p>Cerka Platform</p>
              <p>Email: privacy@cerka.rw</p>
              <p>Support: support@cerka.rw</p>
              <p>Phone: +250 XXX XXX XXX</p>
              <p>Address: Kigali, Rwanda</p>
            </div>
          </section>

          <section className="border-t pt-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-blue-900">Your Privacy Matters:</span> We are committed to transparency and protecting your personal information. If you have any concerns about how we handle your data, please don't hesitate to contact us.
              </p>
            </div>
          </section>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <Link to="/terms" className="text-blue-600 hover:text-blue-700 mr-6">
            View Terms of Service
          </Link>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
