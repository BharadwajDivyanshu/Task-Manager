const Spinner = ({size = 'md'}) => {
    const sizeClasses = size === 'sm' ? 'w-4 h-4 border-2' : 'w-6 h-6 border-4';
    return <div className={`animate-spin rounded-full ${sizeClasses} border-t-transparent border-white`}></div>;
};

export default Spinner;