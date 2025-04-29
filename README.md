# **Notes App Explanation (For Future You)**  

Hey Future Me!   
This is a **simple breakdown** of your **Express.js + MongoDB** authentication app.  

---
notes-app/
├── app.js                # Main application entry
├── config/
│   └── db.js             # Database connection
├── models/
│   └── user.models.js    # User schema/model
└── routes/
    ├── user.routes.js    # User-related routes
    └── index.route.js    # General routes (e.g., home)

## **1. How It Works (Big Picture)**  
You built a **login/register system** where:  
 Users can **sign up** (email, username, password).  
 Users can **log in** (username + password).  
 Passwords are **hashed** (not stored in plain text).  
 Logged-in users get a **JWT token** (like a digital key).  

---

## **2. Key Files & What They Do**  

### **📄 `app.js` (Main Server File)**  
```javascript
import express from 'express';
import userRouter from './routes/user.routes.js'; // User auth routes
import indexRouter from './routes/index.route.js'; // Simple routes (like home)

const app = express();

// Middleware (Helpers)
app.use(express.json()); // Parse JSON data (like from forms)
app.use(cookieParser()); // Read cookies (for JWT tokens)

// Routes
app.use('/user', userRouter); // All user auth routes (login/register)
app.use('/', indexRouter); // Simple routes (like /home)

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```
**What it does:**  
- Starts the server.  
- Uses **middleware** to handle JSON/cookies.  
- Connects **routes** (`/user` for auth, `/` for home).  

---

### **📄 `user.routes.js` (Handles Login/Register)**  
#### **Register (`/user/register`)**
```javascript
router.post('/register', 
  // Validate inputs (email, password, username)
  [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('username').isLength({ min: 3 })
  ],
  async (req, res) => {
    // 1. Hash password (so it's secure)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // 2. Save user to DB
    const user = await userModel.create({
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword // Store HASHED password, not plain text!
    });

    res.json(user); // Send back user data
  }
);
```

#### **Login (`/user/login`)**
```javascript
router.post('/login', 
  // Validate inputs
  [
    body('username').exists(),
    body('password').exists()
  ],
  async (req, res) => {
    // 1. Find user in DB
    const user = await userModel.findOne({ username: req.body.username });
    if (!user) return res.status(400).send("User not found");

    // 2. Compare passwords (hashed vs input)
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password, // User input
      user.password // Hashed password from DB
    );
    if (!isPasswordCorrect) return res.status(400).send("Wrong password");

    // 3. Create JWT token (like a digital ID card)
    const token = jwt.sign(
      { userId: user._id }, // Store user ID in token
      process.env.JWT_SECRET // Secret key (from .env)
    );

    // 4. Send token as a cookie (secure way)
    res.cookie('token', token, { httpOnly: true });
    res.send("Logged in!");
  }
);
```
**What it does:**  
- **Register:** Saves users with **hashed passwords**.  
- **Login:** Checks passwords & gives a **JWT token** (stored in cookies).  

---

### **📄 `user.models.js` (User Database Schema)**  
```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // No duplicate usernames
    trim: true,   // Removes extra spaces
    minlength: 3  // At least 3 chars
  },
  email: {
    type: String,
    required: true,
    unique: true, // No duplicate emails
    trim: true,
    minlength: 13
  },
  password: {
    type: String,
    required: true,
    minlength: 5  // At least 5 chars
  }
});
```
**What it does:**  
- Defines **how users are stored in MongoDB**.  
- Ensures no duplicates (`unique: true`).  
- Sets **minimum lengths** for security.  

---

### **📄 `db.js` (Database Connection)**  
```javascript
export default async function connectToDb() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB!");
}
```
**What it does:**  
- Connects to **MongoDB** using the URL in `.env`.  

---

## **3. Key Security Features**  
 **Hashed Passwords** (`bcrypt`) → No plain-text passwords in DB.  
 **JWT Tokens** → Secure way to check if a user is logged in.  
 **Cookie Storage** → Tokens stored safely (not in local storage).  
 **Input Validation** → No weak passwords or fake emails.  

---

## **4. Flow of a User’s Journey**  
1. **Sign Up** → Password hashed → Saved in DB.  
2. **Log In** → Checks password → Gives JWT token.  
3. **Access Protected Routes** → Server checks token → Grants access.  

---

## **5. For Future Improvements**  
- Add **logout** (delete cookie).  
- Add **password reset**.  
- Protect routes (like `/profile`) with **JWT checks**.  

---

### **Final Note**  
This is a **solid foundation** for authentication!  
You can now **add notes functionality** by:  
1. Creating a `notes.model.js` (for notes data).  
2. Adding `notes.routes.js` (to save/fetch notes).  
3. Protecting routes so only logged-in users can access them.  

