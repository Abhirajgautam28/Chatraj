with open('frontend/src/screens/Home.jsx', 'r') as f:
    content = f.read()

import_statement = "import LiquidCursor from '../components/LiquidCursor';\n"
if "LiquidCursor" in content and import_statement not in content:
    # Add it after the other component imports
    content = content.replace("import TextType from '../components/TextType.jsx';", f"import TextType from '../components/TextType.jsx';\n{import_statement}")

with open('frontend/src/screens/Home.jsx', 'w') as f:
    f.write(content)
