import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';

export function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last Updated: February 11, 2026</p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using Cerka ("Platform", "Service", "we", "us", or "our"), you agree to be bound by these Terms of Service and all applicable laws and regulations of the Republic of Rwanda. If you do not agree with any of these terms, you are prohibited from using this Platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms constitute a legally binding agreement between you and Cerka, operating under the laws of Rwanda.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cerka provides two primary services:
            </p>
            <div className="ml-6 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">2.1 Gig Work Marketplace</h3>
                <p className="text-gray-700">
                  A platform connecting workers with businesses for short-term employment opportunities, shift work, and temporary assignments within Rwanda.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">2.2 Materials Marketplace</h3>
                <p className="text-gray-700">
                  A marketplace for buying and selling construction materials, agricultural products, food commodities, electronics, vehicles, and other goods, including price intelligence and market data services.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Eligibility</h2>
            <div className="space-y-3 text-gray-700">
              <p>To use this Platform, you must:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Be a resident of Rwanda or conducting business in Rwanda</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Accounts and Verification</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">4.1 Account Registration</h3>
                <p className="text-gray-700">
                  You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account information and for all activities under your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">4.2 Identity Verification</h3>
                <p className="text-gray-700">
                  We may require identity verification through National ID, business registration documents, or other government-issued identification as required by Rwandan law. Failure to provide verification may result in account suspension.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">4.3 Business Verification</h3>
                <p className="text-gray-700">
                  Businesses and suppliers must provide valid Rwanda Development Board (RDB) registration, Tax Identification Number (TIN), and other relevant business documentation.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Gig Work Terms</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">5.1 Worker Obligations</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Provide accurate information about skills, experience, and availability</li>
                  <li>Arrive on time and complete assigned shifts professionally</li>
                  <li>Follow all workplace safety regulations and employer instructions</li>
                  <li>Use the time tracking system accurately and honestly</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">5.2 Employer Obligations</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Provide accurate job descriptions and compensation details</li>
                  <li>Comply with Rwanda Labour Law and minimum wage requirements</li>
                  <li>Provide a safe working environment</li>
                  <li>Pay workers promptly according to agreed terms</li>
                  <li>Approve time tracking records in a timely manner</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">5.3 Employment Relationship</h3>
                <p className="text-gray-700">
                  Cerka is a platform connecting workers and employers. We are not an employer and do not create an employment relationship with workers. All employment relationships are between workers and the businesses that hire them.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Marketplace Terms</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">6.1 Supplier Obligations</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Provide accurate product descriptions, prices, and availability</li>
                  <li>Ensure products meet quality and safety standards</li>
                  <li>Honor quoted prices and delivery commitments</li>
                  <li>Maintain necessary licenses for regulated products</li>
                  <li>Comply with Rwanda Standards Board (RSB) requirements where applicable</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">6.2 Buyer Obligations</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Provide accurate quote requests and requirements</li>
                  <li>Communicate clearly with suppliers</li>
                  <li>Honor purchase commitments made through the platform</li>
                  <li>Make payments according to agreed terms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">6.3 Transactions</h3>
                <p className="text-gray-700">
                  Cerka facilitates connections between buyers and suppliers but is not a party to transactions. All contracts for sale are directly between buyers and suppliers. We do not guarantee the quality, safety, or legality of items listed.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payments and Fees</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">7.1 Platform Fees</h3>
                <p className="text-gray-700">
                  Cerka may charge service fees for platform usage. All fees will be clearly disclosed before transactions. Fees are subject to change with 30 days notice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">7.2 Currency</h3>
                <p className="text-gray-700">
                  All transactions on the platform are conducted in Rwandan Francs (RWF) unless otherwise specified.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">7.3 Taxes</h3>
                <p className="text-gray-700">
                  Users are responsible for all applicable taxes including VAT, income tax, and withholding tax as required by Rwanda Revenue Authority (RRA). Cerka may be required to report transaction information to tax authorities.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Activities</h2>
            <p className="text-gray-700 mb-3">Users may not:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Post false, misleading, or fraudulent information</li>
              <li>Engage in price manipulation or market manipulation</li>
              <li>List illegal goods or services</li>
              <li>Discriminate based on ethnicity, gender, religion, or other protected characteristics</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Circumvent platform fees or payment systems</li>
              <li>Use automated systems to scrape or collect data</li>
              <li>Violate any Rwandan laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Content and Intellectual Property</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">9.1 User Content</h3>
                <p className="text-gray-700">
                  You retain ownership of content you post but grant Cerka a license to use, display, and distribute your content on the platform. You represent that you have all necessary rights to the content you post.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">9.2 Platform Content</h3>
                <p className="text-gray-700">
                  All platform content, including design, logos, text, and software, is owned by Cerka and protected by Rwandan and international intellectual property laws.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacy and Data Protection</h2>
            <p className="text-gray-700">
              Your use of the platform is subject to our Privacy Policy. We comply with Rwanda's data protection laws and regulations. By using the platform, you consent to our collection and use of your information as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">11.1 Platform Disputes</h3>
                <p className="text-gray-700">
                  We encourage users to resolve disputes directly. If needed, contact our support team for mediation assistance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">11.2 Governing Law</h3>
                <p className="text-gray-700">
                  These Terms are governed by the laws of the Republic of Rwanda. Any disputes shall be resolved in Rwandan courts with jurisdiction in Kigali.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <p className="text-gray-700 mb-3">
              To the maximum extent permitted by Rwandan law:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Cerka is not liable for disputes between users</li>
              <li>We do not guarantee continuous, error-free platform operation</li>
              <li>We are not responsible for user-generated content</li>
              <li>Our total liability is limited to fees paid to us in the past 12 months</li>
              <li>We are not liable for indirect, consequential, or punitive damages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Account Suspension and Termination</h2>
            <p className="text-gray-700 mb-3">
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Receive multiple user complaints</li>
              <li>Fail to complete identity verification</li>
              <li>Remain inactive for extended periods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these Terms at any time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 mb-3">
              For questions about these Terms, contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
              <p className="font-semibold">Cerka Platform</p>
              <p>Email: legal@cerka.rw</p>
              <p>Support: support@cerka.rw</p>
              <p>Location: Kigali, Rwanda</p>
            </div>
          </section>

          <section className="border-t pt-6">
            <p className="text-sm text-gray-600 italic">
              By using Cerka, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws of the Republic of Rwanda.
            </p>
          </section>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
