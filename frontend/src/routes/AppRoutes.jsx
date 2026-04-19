import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import UserAuth from '../auth/UserAuth'
import { ChatRajThemeProvider } from '../context/chatraj-theme.context';
import LoadingScreen from '../components/LoadingScreen';

const Login = lazy(() => import('../screens/Login'));
const Register = lazy(() => import('../screens/Register'));
const Home = lazy(() => import('../screens/Home'));
const Dashboard = lazy(() => import('../screens/Dashboard'));
const Project = lazy(() => import('../screens/Project'));
const Categories = lazy(() => import('../screens/Categories'));
const Logout = lazy(() => import('../screens/Logout'));
const WelcomeChatRaj = lazy(() => import('../screens/WelcomeChatRaj'));
const ChatRaj = lazy(() => import('../screens/ChatRaj'));
const Blogs = lazy(() => import('../screens/Blogs'));
const CreateBlogForm = lazy(() => import('../components/CreateBlogForm'));
const SingleBlogPage = lazy(() => import('../screens/SingleBlogPage'));

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
                    <Route path="*" element={
                        <div className="flex flex-col items-center justify-center min-h-screen text-white bg-transparent">
                            <h1 className="mb-4 text-6xl font-bold">404</h1>
                            <p className="mb-8 text-xl">Oops! Page not found.</p>
                            <a href="/" className="px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
                                Go Back Home
                            </a>
                        </div>
                    } />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRoutes