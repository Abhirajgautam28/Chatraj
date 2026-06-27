const fs = require('fs');
const file = 'frontend/src/auth/UserAuth.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "import { UserContext } from '../context/user.context'",
    "import { UserContext } from '../context/user.context'\nimport axios from '../config/axios'"
);

content = content.replace(
    "const { user } = useContext(UserContext)",
    "const { user, setUser } = useContext(UserContext)"
);

content = content.replace(
    "if (user) {\n            setLoading(false);\n        }",
    "if (user) {\n            setLoading(false);\n        } else {\n            axios.get('/api/users/profile').then(res => {\n                const responseData = res.data.data || res.data;\n                setUser(responseData.user);\n                setLoading(false);\n            }).catch(() => {\n                localStorage.removeItem('token');\n                navigate('/login', { replace: true });\n            });\n        }"
);

fs.writeFileSync(file, content);
