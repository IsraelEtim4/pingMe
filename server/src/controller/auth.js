import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
  const { email, password, username } = req.body;

  try {
    
    // Check if all fields are provided
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required!"})
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must have at least 8 characters"})
    }

    // Checking proper email arrangement
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists! Try another"});
    }
    const existingEmail = await User.findOne({ email});
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists! Try another" });
    }

    // Else, generate a random image, create a new user, send a JWT token and cookies
    const imageId = Math.floor(Math.random() * 100) + 1; // generate a number between 1 and 100
    const profileImage = `https://avatar.iran.liara.run/public/${imageId}.png`;

    const newUser = await User.create({
      email,
      password,
      username,
      profilePicture: profileImage,
    })

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.username,
        image: newUser.profilePicture || "",
      });
      console.log(`Stream user created for ${newUser.username}`);
    } catch (error) {
      console.log("Error creating stream user", error);
    }

    const token = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET_KEY, {
      expiresIn: "7days"
    })
    
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attack
      sameSite: "strict", // prevent CSRF attack
      secure: process.env.NODE_ENV === "production"
    });
    
    // res.send(201).json({success: true, user:newUser}); // This is the actual response format
    res.status(201).json({
      message: "User created successfully!",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        profilePicture: newUser.profilePicture,
      }
    });

  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" })
    }
  
    // Checking email or password
    const currentEmail = await User.findOne({ email })
    if (!currentEmail) return res.status(401).json({ message: "Invalid email or password!" })

    // if (username && currentEmail.username !== username) {
    //   return res.status(401).json({ message: "Invalid email/username or password!" });
    // }
  
    const isPasswordCorrect = await currentEmail.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password"});
  
    const token = jwt.sign({ userId: currentEmail._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7days"
    });
  
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  
    res.status(200).json({ success: true, currentEmail });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error!" })
  }
};

export async function logout(req, res) {
  res.clearCookie("jwt")
  res.status(200).json({ success: true, message: "Logout Successfully" });
};

export async function onboard(req, res) {
  
  try {
    const userId = req.userDetails._id;

    const { username, bio, learningLanguage, nativeLanguage, location } = req.body;
    
    if (!username || !bio || !learningLanguage || !nativeLanguage || !location ) {
      return res.status(401).json({ 
        message: "All fields are required!",
        missingFields: [
          !username && "username",
          !bio && "bio",
          !learningLanguage && "learningLanguage",
          !nativeLanguage && "nativeLanguage",
          !location && "location",
        ].filter(Boolean),
      })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body, // instead of writing all the data needed from the body, like above, use ...
      isOnboarded: true,
    }, {new: true})

    if (!updatedUser) return res.status(401).json({ message: "User not found" })

    try {
      // Update the Stream user with the new details
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.username,
        image: updatedUser.profilePicture || "",
      });
      console.log(`Stream user updated after onboarding ${updatedUser.username}`);
    } catch (streamError) {
      console.log("Error updating stream user", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("Onboarding Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
