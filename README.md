Sharescape is a Twitter-like social media app that I created to display my usage of web development technologies.

Users can sign up, login, edit their profile, create posts, delete posts, like posts, comment on posts, follow other users, receive notifications and send messages. To achieve this I have used the MERN stack as the backbone for my project.

Local authentication is handled by receiving an email, username and password from a user. After the information is validated and the password is hashed with bcrypt the user is saved in the database. On each login or sign up a JSON Web Token is sent to the client and stored in a http-only cookie. The cookie is then sent with every request that a user makes to the backend and the token is verified to ensure that they are authorized to perform CRUD operations.

Users also have the option to login or sign up using Google's OAuth 2.0. On successful verification a JSON Web Token is sent to the client to verify subsequent requests.

Real-time messaging is implemented using socket.io. When two users connect to the same conversation they will be able to send each other messages instantly. The users are verified so nobody else receives the messages. Conversations can be started by going to a users profile page and clicking on the message button.

The news section on the right contacts newsapi.org and updates with the most recent top news.
