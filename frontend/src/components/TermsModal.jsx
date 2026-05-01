import React, { useContext } from 'react';
import BaseModal from './BaseModal.jsx';
import { ThemeContext } from '../context/theme.context';
import { getThemeClasses } from '../utils/themeClasses.js';

const TermsModal = ({ isOpen, onRequestClose }) => {
    const { isDarkMode, uiTheme } = useContext(ThemeContext) || {};
    const themeStyle = getThemeClasses(uiTheme, isDarkMode);

    return (
        <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title="Terms of Service" widthClass="max-w-3xl">
            <div className={`space-y-4 ${themeStyle.textMain}`}>
                <p><strong>Effective Date:</strong> January 1, 2026</p>

                <p>Welcome to ChatRaj. These Terms of Service ("Terms") govern your use of the ChatRaj platform, website, and associated services (collectively, the "Services"). By registering for an account or using our Services, you agree to comply with and be bound by these Terms.</p>

                <h3 className="text-lg font-bold">1. Acceptance of Terms</h3>
                <p>By creating an account, checking the "Accept Terms" box, or otherwise accessing our Services, you represent that you have read, understood, and agree to these Terms. If you do not agree, you must not use our Services.</p>

                <h3 className="text-lg font-bold">2. Legal Compliance and DPDP Act 2026</h3>
                <p>ChatRaj is committed to complying with all applicable laws, including India's Digital Personal Data Protection (DPDP) Act 2026. Your use of the Services is subject to our Privacy Policy, which outlines how we collect, use, and protect your personal data in accordance with the DPDP Act 2026.</p>
                <ul className="list-disc list-inside ml-4">
                    <li><strong>Consent:</strong> We process your personal data only with your explicit consent, which you provide upon registration.</li>
                    <li><strong>Purpose Limitation:</strong> Data is used solely for providing and improving the Services.</li>
                    <li><strong>Data Fiduciary Obligations:</strong> We implement appropriate technical and organizational measures to ensure data security.</li>
                </ul>

                <h3 className="text-lg font-bold">3. Account Registration</h3>
                <p>To use certain features, you must register for an account. You agree to provide accurate, current, and complete information and to keep this information updated. You are responsible for safeguarding your password and account details.</p>

                <h3 className="text-lg font-bold">4. User Conduct</h3>
                <p>You agree not to use the Services to:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Violate any local, state, national, or international law.</li>
                    <li>Infringe upon the intellectual property rights of others.</li>
                    <li>Upload or transmit viruses, malware, or any other malicious code.</li>
                    <li>Engage in unauthorized scraping, data mining, or harvesting of personal data.</li>
                </ul>

                <h3 className="text-lg font-bold">5. Intellectual Property</h3>
                <p>All content, features, and functionality on the ChatRaj platform, including but not limited to text, graphics, logos, and software, are the exclusive property of ChatRaj and are protected by copyright, trademark, and other intellectual property laws.</p>

                <h3 className="text-lg font-bold">6. Termination</h3>
                <p>We reserve the right to suspend or terminate your account at any time, with or without cause or notice, if we believe you have violated these Terms or for any other reason.</p>

                <h3 className="text-lg font-bold">7. Disclaimer of Warranties</h3>
                <p>The Services are provided "as is" and "as available" without any warranties of any kind, either express or implied. ChatRaj does not warrant that the Services will be uninterrupted, error-free, or secure.</p>

                <h3 className="text-lg font-bold">8. Limitation of Liability</h3>
                <p>In no event shall ChatRaj be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Services.</p>

                <h3 className="text-lg font-bold">9. Changes to Terms</h3>
                <p>We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on the platform. Your continued use of the Services after such modifications constitutes your acceptance of the revised Terms.</p>

                <p className="mt-6">For any questions regarding these Terms, please contact us through the platform.</p>
            </div>
        </BaseModal>
    );
};

export default TermsModal;
