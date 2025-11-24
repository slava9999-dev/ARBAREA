import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="flex justify-center items-center h-40">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-stone-200 border-t-amber-600 rounded-full"
            />
        </div>
    );
};

export default Loader;
