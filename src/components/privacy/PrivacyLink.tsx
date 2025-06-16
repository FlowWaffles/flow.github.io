import './PrivacyLink.css';

const PrivacyLink = () => {
    return (
        <div className="privacy-link">
            <a href="/privacy"
               target="_blank"
               aria-label="Privacy Policy"
               rel="noopener noreferrer"
            >
                Privacy Policy
            </a>
        </div>
    );
}
export default PrivacyLink;
