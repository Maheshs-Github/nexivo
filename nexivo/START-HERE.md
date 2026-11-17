# Start here: run the Nexivo website on your computer

Follow the steps in order. You only do Part 1 once.

---

## Part 1: Install these programs (one time only)

1. **Node.js**
   - Go to https://nodejs.org
   - Download the **LTS** version and install it (keep clicking **Next**).

2. **Docker Desktop** (this runs the database)
   - **Windows only, do this first:**
     - Click Start, type **PowerShell**, right-click it and choose **Run as administrator**.
     - Type `wsl --install` and press Enter.
     - When it finishes, **restart your computer**.
   - Go to https://www.docker.com/products/docker-desktop/
   - Download Docker Desktop, install it and open it.
   - Wait until it says **"Engine running"** (bottom left). Leave Docker open.

3. **VS Code** (optional, but easier)
   - Download it from https://code.visualstudio.com and install it.

---

## Part 2: Prepare the project (one time only)

1. **Unzip** the file somewhere simple, for example `C:\projects\nexivo`.
   - Do **not** put it on the Desktop or in Documents if they sync to OneDrive.
   - Avoid folder names with spaces.

2. **Open a terminal in that folder**
   - In VS Code: **File → Open Folder** → pick the `nexivo` folder → **Terminal → New Terminal**.
   - Or: open the folder in File Explorer, click the address bar, type `powershell` and press Enter.

3. **Create the two settings files** by copying the examples:

   Windows (PowerShell):
   ```
   Copy-Item server\.env.example server\.env
   Copy-Item client\.env.example client\.env
   ```
   Mac:
   ```
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Start the database:**
   ```
   npm run db:up
   ```
   The first time, it downloads MySQL and can take a few minutes.

5. **Install everything and fill the database with sample content:**
   ```
   npm run setup
   ```
   It takes a few minutes. Wait until it shows a table of numbers and the words **"Seed complete."**

> If PowerShell says **"running scripts is disabled"**, run this once and try again:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

---

## Part 3: Run the website (every day)

1. Open **Docker Desktop** and wait for "Engine running".
2. In the project terminal, type:
   ```
   npm run db:up
   npm run dev
   ```
3. Open your browser:
   - Website: **http://localhost:5173**
   - Admin panel: **http://localhost:5173/admin**

   | Login | Email | Password |
   |---|---|---|
   | Admin | admin@nexivo.dev | Admin@12345 |
   | Editor | editor@nexivo.dev | Editor@12345 |

4. **To stop:** click in the terminal and press **Ctrl + C**, then type:
   ```
   npm run db:down
   ```

---

## Try the "live edit" magic

1. Go to **/admin** and log in as Admin.
2. Click **Pages & sections** → **Home** → click **Hero**.
3. Change the headline and click **Save section**.
4. Open the website and refresh: your new headline is there.

You can also write a blog post (**Blog posts → New post → Publish**), add a job (**Jobs**), or change the brand colour (**Site settings → Theme**).

---

## Something went wrong?

| Problem | Fix |
|---|---|
| `npm` is not recognized | Node.js isn't installed, or the terminal was open before installing. Close it and open a new one. |
| `docker` is not recognized / cannot connect | Open Docker Desktop and wait for "Engine running". |
| `port 3306 is already allocated` | Another MySQL is running (for example XAMPP). Stop it, or in `docker-compose.yml` change `3306:3306` to `3307:3306`, and in `server/.env` change `localhost:3306` to `localhost:3307`. |
| Website says "We couldn't load this" | The API isn't running. Make sure `npm run dev` is still running and showing no red errors. |
| Login says "Too many sign-in attempts" | Wait one minute and try again. |
| Want to start completely fresh | `docker compose down -v`, then `npm run db:up` and `npm run setup` (this **deletes** all data). |

To check that everything works, open a second terminal while `npm run dev` is running and type:
```
npm run test:api
```
It should end with **"0 failed"**.

More details (deploying it online for free, the architecture and more) are in **README.md**.
