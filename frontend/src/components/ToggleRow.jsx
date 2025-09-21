import PropTypes from 'prop-types';
ToggleRow.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};
export default function ToggleRow({ label, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="font-medium text-gray-900 dark:text-white">{label}</span>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                aria-pressed={checked}
            >
                <span
                    className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
}
