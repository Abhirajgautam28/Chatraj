import re

with open('frontend/src/screens/Home.jsx', 'r') as f:
    content = f.read()

# The error was "The prop `faqs[0].q` is marked as required in `FAQSection`, but its value is `undefined`"
# Because I made the faqs array use `question` and `answer` instead of `q` and `a`.
# I will change it to `q` and `a`.

content = content.replace("question: \"What is ChatRaj?\",", "q: \"What is ChatRaj?\",")
content = content.replace("answer: \"ChatRaj is an AI-powered code assistant that helps developers write better code faster.\"", "a: \"ChatRaj is an AI-powered code assistant that helps developers write better code faster.\"")

content = content.replace("question: \"Is ChatRaj free?\",", "q: \"Is ChatRaj free?\",")
content = content.replace("answer: \"Yes, you can try ChatRaj for free.\"", "a: \"Yes, you can try ChatRaj for free.\"")

content = content.replace("question: \"How do I get started?\",", "q: \"How do I get started?\",")
content = content.replace("answer: \"Just create an account and you can start exploring features.\"", "a: \"Just create an account and you can start exploring features.\"")

with open('frontend/src/screens/Home.jsx', 'w') as f:
    f.write(content)
