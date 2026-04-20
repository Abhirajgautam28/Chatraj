import React, { lazy, Suspense } from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import UserAuth from '../auth/UserAuth';
import LoadingScreen from '../components/LoadingScreen';

// Lazy load screens for performance optimization
const Home = lazy(() => import('../screens/Home'));
const Login = lazy(() => import('../screens/Login'));
const Register = lazy(() => import('../screens/Register'));
const Dashboard = lazy(() => import('../screens/Dashboard'));
const Project = lazy(() => import('../screens/Project'));
const Categories = lazy(() => import('../screens/Categories'));
const Logout = lazy(() => import('../screens/Logout'));
const WelcomeChatRaj = lazy(() => import('../screens/WelcomeChatRaj'));
const ChatRaj = lazy(() => import('../screens/ChatRaj'));
const Blogs = lazy(() => import('../screens/Blogs'));
const SingleBlogPage = lazy(() => import('../screens/SingleBlogPage'));
const CreateBlogForm = lazy(() => import('../components/CreateBlogForm'));
const NotFound = lazy(() => import('../screens/NotFound'));

import { ChatRajThemeProvider } from '../context/chatraj-theme.context';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<UserAuth><Dashboard /></UserAuth>} />
                    <Route path="/dashboard/:categoryName" element={<UserAuth><Dashboard /></UserAuth>} />
                    <Route path="/categories" element={<UserAuth><Categories /></UserAuth>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/project" element={<UserAuth><Project /></UserAuth>} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/welcome-chatraj" element={<UserAuth><WelcomeChatRaj /></UserAuth>} />
                    <Route path="/chat" element={
                        <UserAuth>
                            <ChatRajThemeProvider>
                                <ChatRaj />
                            </ChatRajThemeProvider>
                        </UserAuth>
                    } />
                    <Route path="/blogs" element={<UserAuth><Blogs /></UserAuth>} />
                    <Route path="/blogs/create" element={<UserAuth><CreateBlogForm /></UserAuth>} />
                    <Route path="/blogs/:id" element={<UserAuth><SingleBlogPage /></UserAuth>} />
                    {/* Catch-all 404 route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRoutes