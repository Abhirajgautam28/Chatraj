with open('frontend/src/screens/Home.jsx', 'r') as f:
    content = f.read()

if "const [showFabMenu, setShowFabMenu] = useState(false);" not in content:
    content = content.replace("  const [showAskChatRajModal, setShowAskChatRajModal] = useState(false);", "  const [showAskChatRajModal, setShowAskChatRajModal] = useState(false);\n  const [showFabMenu, setShowFabMenu] = useState(false);")

with open('frontend/src/screens/Home.jsx', 'w') as f:
    f.write(content)
