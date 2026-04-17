import React from 'react';
import Layout from './layout/Layout';
import notFoundImg from "./../assets/404.jpg";

const NotFound = () => {
    return (
        <Layout>
            <div className="flex items-center justify-center h-[calc(100vh-80px)] px-4">
                <img
                    src={notFoundImg}
                    alt="404 Not Found"
                    className="max-w-xl w-full h-auto object-contain"
                />
            </div>
        </Layout>
    );
};

export default NotFound;