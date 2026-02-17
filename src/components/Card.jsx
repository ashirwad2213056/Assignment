import React from 'react';

const Card = ({
    children,
    className = '',
    hover = true,
    padding = 'md'
}) => {
    const baseStyles = 'bg-white rounded-xl shadow-md';
    const hoverStyles = hover ? 'hover:shadow-xl transition-shadow duration-300' : '';

    const paddingSizes = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`${baseStyles} ${hoverStyles} ${paddingSizes[padding]} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
