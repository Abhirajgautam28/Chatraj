import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'
import Dashboard from '../screens/Dashboard'
import Project from '../screens/Project'
import UserAuth from '../auth/UserAuth'
import Categories from '../screens/Categories'
import Logout from '../screens/Logout'
import WelcomeChatRaj from '../screens/WelcomeChatRaj';
import ChatRaj from '../screens/ChatRaj';
import { ChatRajThemeProvider } from '../context/chatraj-theme.context';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<UserAuth><Dashboard /></UserAuth>} />
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
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes