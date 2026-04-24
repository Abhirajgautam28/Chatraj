import React from 'react';
import { Link } from 'react-router-dom';

const MaterialBlogCard = ({ blog }) => {
    return (
        <Link to={`/blogs/${blog._id}`} className="block group">
            <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">Engineering</span>
                    <span className="text-[10px] text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-6">{blog.summary || blog.content?.slice(0, 100)}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {blog.author?.firstName?.[0]}
                        </div>
                        <span className="text-xs text-gray-300">{blog.author?.firstName}</span>
                    </div>
                    <div className="flex gap-3 text-gray-500">
                        <span className="flex items-center gap-1 text-[10px]"><i className="ri-heart-line"></i> {blog.likesCount || 0}</span>
                        <span className="flex items-center gap-1 text-[10px]"><i className="ri-chat-3-line"></i> {blog.commentsCount || 0}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default React.memo(MaterialBlogCard);
