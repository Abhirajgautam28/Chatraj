import React, { useContext } from 'react';
import BaseModal from './BaseModal.jsx';
import { ThemeContext } from '../context/theme.context';
import { getThemeClasses } from '../utils/themeClasses.js';

const PrivacyModal = ({ isOpen, onRequestClose }) => {
    const { isDarkMode, uiTheme } = useContext(ThemeContext) || {};
    const themeStyle = getThemeClasses(uiTheme, isDarkMode);

    return (
        <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title="Privacy Policy" widthClass="max-w-3xl">
            <div className={`space-y-4 ${themeStyle.textMain}`}>
                <p><strong>Effective Date:</strong> January 1, 2026</p>

                <p>Welcome to ChatRaj. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, strictly adhering to the requirements of India's Digital Personal Data Protection (DPDP) Act 2026.</p>

                <h3 className="text-lg font-bold">1. Data Collection and Purpose Limitation</h3>
                <p>We collect personal data only when it is strictly necessary to provide and improve our Services. The data we collect includes:</p>
                <ul className="list-disc list-inside ml-4">
                    <li><strong>Account Information:</strong> Name, email address, and encrypted passwords.</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with the platform, project metadata, and collaborative activities.</li>
                    <li><strong>Technical Data:</strong> IP addresses, browser types, and device identifiers.</li>
                </ul>
                <p>Your data is processed exclusively for the purpose of operating the ChatRaj platform, authenticating users, providing AI suggestions, and ensuring security.</p>

                <h3 className="text-lg font-bold">2. Consent Management (DPDP Act 2026 Compliance)</h3>
                <p>Under the DPDP Act 2026, you have the right to control your personal data. We require explicit, clear, and specific consent before processing your information.</p>
                <ul className="list-disc list-inside ml-4">
                    <li><strong>Notice:</strong> We provide clear notice of the personal data collected and its purpose.</li>
                    <li><strong>Right to Withdraw:</strong> You may withdraw your consent at any time by deleting your account or contacting our Data Protection Officer.</li>
                </ul>

                <h3 className="text-lg font-bold">3. Data Fiduciary Obligations</h3>
                <p>As a Data Fiduciary under the DPDP Act 2026, ChatRaj implements robust security practices:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Encryption of data in transit and at rest.</li>
                    <li>Strict access controls and rate limiting to prevent unauthorized access.</li>
                    <li>Regular security audits and vulnerability assessments.</li>
                </ul>

                <h3 className="text-lg font-bold">4. Data Principal Rights</h3>
                <p>You, as a Data Principal, possess the following rights:</p>
                <ul className="list-disc list-inside ml-4">
                    <li><strong>Right to Access:</strong> Request a summary of the personal data we hold about you.</li>
                    <li><strong>Right to Correction:</strong> Request updates or corrections to inaccurate data.</li>
                    <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request the deletion of your personal data when it is no longer necessary for its original purpose or if you withdraw consent.</li>
                    <li><strong>Right to Grievance Redressal:</strong> Register complaints regarding data processing practices.</li>
                </ul>

                <h3 className="text-lg font-bold">5. Data Sharing and Third Parties</h3>
                <p>We do not sell your personal data. We may share data with trusted third-party Data Processors (e.g., hosting providers, Google Generative AI for code completion) strictly under contractual agreements that ensure they comply with the DPDP Act 2026 and protect your data.</p>

                <h3 className="text-lg font-bold">6. Data Localization and Retention</h3>
                <p>Your data is stored securely. We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. Once the purpose is fulfilled, data is securely anonymized or deleted.</p>

                <h3 className="text-lg font-bold">7. Changes to this Policy</h3>
                <p>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. Material changes will be communicated to you via the platform.</p>

                <p className="mt-6">If you have any questions or wish to exercise your rights under the DPDP Act 2026, please contact our Data Protection Officer via the platform's support channels.</p>
            </div>
        </BaseModal>
    );
};

export default PrivacyModal;
