# Scrub It - Landing Page

This is the landing page for **Scrub It**, a modern, sleek website built with pure HTML, CSS, and vanilla JavaScript. 

## How to run it locally

Because this project is built with static files, there is no build step required. However, you must run it through a local web server (rather than simply double-clicking `index.html`) so that CORS and module loading work correctly.

### Step 1: Clone the repository
Clone the repo and navigate into the landing page directory:
```bash
git clone <your-repo-url>
cd "Scrub It."/landing-page
```

### Step 2: Start a local web server
You can use any local web server you prefer. Here are a few quick options:

**Option A: Using Python (Mac/Linux/Windows)**
If you have Python installed, you can easily start a server:
```bash
python3 -m http.server 3000
```
*(If you are on an older version of Python, use `python -m SimpleHTTPServer 3000`)*

**Option B: Using Node.js (npx)**
If you have Node installed, you can use the `serve` package:
```bash
npx serve -p 3000
```

**Option C: Using VS Code Live Server Extension**
If you use Visual Studio Code, simply install the "Live Server" extension, right-click `index.html`, and select **Open with Live Server**.

### Step 3: View the website
Open your favorite browser and navigate to:
[http://localhost:3000](http://localhost:3000)

That's it! The website will now be up and running.
