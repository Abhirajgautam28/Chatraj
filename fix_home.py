with open('frontend/src/screens/Home.jsx', 'r') as f:
    content = f.read()

if "import LiquidCursor" not in content:
    content = content.replace("import TextType from '../components/TextType.jsx';", "import TextType from '../components/TextType.jsx';\nimport LiquidCursor from '../components/LiquidCursor.jsx';")

if "<LiquidCursor />" not in content:
    content = content.replace("    <div className={`flex flex-col min-h-screen overflow-x-hidden ${isDarkMode ? 'bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900' : 'bg-gray-50'}`}>\n", "    <div className={`flex flex-col min-h-screen overflow-x-hidden ${isDarkMode ? 'bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900' : 'bg-gray-50'}`}>\n      <LiquidCursor />\n")

with open('frontend/src/screens/Home.jsx', 'w') as f:
    f.write(content)
