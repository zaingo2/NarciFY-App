import React from 'react';

export const Disclaimer: React.FC = () => {
    return (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 p-4 rounded-md mb-6" role="alert">
            <div className="flex">
                <div className="py-1">
                    <i className="fa fa-warning fa-lg mr-4 text-amber-400"></i>
                </div>
                <div>
                    <p className="font-bold">Important Disclaimer</p>
                    <p className="text-sm">
                        NarciFY is an AI-powered tool for informational purposes only and is not a substitute for professional psychological or legal advice. If you are in immediate danger, please contact your local emergency services.
                    </p>
                </div>
            </div>
        </div>
    );
};
