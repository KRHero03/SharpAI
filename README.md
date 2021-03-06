![SharpAI](./sharp-ai-webapp/src/logo.png)
# SharpAI Anti Cheat

### Gotta Catch 'Em All 
Amidst the Coronavirus Pandemic, it has been a troublesome task for Teachers and Faculties to conduct Online examinations. (Certainly, when they are gifted with students like us who somehow manage to score precisely the identical scores).

We bring a solution to tackle this problem. Sharp AI Anti Cheat Exam Proctoring Tool is a Chrome Extension (for Students) with an interactive and User-Friendly Web App for Teachers. Teachers can schedule Proctoring Sessions for their students to have a fair Exam
Some of the salient features of our Product are as follows:
- Chrome extension for Students that tracks their activities during examinations such as tab switches, window switches, resizing windows, downloading items, etc.
- Deployed ML Model that monitors User Face and Eyes for Suspicious activities
- Web App for Teachers where they can handle Classes and Exam Proctoring sessions seamlessly
- Options to get Statistics and Report for Students during examinations and flag notorious students
- Persistent Data of all Classes and Examinations saved in Database
- Google OAuth System so that Exams are only attempted by those meant to do so.

We hope you like the Product and we hope to have a larger user base in future :)

(PS : For all those who saw the video, we forgot to show you guys how the CSV looks like. Here's the file (no, we didn''t modify it) : https://docs.google.com/spreadsheets/d/1sKsA0cacXlb8KMm904hcPIjxfU8eo6g3wTGj8UQhnvE/edit?usp=sharing

### Challenges we ran into

Some of the challenges we ran into:

- Fetching the Permissions from users while accessing their Webcam in Chrome Extension
- Managing Webcam Surveillance in an Effective way
- Maintaining Data so that the WebApp can be scalable later
- Trying to localise the Deployment Model (we failed this one but we ll do it in future)
- Managing to make the UI as User friendly and easy to access and handle as possible
- Syncing flags with Remote Database at regular Intervals


### Deployed:

- WebApp Deployment : https://sharp-ai.herokuapp.com
- Extension is not deployed. You ll need to use it from the repository
- ML Model is not deployed. You ll need to use it from the repository


### Steps to Run

Follow the Instructions to clone the Repository:
```
git clone https://github.com/KRHero03/SharpAI.git
```

Run Web App locally:
```
cd sharp-ai-webapp
npm install 
npm run
```

Run Chrome Extension:
- Head over to Chrome > Settings > Extensions
- Turn on Developer Mode
- Click on Load Unpacked Extension
- Select sharp-ai-extension/build as Extension Directory
- Use the Extension

## Team DevDevils
