# Whatsabi (WIP)
A single-page application to let users know more about their Whatsapp usage.
This app take a file an analyze the content to extract messages, organize them and print
interesting charts with metrics. It also restructure the conversation in a like-Whatsapp layout.
It include keywords and relationship analysis.

In its first version will only admit insert files extracted from Whatsapp.
For future version it will has an owner email server so the user can send the conversation directly
from its mobile phone.

## Main classes:
### Whatsabi
Its main role is to parse a text and to give it correct format so the app
can create a Conversation object that the rest of modules can manage.
Singleton pattern.

### AuthorAnalyzer
This class user a graph as data structure to abstract the interactions between users.
This way we can get metrics as followers, followings or low-interaction users.

### KeywordAnalyzer
Instance of KeywordTree to analyze the conversation and find the topics and the
most common word of each user.

### Conversation
Conversation class models a chat between different persons. This class will be
responsible for sort the message and format them for analysis.
This class stores the messages in two different data structures:

- Queue: Each message has a reference to the next. This class has pointers to the
first one and the last one. This way we can have direct access to the full conversation.

- Array of days: In this array we store instances of Day, days have 24 properties, one for
each hour in a day. This way, each index in the array represents a day. Index 0 represent the
day of the first message. With this data structure we can have direct access to each day-hour
like this: Array[day - firstDay][12]

### Message
This class models each message in the conversation. This class includes a
pointer to the next message so it can work as a node in a queue.

### Author
This class models each user in the conversation. This class includes main metrics
related to the user.

## To-do:
- Abstract functions in main.js file.
- Configure SnapChart charts to print correctly in the main container.
- Print main metrics in html. Animate the process.
- Add icons to buttons.
- Implement a scroll-loader to keywords list to make html lighter.
- Develop email server to analyzer conversation sent by email.
- Abstract system to admit any kind of conversation or interaction between users.